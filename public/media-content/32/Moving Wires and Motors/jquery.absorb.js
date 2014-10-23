/**
 * Absorb Support Plugins
 *
 * @author Lewis Stewart
 *
 * (c) Crocodile Clips Ltd
 *
 */

//
// Initialisation
//
var ccConnector;

$(document).ready( 
	function() 
	{
		ccConnector = new ApiConnector();
		ccConnector.init("2004");
		ccConnector.getApi().Initialize();
	} 
);

$(document).ready( function() { $('.aq').aq(); } );
$(document).ready( function() { $('.glossterm').agt(); } );
$(document).ready( function() { $('.fs').afs(); } );
$(document).ready( function() { $('.embedded').media(); } );
$(document).ready( function() { $('.navnext,.navprev').an( {method:"sco", connector: ccConnector} ); } );

//
// Fullscreen Support
//
;(function($) {	

	var opts;
	
	$.fn.afs = function( options )
	{
		// build options
		var opts = $.extend( {}, $.fn.afs.defaults, options );

		$.fn.afs.connector = opts.connector;

		return this.each( 
			function() 
			{
				var btn = $(this);				
				var o = $.metadata ? $.extend( {}, opts, btn.metadata() ) : opts;

				var media = $('#'+o.idref);
				var md = media.metadata();
				var width = md.width;
				var height = md.height;
				var src = media.attr("href");
				var title = media.attr("title");
				
				btn.click(
					function()
					{
						$.fn.afs.fs( src, title, width, height );
					}
				);

			}
		);
	};
	
	$.fn.afs.fs = function( src, title, width, height )
	{
		var url = "fullscreen.html?"
					+ "src=" + src
					+ "&title=" + title
					+ "&w=" + width
					+ "&h=" + height;

		var win;

		if( $.browser.msie && ( new Number($.browser.version) >= 6 ) )
		{
			win = window.open( url, '', 'fullscreen=yes, scrollbars=auto, resizable=yes' );
		}
		else
		{
			win = window.open( url, '', 'width=' + (screen.width-5) + ',height=' + (screen.height-30) + ', scrollbars=auto, resizable=yes, ' );
		}

		if( win==null )
		{
			alert( "Your browser blocked the popup window used to display this item fullscreen." );
			return false;
		}

		if( window.focus )
		{
			win.focus();
		}

		return false;
	};	
	
})(jQuery);

//
// Storage Support
//
;(function($) {	

	var opts;

	$.fn.ap = function( options ) 
	{
		opts = $.extend( {}, $.fn.ap.defaults, options );
		return $.fn.ap.persisters[opts.method];
	};
	
	$.fn.ap.DefaultPersister = 
	{
		load: function() 
		{ 
			return {};
		},
		
		save: function( hash ) 
		{ 
			// noop
		}
	};
	
	$.fn.ap.CookiePersister = 
	{
		load: function() 
		{ 
			return decode( this.getCookie( opts.name ) );
		},
		
		save: function( hash ) 
		{ 
			this.setCookie( opts.name, encode( hash ), opts.duration );
		},
		
		setCookie: function( name, val, len )
		{
			if( val )
			{
				var exp = new Date();
				exp.setDate( exp.getDate() + len );
				var ck = name + "=" + escape(val) + ";expires=" + exp.toGMTString();
				document.cookie = ck;
			}	
		},

		getCookie: function( name )
		{
			if( document.cookie.length>0 )
			{
				var start = document.cookie.indexOf( name+"=" )
				if( start!=-1 )
				{ 
					start = start + name.length+1; 
					end = document.cookie.indexOf( ";", start );
					if( end==-1 ) end = document.cookie.length;
					var val = unescape( document.cookie.substring(start,end) );
					return val;
				} 
			}
			return null;
		}			
	};
	
	$.fn.ap.ApiPersister = 
	{
		save: function( hash ) 
		{ 
			alert( "not implemented" ); 
		},
		
		load: function() 
		{ 
			alert( "not implemented" ); 
		}
	};	

	$.fn.ap.persisters = 
	{
		noop:   $.fn.ap.DefaultPersister,
		cookie: $.fn.ap.CookiePersister,			
		api:    $.fn.ap.ApiPersister
	};

	function encode( hash )
	{
		return hash ? $.toJSON( hash ) : null;
	};

	function decode( str )
	{
		return str ? $.parseJSON( str ) : {};
	};
	
	$.fn.ap.defaults = 
	{
		method: "noop",
		name: "ABSORB",
		duration: 360
	};		
	
})(jQuery);

//
// SCORM RTE Support
//

//
// Absorb Navigation Support
// 
;(function($) {

	$.fn.an = function( options )
	{
		// build options
		var opts = $.extend( {}, $.fn.an.defaults, options );

		$.fn.an.connector = opts.connector;

		// apply to each link
		return this.each( 
			function() 
			{
				var a = $(this);				
				var o = $.metadata ? $.extend( {}, opts, a.metadata() ) : opts;

				if( o.method=="sco" )
				{
					if( a.hasClass("navprev") )
					{
						if( $.fn.an.canPrevious() )
						{
							a.click( $.fn.an.doPrevious );
						}
						else
						{
							a.hide();
						}
					}	
					else if( a.hasClass("navnext") )
					{
						if( $.fn.an.canContinue() )
						{
							a.click( $.fn.an.doContinue );
						}
						else
						{
							a.hide();
						}					
					}
				}
				else if( o.method=="local" )
				{
					// don't modify navigation
				}
			}
		);
	};
	
	$.fn.an.canPrevious = function()
	{
		return $.fn.an.connector.getNavigation().canPrevious();
	};
	
	$.fn.an.canContinue = function()
	{
		return $.fn.an.connector.getNavigation().canContinue();
	};	

	$.fn.an.doPrevious = function()
	{
		$.fn.an.connector.getNavigation().doPrevious();
		return false;
	};
	
	$.fn.an.doContinue = function()
	{
		$.fn.an.connector.getNavigation().doContinue();
		return false;		
	};	
	
	$.fn.an.defaults = 
	{
		method: "local"
	};	
})(jQuery);


//
// Page Section Support
//
;(function($) {

	$.fn.ps = function( options ) 
	{	
		// build options
		var opts = $.extend( {}, $.fn.ps.defaults, options );

		// apply to each section
		return this.each( 
			function() 
			{
				var p = $(this);				
				var o = $.metadata ? $.extend( {}, opts, p.metadata() ) : opts;
				p.attr( "display", "none" );	
			}
		);
	}
	
})(jQuery);

//
// Absorb Glossary Term Support
//
;(function($) 
{
	$.fn.agt = function( options ) 
	{
		// build options
		var opts = $.extend( {}, $.fn.agt.defaults, options );
				
		// apply to each glossary link
		return this.each( 
			function() 
			{
				var agt = $(this);				
				var o = $.metadata ? $.extend( {}, opts, agt.metadata() ) : opts;
				
				agt.hover(
					function()
					{
						agt.addClass( "glosstermover" );
					},
					
					function()
					{
						agt.removeClass( "glosstermover" );
						var id = agt.attr("id");
						id = id.substring(0,id.length-1);
						$( '#' + id ).removeClass( "glosstipover" ).hide();
					}
				);
				
				agt.click(
					function()
					{
						var id = agt.attr("id");
						id = id.substring(0,id.length-1);
						$( '#' + id ).addClass( "glosstipover" ).show();						
					}
				);	
			}
		);
	};

	$.fn.agt.highlight = function()
	{
	}

	$.fn.agt.show = function()
	{
		
	};
	
	$.fn.agt.hide = function()
	{
		
	};

	$.fn.agt.defaults = 
	{
		hoverclass: "glosstipover"
	};				

})(jQuery);


//
// Question Support
//
;(function($) {

	/**
	 * Attach to questions:
	 * - Restore state if required.
	 * - Register listeners for equals button click.
	 */
	$.fn.aq = function( options ) 
	{
		// build options
		var opts = $.extend( {}, $.fn.aq.defaults, options );
		
		// configure storage
		var unit = $('body').attr("id");
		$.fn.aq.storage = $.fn.ap( { method: opts.storage, name: unit } );
				
		// apply to each question
		return this.each( 
			function() 
			{
				var aq = $(this);				
				
				// build local options
				var o = $.metadata ? $.extend( {}, opts, aq.metadata() ) : opts;
				
				// if answers turned on
				if( opts.answers )
				{
					// restore state
					$.fn.aq.restore( aq, o );
				
					// attach check button listeners		
					aq.find( 'img.checkbutton' ).click( 
						function() 
						{ 
							$.fn.aq.check( aq, o );
						} 
					);
					
					// hide feedback on answer changes
					aq.find( 'input,select' ).change(
						function()
						{
							$.fn.aq.resetFeedback( aq, o );
						}
					);	
				}
				else
				{
					aq.find( 'img.checkbutton' ).hide();
				}
			}
		);
	};

	/**
	 * Check a question (delegates to appropriate).
	 */
	$.fn.aq.check = function( q, o ) 
	{
		$.fn.aq.resetFeedback( q, o );	
		o.checks[o.type]( q, o );
		$.fn.aq.store( q, o );		
	};
	
	/**
	 * Check multiple choice
	 */
	$.fn.aq.checkmc = function( q, o ) 
	{
		// find the input the user has selected				
		var a = $("input:checked",q);
		
		// check the user actually entered an answer		
		if( a.length==0 )
		{
			alert("Please select an answer first.");
			return;		
		}
		else
		{
			a = a[0];
		}
		
		// set the indicator
		$.fn.aq.coach( a, o, ($(a).attr("id")==o.cid) );
	};
	
	/**
	 * Check matching pairs/fill the blanks.
	 */	
	$.fn.aq.checkma = function( q, o )
	{
		var correct = o.cid.split(";");
		$("select",q).each( 
			function(i) 
			{
				if( this.selectedIndex>0 )
				{
					$.fn.aq.coach( this, o, (this.selectedIndex==correct[i]) );
				}	
			}
		);
	}

	/** unused? */
	$.fn.aq.checkmr = function( q, o )
	{
		var correct = o.cid.split(";");
		$('select',q).each(
			function(i)
			{
				$.fn.aq.coach( this, o, (this.checked() && correct[i]=="1") );
			}
		)	
	}
	
	/**
	 * Check matching pairs/fill the blanks.
	
	$.fn.aq.checkfb = function( q, o )
	{		
		var i, ansimg;

		var correct = new Array();
			correct = cid.split(";");
			correct = myunshift( correct, "dummy" ); //Question elements numbered from one, arrays from 0, makes the same.

		// First hide all the answers if more than one
		if(range>1)
			hideAll( qid, range );

		// For each sub answer, check against corrects
		for(var i=1; i<correct.length; i++)
		{		
			ansimg = new ccElement( qid+"a"+i+"i" );

			// Is one of the sub answers correct
			temp = CBA.getElementById( qid+"a"+i );
			useranswer = temp.value;
			subanswers = correct[i].split('?');

			for( j=0; j<subanswers.length; j++ )
			{
				if( useranswer==subanswers[j] )
				{
					isCorrect=true;
					break;
				}
				isCorrect=false;
			}

			if( isCorrect )
			{
				// Set the correct icon
				ansimg.setCorrect();
			} else {
				// Set the incorrect icon
				ansimg.setIncorrect();
			}
			ansimg.show();
		}
	}
	 */	
	 /*
	$.fn.aq.checkma = function( q, o )
	{	
		var index=-1;

		var correct = new Array();
			correct = cid.split(";");
			correct = myunshift( correct, "ddummy" ); //Question elements numbered from one, arrays from 0, makes the same.

		// First hide all the answers
		hideAll( qid, range );

		// For each sub answer, check against corrects
		for(var i=1; i<=range; i++)
		{						
			ansimg = new ccElement( qid+"a"+i+"i" );
			temp = CBA.getElementById( qid+"a"+i );
			if( temp.selectedIndex == parseInt(correct[i]) )
			{
				// Set the correct icon
				ansimg.setCorrect();
			} else {
				// Set the incorrect icon
				ansimg.setIncorrect();
			}
			ansimg.show();
		}
	}

		
	$.fn.aq.checkes = function( q, o )
	{	
		var oAnsRow = document.getElementById((sId+'a'));
		oAnsRow.style.display = ( oAnsRow.style.display == "block" ) ? "none" : "block";
	}	
	*/
	/**
	 * Display correct/incorrect feedback.
	 */
	$.fn.aq.coach = function( a, o, f )
	{
		var img = $( "<img class='coach'/>" );
		img.attr( "src", f ? "layout/correct.gif" : "layout/incorrect.gif" );
		img.attr( "alt", f ? "Well done!" : "Try again!" );		
		img.attr( "title", f ? "Well done!" : "Try again!" );				
		$(a).parent().append( img );
	};

	$.fn.aq.resetFeedback = function( q, o )
	{
		$('.coach',q).remove();			
	};

	/**
	 * Store the state of this question.
	 */
	$.fn.aq.store = function( q, o )
	{
		var data = $.fn.aq.storage.load();
		var form = $('form',q);		
		if( !data.aq ) data.aq = {};
		data.aq[$(form).attr("id")] = $(form).serializeArray();
		$.fn.aq.storage.save(data);
	};

	/**
	 * Restore the state of this question.
	 */
	$.fn.aq.restore = function( q, o )
	{
		var data = $.fn.aq.storage.load();
		var form = $('form',q);
		if( data.aq )
		{
			var qd = data.aq[$(form).attr("id")];
			if( qd )
			{
				$(form).deserialize( qd );
				$.fn.aq.check( q, o );
			}	
		}	
	};

	/**
	 * Default options
	 */
	$.fn.aq.defaults = 
	{
		storage: 'noop',
		answers: true,
		checks: 
		{
			'mc': $.fn.aq.checkmc,
			'ma': $.fn.aq.checkma
		}
	};				
	
})(jQuery);

//
// JSON Support
//
(function ($) {
    var m = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        s = {
            'array': function (x) {
                var a = ['['], b, f, i, l = x.length, v;
                for (i = 0; i < l; i += 1) {
                    v = x[i];
                    f = s[typeof v];
                    if (f) {
                        v = f(v);
                        if (typeof v == 'string') {
                            if (b) {
                                a[a.length] = ',';
                            }
                            a[a.length] = v;
                            b = true;
                        }
                    }
                }
                a[a.length] = ']';
                return a.join('');
            },
            'boolean': function (x) {
                return String(x);
            },
            'null': function (x) {
                return "null";
            },
            'number': function (x) {
                return isFinite(x) ? String(x) : 'null';
            },
            'object': function (x) {
                if (x) {
                    if (x instanceof Array) {
                        return s.array(x);
                    }
                    var a = ['{'], b, f, i, v;
                    for (i in x) {
                        v = x[i];
                        f = s[typeof v];
                        if (f) {
                            v = f(v);
                            if (typeof v == 'string') {
                                if (b) {
                                    a[a.length] = ',';
                                }
                                a.push(s.string(i), ':', v);
                                b = true;
                            }
                        }
                    }
                    a[a.length] = '}';
                    return a.join('');
                }
                return 'null';
            },
            'string': function (x) {
                if (/["\\\x00-\x1f]/.test(x)) {
                    x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                        var c = m[b];
                        if (c) {
                            return c;
                        }
                        c = b.charCodeAt();
                        return '\\u00' +
                            Math.floor(c / 16).toString(16) +
                            (c % 16).toString(16);
                    });
                }
                return '"' + x + '"';
            }
        };

	$.toJSON = function(v) {
		var f = isNaN(v) ? s[typeof v] : s['number'];
		if (f) return f(v);
	};
	
	$.parseJSON = function(v, safe) {
		if (safe === undefined) safe = $.parseJSON.safe;
		if (safe && !/^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/.test(v))
			return undefined;
		return eval('('+v+')');
	};
	
	$.parseJSON.safe = false;

})(jQuery);

/*
		// Check multiple choice answers
		function check( qtype, qid, cid, range )
		{
			var i, ansimg, temp;
			var index=-1;
			
			// First hide all the answers if more than one
			if(range>1)
				hideAll( qid, range );

			// Find the input the user has selected
			for(var i=1; i<=range; i++)
			{
				temp = CBA.getElementById( qid+"a"+i );
				if( temp.checked )
				{
					index=i;
					break;
				}
			}
			
			// Check the user actually entered an answer
			if(index==-1)
			{
				alert("Please select an answer first.");
				return;
			}

			// Set the indicator
			ansimg = new ccElement( qid+"a"+index+"i" );

			if( (qid+"a"+index)==cid )
			{
				// Set the correct icon
				ansimg.setCorrect();
			} else {
				// Set the incorrect icon
				ansimg.setIncorrect();
			}
			ansimg.show();

		}

		// Check multiple choice answers
		function checkMR( qtype, qid, cid, range )
		{
			var i, ansimg, temp;

			var correct = new Array();
				correct = cid.split(";");
				correct = myunshift( correct, "dummy" ); //Question elements numbered from one, arrays from 0, makes the same.			

			// First hide all the answers if more than one
			if(range>1)
				hideAll( qid, range );

			// For each answer, if the user has selected check if it is right
			for(var i=1; i<=range; i++)
			{
				// Get the indicator
				ansimg = new ccElement( qid+"a"+i+"i" );
				temp = CBA.getElementById( qid+"a"+i );
				if( temp.checked )
				{
					// The user has selected this answer, so see if it is correct
					if(correct[i]=="1")
					{
						// Set the correct icon
						ansimg.setCorrect();
					} else {
						// Set the incorrect icon
						ansimg.setIncorrect();
					}
				} else {
					// The user has selected this answer, so see if it is correct
					if(correct[i]=="0")
					{
						// Set the correct icon
						ansimg.setCorrect();
					} else {
						// Set the incorrect icon
						ansimg.setIncorrect();
					}
				}
					ansimg.show();	
			}
		}
		
		// Check filltheblanks answers
		function checkFill( qtype, qid, cid, range )
		{
			var i, ansimg;

			var correct = new Array();
				correct = cid.split(";");
				correct = myunshift( correct, "dummy" ); //Question elements numbered from one, arrays from 0, makes the same.

			// First hide all the answers if more than one
			if(range>1)
				hideAll( qid, range );

			// For each sub answer, check against corrects
			for(var i=1; i<correct.length; i++)
			{		
				ansimg = new ccElement( qid+"a"+i+"i" );

				// Is one of the sub answers correct
				temp = CBA.getElementById( qid+"a"+i );
				useranswer = temp.value;
				subanswers = correct[i].split('?');

				for( j=0; j<subanswers.length; j++ )
				{
					if( useranswer==subanswers[j] )
					{
						isCorrect=true;
						break;
					}
					isCorrect=false;
				}

				if( isCorrect )
				{
					// Set the correct icon
					ansimg.setCorrect();
				} else {
					// Set the incorrect icon
					ansimg.setIncorrect();
				}
				ansimg.show();
			}
		}

		// Check select the blanks and mathcing pairs answers
		function checkMatch( qtype, qid, cid, range )
		{
			var index=-1;

			var correct = new Array();
				correct = cid.split(";");
				correct = myunshift( correct, "ddummy" ); //Question elements numbered from one, arrays from 0, makes the same.

			// First hide all the answers
			hideAll( qid, range );

			// For each sub answer, check against corrects
			for(var i=1; i<=range; i++)
			{						
				ansimg = new ccElement( qid+"a"+i+"i" );
				temp = CBA.getElementById( qid+"a"+i );
				if( temp.selectedIndex == parseInt(correct[i]) )
				{
					// Set the correct icon
					ansimg.setCorrect();
				} else {
					// Set the incorrect icon
					ansimg.setIncorrect();
				}
				ansimg.show();
			}
		}
		
		function checkEssay(sType,sId)
		{
			var oAnsRow = document.getElementById((sId+'a'));
			oAnsRow.style.display = ( oAnsRow.style.display == "block" ) ? "none" : "block";
		}	
*/		