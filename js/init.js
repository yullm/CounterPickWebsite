var heroes;
var picks = [];
var counters = [];
var compTotals = [];
$(document).ready(function(){
    $("#preview-selector").hide();
    $.ajax({
        method:"GET",
        url:"connect.php",
        data: {opMessage:JSON.stringify({opcode:0,body:""})},
        success:function(response){
            var obj = JSON.parse(response);
            heroes = obj;
            var str = document.getElementById("str");
            var agi = document.getElementById("agi");
            var int = document.getElementById("int");
            $(wrapper).hide();
            for(var i = 0; i < obj.length; i++){
                var wrapper; 
                obj[i].urlLargePortrait = obj[i].urlLargePortrait.replace("}","");
                if(obj[i].primaryAttribute === "agility")
                    wrapper = agi;
                if(obj[i].primaryAttribute === "strength")
                    wrapper = str;
                if(obj[i].primaryAttribute === "intelligence")
                    wrapper = int;
                var portrait = $("<div />",{id:obj[i].name,class:"hero-portrait"});
                $(portrait).css({
                    "background-image": "url("+obj[i].urlVertPortrait+")"
                });
                $(wrapper).append(portrait);
                $(portrait).data("obj",obj[i]);
                $(portrait).on("mouseenter",function(){
                    var sel = $("#preview-selector");
                    $(sel).show();
                    $(sel).data("obj",$(this).data("obj"));
                    var xOffset = 0;// use for edge offsets
                    var yOffset = 0;
                    $("#preview-text").html($(sel).data("obj").name.replace(/-/g," "));
                    $(sel).css({
                        "top": ($(this).position().top - 46 + yOffset) + "px",
                        "left":($(this).position().left - (this.offsetWidth*0.9) + xOffset) + "px",
                        "background-image":"url("+$(this).data("obj").urlVertPortrait+")"
                    });
                    if($(this).hasClass("selected"))
                        $(sel).addClass("grey");
                })
                .click(function(){
                    /// FOR MOBILE
                });
            }
            $("#preview-selector").on("click",function(){
                if(picks.length < 5){
                    var obj = $(this).data("obj");
                    var dup = false;
                    for(var i = 0; i< picks.length;i++){
                        if(picks[i] === obj)
                            dup = true;
                    }
                    if(dup === false){
                        var pos = picks.length;
                        picks.push($(this).data("obj"));
                        $("#"+obj.name).addClass("selected");
                        var icon = $("#pick-icon-"+pos);
                        $(icon).data("obj",obj);
                        $(icon).data("pos",pos);
                        $.ajax({
                            method:"GET",
                            url:"connect.php",
                            data:{opMessage:JSON.stringify({opcode:2,body:obj.name.toLowerCase()})},
                            success:function(response){
                               var comps = JSON.parse(response);
                               calculateCounters(icon,comps);
                            }
                        });
                        $(icon).css({"background-image":"url("+obj.urlLargePortrait+")"});
                    }
                }
                $(this).hide();
            }).mouseleave(function(){
                $(this).removeClass("grey");
                $(this).hide();
            })
            .bind("mousewheel",function(){
                 $(this).hide();
            });
            $(wrapper).show();
            $(".pick-icon").on("click",function(){
                // remove hero from pick pool and truncate icons
                if($(this).data("obj")){
                    var obj = $(this).data("obj");
                    var pos = $(this).data("pos");
                    var comps = $(this).data("comps");
                    $(this).removeData("obj");
                    $(this).removeData("pos");
                    $(this).css({
                        "background-image":"none"
                    });
                    picks.splice(pos,1);
                    counters.splice(counters.indexOf(comps),1);
                    drawIcons();
                    calculateCounters();
                    $("#"+obj.name).removeClass("selected");
                }
            });
        },
        error:function(){
            console.log("failure");
        }
    });
    $('#suggestion-scroller').bind("mousewheel",function(e) {
        if($('#suggestion').width() > $('#suggestion').height()){
            
            this.scrollLeft -= (e.originalEvent.wheelDelta * 0.3);
            e.preventDefault();
        }
   });
});

function calculateCounters(el,comps){
    if(el){
        $(el).data("comps",comps);
        counters.push(comps);
    }
    compTotals = [];
    var container = $("#suggestion-container");
    $(container).empty();
        if(counters[0]){
        for(var i = 0; i < counters[0].length;i++){
            compTotals.push({
                heroName : counters[0][i].heroName,
                advantage : counters[0][i].advantage,
                winRate : counters[0][i].winRate,
                matches : counters[0][i].matches
            });
        }
        for(var i = 0; i < counters.length; i++){
            for(var j = 0; j < counters[i].length;j++){
                compTotals[j].advantage += counters[i][j].advantage;
                //compTotals[j].advantage = parseFloat(compTotals[j].advantage).toFixed(2);
                compTotals[j].winRate += counters[i][j].winRate;
                //compTotals[j].winRate = parseFloat(compTotals[j].winRate).toFixed(2);
                compTotals[j].matches += counters[i][j].matches;
                //compTotals[j].matches = parseInt(compTotals[j].matches);
            }
        }
        compTotals.sort(function(a,b){
            return a.advantage - b.advantage;
        });
        compTotals.reverse();
        console.log("----COUNTER SET----");
        $(container).empty();
        for(var i = 0; i < 10; i++){
            var valid = true;
            $.each(picks,function(index,obj){
                if(compTotals[i].heroName === obj.name.toLowerCase())
                    valid = false;
            });
            if(valid){
                //console.log(compTotals[i].heroName + ", " + compTotals[i].advantage);
                var item = $("<div />",{class:"suggestion-list-item"});
                var iconImg;
                $.each(heroes,function(index,obj){
                    if(compTotals[i].heroName === obj.name.toLowerCase())
                        iconImg = obj.urlFullPortrait;
                });
                var itemIcon = $("<div />",{class:"suggestion-icon"});
                $(itemIcon).css({
                    "background-image":"url("+iconImg+")"
                });
                $(item).append(itemIcon);
                $(container).append(item);
            }
        }
    }
}

function drawIcons(){
    for(var i = 0; i < 5; i++){
        var icon = $("#pick-icon-"+i);
        if(picks[i]){
            if(picks[i] !== $(icon).data("obj")){
                $(icon).data("obj",picks[i]);
                $(icon).data("pos",i);
                $(icon).css("background-image","url("+picks[i].urlLargePortrait+")");
            }
        }else{
            $(icon).removeData("obj");
            $(icon).removeData("pos");
            $(icon).css({"background-image":"none"});
        }
    }
}



