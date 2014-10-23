/**
 * RTE Connector 
 *
 * @author Lewis Stewart
 *
 * (c) Crocodile Clips Ltd
 *
 */
function ApiConnector() {}
ApiConnector.prototype = 
{
	_log:  null,
	_opts: { maxDepth: 20, defaultVersion: "2004" },
	_adapter:  null,
	_navigation: null,
		
	init: function(v)
	{
		this._log = new ApiConnector.Logger( "Error", true );	
		this.attach( v!==null ? v : this._opts.defaultVersion );
		this._log.assert( (this._adapter), "Unable to locate api." );
		this._navigation = new ApiConnector.Navigation( this._adapter, this._log );
	},
	
	attach: function(v)
	{
		var apis = [];
		
		apis = this.search( window, apis );
		
		if( apis.length===0 && window.top.opener )
		{ 
			apis = this.search( window.top.opener, apis ); 
		} 
		
		if( apis[v] )
		{
			this._adapter = new ApiConnector.Adapter( v, apis[v], this._log );
		}	
	},

	search: function( w, apis )
	{
		var i = 0, max = 20;
		while( true )
		{
			if( w.API )
			{
				apis['1.2'] = w.API;
			}
			
			if( w.API_1484_11 )
			{
				apis['2004'] = w.API_1484_11;
			}
			
			if( apis.length!==0 || w.parent===null || w.parent==w || i > max ) 
			{
				break;
			}
			
			w = w.parent;
			i++;
		}
		return apis;
	},

	getApi: function()
	{
		return this._adapter;
	},
	
	getNavigation: function()
	{
		return this._navigation;
	}	
};

ApiConnector.Logger = function( level, fatal ) 
{
	this._level = this._levels[level];
	this._fatal = fatal;
	if( window.console )
	{
		this._out = window.console;
	}
	else
	{
		this._out = this._create();
	}
};

ApiConnector.Logger.prototype = 
{
	_fatal:  true,
	_level:  "Info",
	_levels: {"Trace":1,"Debug":2,"Info":3,"Warn":4,"Error":5},
	_out: null,
	
	_log: function(msg,lvl)
	{
		if( this._levels[lvl] >= this._level )
		{
			this._out.log( lvl + ": " + msg );	
		}	
	},
	
	trace: function(msg) { this._log( msg, "Trace" ); },
	debug: function(msg) { this._log( msg, "Debug" ); },
	info:  function(msg) { this._log( msg, "Info"  ); },
	warn:  function(msg) { this._log( msg, "Warn"  ); },
	error: function(msg) { this._log( msg, "Error" ); },
		
	assert: function( assertion, msg, result )
	{
		if( !assertion ) 
		{
			if( result )
			{
				msg += result.toErrorString();
			}
			
			this.error( msg );
			
			if( this._fatal )
			{
				throw new Error( msg );
			}
		}    	
	},
	
	_create: function()
	{
		var console = {};

		console.log = function( msg )
		{ 
			this.data.innerHTML += '<br/>' + msg;
		};
		
		console.data = document.createElement( 'div' );
		console.data.style.fontSize = "smaller";
		console.data.style.textAlign = "left";		
		console.data.style.backgroundColor = "white";
		
		document.body.appendChild( console.data );

		return console;
	}	
};

ApiConnector.Navigation = function( adapter, log )
{
	this._log = log;
	this._adapter = adapter;
};

ApiConnector.Navigation.prototype =
{
	_log: null,
	_adapter: null,
	
	canPrevious: function()
	{
		return this._adapter.GetValue( "adl.nav.request_valid.previous" );
	},

	canContinue: function()
	{
		return this._adapter.GetValue( "adl.nav.request_valid.continue" );
	},

	doPrevious: function()
	{
		this._adapter.SetValue( "adl.nav.request", "previous" );
		this._adapter.SetValue( "cmi.completion_status", "incomplete" );
		this._adapter.Terminate();
	},

	doContinue: function()
	{
		this._adapter.SetValue( "adl.nav.request", "continue" );
		this._adapter.SetValue( "cmi.completion_status", "incomplete" );
		this._adapter.Terminate();
	}	
};

ApiConnector.Adapter = function( v, handle, log )
{
	this._log = log;
	
	this._versions = 
	{ 
		"2004": ApiConnector.Adapter.v13, 
		"1.2":  ApiConnector.Adapter.v12 
	};
	
	if( this._versions[v] )
	{
		this._delegate = new this._versions[v]( handle );
	}    
};

ApiConnector.Adapter.prototype =
{
	_log: null,
	_delegate: null,
	_active: false,
	_versions: {},

	Available: function()
	{
		return (this._delegate!==null);
	},

	Active: function()
	{
		return this._active;
	},

	Initialize: function()
	{
		if( this._active )
		{
			return true;
		}
		
		var res;
		try
		{
			res = new this.ApiCall( this, this._delegate.Initialize, [""], null, null, this._log );
		}
		catch( e )
		{
			// be slightly tolerant to strange conditions here
			if( !res || res.code!=103 )
			{
				this._log.assert( (res && !res.isError()), "Api::Initialize: Failed", res );
			}				
		}
		
		this._active = true;
		return res.boolValue();
	},	

	Terminate: function()
	{
		this._log.assert( this.Active(), "Api::terminate: Api not active." );
		var res = new this.ApiCall( this, this._delegate.Terminate, [""], null, null, this._log );
		this._log.assert( !res.isError(), "Api::Terminate: Failed", res );	
		this._active = false;			
		return res.boolValue();			
	},

	GetValue: function(p)
	{
		this._log.assert( this.Active(), "Api::GetValue: Api not active." );
		var res = new this.ApiCall( this, this._delegate.GetValue, [p], null, null, this._log );
		this._log.assert( !res.isError(), "Api::GetValue: Failed", res );	
		return res.stringValue();			
	},	

	SetValue: function(p,v)
	{
		var res;
		this._log.trace("Api::SetValue");
		this._log.assert( this.Active(), "Api::SetValue: Api not active." );
		try
		{
			res = new this.ApiCall( this, this._delegate.SetValue, [p,v], null, null, this._log );
		}
		catch( e )
		{
			this.Terminate();
			this._log.assert( !res.isError(), "Api::SetValue: Failed", res );
		}
		return res.boolValue();
	},	

	Commit: function()
	{
		this._log.assert( this.Active(), "Api::SetValue: Api not active." );
		var res = new this.ApiCall( this, this._delegate.Commit, [""], null, null, this._log );
		this._log.assert( !res.isError(), "Api::Commit: Failed", res );		
		return res.boolValue();
	},

	GetLastError: function()
	{
		this._log.assert( this.Available(), "Api::GetLastError: No api available." );
		var res = new this.Result( this._delegate.GetLastError() );
		return res.intValue();			
	},

	GetErrorString: function(e)
	{
		this._log.assert( this.Available(), "Api::GetErrorString: No api available." );
		var res = new this.Result( this._delegate.GetErrorString(e) );
		return res.stringValue();			
	},

	GetDiagnostic: function(e)
	{
		this._log.assert( this.Available(), "Api::GetDiagnostic: No api available." );
		var res = new this.Result( this._delegate.GetDiagnostic(e) );
		return res.stringValue();			
	},		

	ApiCall: function( api, method, params, callback, errback, log )
	{
		var result = null;
		
		// we require an api
		api._log.assert( api.Available(), "No api available." );	

		// execute the specified api method
		try
		{	
			if( params )
			{
				result = new api.Result( method.apply( api._delegate, params ) );
			}	
			else
			{
				result = new api.Result( method.apply( api._delegate ) );
			}	
		}
		catch( ee )
		{
			api._log.error( "Error calling api method." );
			throw ee;
		}

		// store info about the exit state
		try
		{
			result.code = new api.Result( api.GetLastError() ).intValue();
		}
		catch( se )
		{
			api._log.error( "Unable to get error code." );			
		}

		// if there was an error, get more info
		if( result.isError() )
		{
			try
			{
				result.errorInfo = new api.Result( api.GetErrorString(result.code) ).stringValue();
			}
			catch( ie )
			{
				api._log.error( "Unable to get error info." );
			}

			try
			{
				result.errorDiag = new api.Result( api.GetDiagnostic(result.code) ).stringValue();
			}
			catch( de )
			{
				api._log.error( "Unable to get error diagnostic info." );			
			}

			if( errback!==null )
			{
				errback();
			}			
		}	

		
		// perform any success callback
		if( callback!==null )
		{
			callback();
		}
		

		return result;
	},	

	Result: function( v )
	{
		this.v = v;
		this.code = null;
		this.errorInfo = null;
		this.errorDiag = null;
		
		this.isError = function()
		{
			return this.code!==0;
		};
		
		this.boolValue = function()
		{
			if( this.v===null ) 
			{
				return null;
			}
			if( /true|yes|1/i.test(this.v) )
			{
				return true;
			}	
			if( /false|no|0/i.test(this.v) )
			{
				return false;
			}	
			return Boolean(s);
		};

		this.stringValue = function()
		{
			if( this.v===null ) 
			{
				return null;		
			}	
			return String(this.v);
		};

		this.intValue = function()
		{
			if( this.v===null ) 
			{
				return null;		
			}	
			return parseInt(this.v,10);
		};	
		
		this.toErrorString = function()
		{
			var str = "[";
			str += "result=" + (this.v?this.v:"undefined") + "; ";
			str += "code="   + (this.code?this.code:"undefined") + "; ";
			str += "info="   + (this.errorInfo?this.errorInfo:"undefined") + "; ";
			str += "diag="   + (this.errorDiag?this.errorDiag:"undefined") + "; ";
			str += "]";
			return str;
		};
	}		
};		

ApiConnector.Adapter.v12 = function( handle )
{
	this._handle = handle;
};

ApiConnector.Adapter.v12.prototype =
{
	_handle: null,
	
	Initialize: function(p)
	{
		return this._handle.LMSInitialize(p);
	},	        	

	Terminate: function(p)
	{
		return this._handle.LMSFinish(p);
	},

	GetValue: function(p)
	{
		return this._handle.LMSGetValue(p);
	},

	SetValue: function(p,v)
	{
		return this._handle.LMSSetValue(p,v);
	},

	Commit: function(p)
	{
		return this._handle.LMSCommit(p);
	},	

	GetLastError: function()
	{
		return this._handle.LMSGetLastError;
	},

	GetErrorString: function(e)
	{
		return this._handle.LMSGetErrorString(e);
	},

	GetDiagnostic: function(e)
	{
		return this._handle.LMSGetDiagnostic(e);
	}
};

	
ApiConnector.Adapter.v13 = function( handle )
{
	this._handle = handle;
};

ApiConnector.Adapter.v13.prototype = 
{	
	_handle: null,
	
	Initialize: function(p)
	{
		return this._handle.Initialize(p);
	},   

	Terminate: function(p)
	{
		return this._handle.Terminate(p);
	},

	GetValue: function(p)
	{
		return this._handle.GetValue(p);
	},

	SetValue: function(p,v)
	{
		return this._handle.SetValue(p,v);
	},

	Commit: function(p)
	{
		return this._handle.Commit(p);
	},

	GetLastError: function()
	{
		return this._handle.GetLastError();
	},

	GetErrorString: function(e)
	{
		return this._handle.GetErrorString(e);

	},

	GetDiagnostic: function(e)
	{
		return this._handle.GetDiagnostic(e);
	}
};
