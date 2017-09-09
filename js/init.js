var heroes;
var picks = [];
var comparisons = [];
var compTotals = [];
var buffTimerIndex = 0;
var sortingColumn = 0;
var advantageTip = "Advantage the current picks have over the hero.";
var winRateTip = "Average win rate of the current picks against the hero.";
var matchesTip = "Total number of match comparisons against the hero.";
$(document).ready(function(){
    $("#preview-selector").hide();
    $.ajax({
        method:"GET",
        url:"connect.php",
        data: {opMessage:JSON.stringify({opcode:0,body:""})},
        success:function(response){
            var obj = JSON.parse(response);
            heroes = obj;
            var str = document.getElementById("str-portraits");
            var agi = document.getElementById("agi-portraits");
            var int = document.getElementById("int-portraits");
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
                    comparisons.splice(comparisons.indexOf(comps),1);
                    drawIcons();
                    calculateCounters();
                    $("#"+obj.name).removeClass("selected");
                }
            });
            resize();
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
   $("#menu-prompt-but").on("click",function(){
       $("#menu").show();
       $("#menu").animate({
           right: 0+"px"
       },300);
   });
   $("#floating-menu-but").on("click",function(){
       $("#menu").show();
       $("#menu").animate({
           right: 0+"px"
       },300);
   });
   $("#menu-close-but").on("click",function(){
       $("#menu").animate({
           right: $("#menu").width()*-1 + "px"
       },300,function(){
           $("#menu").hide();
       });
   });
   initLogoBar();
});

function calculateCounters(el,comps){
    if(el){
        $(el).data("comps",comps);
        comparisons.push(comps);
    }
    //comparisons holds an entry for each picks comparisons against all other heros
    //compTotals has one entry per hero and we add each data set from comparisons to find a total / average
    compTotals = [];
    var container = $("#suggestion-container");
    $(container).empty();
        if(comparisons[0]){
            //for every hero comparison in our first comparison object
        for(var i = 0; i < comparisons[0].length;i++){
            //add the data from the first comparison for each hero
            compTotals.push({
                heroName : comparisons[0][i].heroName,
                advantage : comparisons[0][i].advantage,
                winRate : comparisons[0][i].winRate,
                matches : comparisons[0][i].matches
            });
        }
        //for every other comparison set add the hero's values together of every hero
        for(var i = 1; i < comparisons.length; i++){
            for(var j = 0; j < comparisons[i].length;j++){
                compTotals[j].advantage += comparisons[i][j].advantage;
                compTotals[j].winRate += comparisons[i][j].winRate;
                compTotals[j].matches += comparisons[i][j].matches;
            }
        }
        $.each(compTotals,function(index,heroComp){
            heroComp.advantage = heroComp.advantage/picks.length;
            heroComp.winRate = heroComp.winRate/picks.length;
        });
        compTotals.sort(function(a,b){
            switch(sortingColumn){
                case 0:
                    return a.advantage - b.advantage;
                break;
                case 1:
                    return a.winRate - b.winRate;
                    break;
                case 2:
                    return b.matches - a.matches;
                    break;
            }
        });
        $(container).empty();
        for(var i = 0; i < 15; i++){
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
                var iconHover = $("<div />",{class:"suggestion-icon-hover"});
                
                $(iconHover).html(compTotals[i].advantage.toFixed(2)+"%");
                $(itemIcon).append(iconHover);
                $(item).append(itemIcon);
                var stats = $("<div />",{class:"suggestion-stats"});
                for(var j = 0; j < 3; j++){
                    var stat = $("<div />",{class:"stat"});
                    var ranking = $("<div />",{class:"rank-bar"});
                    var title = $("<div />",{class:"stat-title"});
                    var val = $("<div />",{class:"stat-value"});
                    var rankWidth = 0;
                    var tooltip = $("#tooltip");
                    $(title).hover(function(){
                        var offset = $(this).offset();
                        var text = $(this).html();
                        $(this).data("timer",setTimeout(function(){
                            $(tooltip).show();
                            $(tooltip).css({
                                "top": offset.top + 25 + "px",
                                "left": offset.left - 100 + "px"
                            });
                            switch(text){
                                case "Advantage:":
                                    $(tooltip).html(advantageTip);
                                    break;
                                case "Win Rate:":
                                    $(tooltip).html(winRateTip);
                                    break;
                                case "Matches:":
                                    $(tooltip).html(matchesTip);
                                    break;
                            }
                        },1000));
                    },function(){
                        clearTimeout($(this).data("timer"));
                        $(tooltip).hide();
                    });
                    switch(j){
                        case 0:
                            $(title).html("Advantage:");
                            $(val).html(compTotals[i].advantage.toFixed(2)+"%");
                            rankWidth = compTotals[i].advantage.toFixed(2)/7 * -100;
                            break;
                        case 1:
                            $(title).html("Win Rate:");
                            $(val).html(compTotals[i].winRate.toFixed(2)+"%");
                            rankWidth = compTotals[i].winRate.toFixed(2);
                            break;
                        case 2:
                            $(title).html("Matches:");
                            $(val).html(compTotals[i].matches);
                            rankWidth = compTotals[i].matches/1000000 * 100;
                            break;
                    }
                    if(rankWidth > 100){
                        rankWidth = 100;
                    }
                    $(ranking).css({
                        "width": rankWidth + "%"
                    });
                    if(j !== 0){
                        $(stat).css({
                            "border-top":"1px solid #888"
                        });
                    }
                    $(stat).append(ranking);
                    $(stat).append(title);
                    $(stat).append(val);
                    $(stats).append(stat);
                }
                $(item).append(stats);
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

$(window).resize(resize);

function resize(){
    var firstHeight = $(".ability-divider").first().height();
    $.each($(".ability-divider"),function(){
        //console.log($(value).height() + " " + index);
        $(this).find(".ability-title").css({
            "height": "0px"
        });
        $(this).find(".ability-title").css({
            "height":$(this).height()
        });
        var text = $(this).find(".ability-text");
        var icon = $(this).find("image");
        var textWidth = text[0].getBBox().width/2 + 4;
        if(firstHeight < 500){
            $(text).attr("y",$(this).height()/2 - 10);
            $(text).attr("transform","rotate(-90,"+$(text).attr("x")+","+($(this).height()/2 -10)+")");
            $(icon).attr("y",$(this).height()/2 + textWidth - 10);
        }
        else{
            $(text).attr("y",textWidth);
            $(text).attr("transform","rotate(-90,"+$(text).attr("x")+","+textWidth+")");
            $(icon).attr("y",textWidth * 2);
        }
        $(this).find("line").attr("y2",$(this).height() - 5);
    });
}

function initLogoBar(){
    createLogoRotation($("#buff-bar"),buffTimerIndex);
}

function createLogoRotation(container,index){
    $.each($(container).children(),function(index, val){
        $(val).hide();
    });
    $(container).children().eq(0).show();
    $(container).children().eq(0).css({opacity: 1});
    var buffTimer = setInterval(function(){
        var curr = $(container).children().eq(index++);
        if(index === $(container).children().length){
            index = 0;
        }
        var next = $(container).children().eq(index);
        $(curr).animate({
            opacity: 0
        },1000,function(){
            $(curr).hide();
            $(next).show();
            $(next).animate({
                opacity: 1
            },1000);
        });
    }, 4000);
}


