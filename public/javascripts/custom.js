//we pass id of star where mouse cursor is
//and change class for every previous star
function star(rate){
    for(var i = 1; i <= rate; i++){
        document.getElementById("rate_" + i).setAttribute("class", "staron");
    }
}
//we change class of all stars back to empty star
function unstar(max){
	console.log("unstar");
    for(var i = 1; i <= max; i++){
    	document.getElementById("rate_" + i).setAttribute("class", "staroff");
    }
}
function currentStarState(currentRating, max){
	console.log("outOFstar");
    for(var i = 1; i <= max; i++){
        if(i>currentRating) document.getElementById("rate_" + i).setAttribute("class", "staroff");
        else document.getElementById("rate_" + i).setAttribute("class", "staron");
    }
}
//generate stars
//first param - amount of stars
//second param - id of div where to attach stars
function generate_stars(resId, currentRating, max, attach){
    //get div container
    var container = $("#"+attach);
    container.html("");
//    console.log(container);
    for(var i = 1; i <= max; i++){
        //create star
        var div = document.createElement("div");
        if(i>currentRating) div.setAttribute("class", "staroff");
        else div.setAttribute("class", "staron");
        div.setAttribute("id", "rate_" + i);
        //set events
        //div.setAttribute("onmouseover", "star(" + i + ")");
        //div.setAttribute("onmouseout", "unstar(" + max + ")");
        div.setAttribute("onclick", "updateRating(" + resId + ", " + i + ")");
        //append child to contaner
        container.append(div);
    }
    // container.setAttribute("onmouseout", "currentStarState(" + currentRating + ", " + max + ")");
}

function generate_static_stars(resId, currentRating, max, attach){
    //get div container
    var container = document.getElementById(attach);
    console.log(container);
    for(var i = 1; i <= max; i++){
        //create star
        var div = document.createElement("div");
        if(i>currentRating) div.setAttribute("class", "staroff");
        else div.setAttribute("class", "staron");
        //append child to contaner
        container.appendChild(div);
    }
}



function updateRating(resId, r)
{
    console.log(resId + " -> " + r);
    $.post("updateRating", {"resId":resId, "r":r},
        function(data){
            generate_stars(resId, data.rating, 5, "stars"); $("#rate").html(data.rating);
        }, "json");
}