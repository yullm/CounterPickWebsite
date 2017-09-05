$(window).resize(function(){
    //Maybe completely unnecessary
    //resizeSuggestion();
});

function resizeSuggestion(){
    var container = $("#suggestion-container");
    if($("#suggestion").height() >= $("#suggestion").width()){
        //If the suggestion div is in vertical mode
        var newHeight = 0; //calculate by number of suggestions.
        $(container).css({
            "width":"100%",
            "height":newHeight +"px"
        });
        $("#suggestion").css({
            "overflow-y":"scroll",
            "overflow-x":"hidden"
        });
    }else{
        //If the suggestion div is in horizontal mode
        var newWidth = 0; //calculate by number of suggestions.
        $(container).css({
            "width":newWidth +"px",
            "height":"100%"  
        });
        $("#suggestion").css({
            "overflow-y":"hidden",
            "overflow-x":"scroll"
        });
    }
        
}