/*
 *  Meglofriend's Dota 2 Counter Pick App || Init.js
 *  Michael Yull
 */
// Global variable init
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
    var localhost = window.location.href.toLowerCase().replace("/counterpick/",""); //For cors issues for localhost, and www. vs no www. issues
    $("#preview-selector").hide();
    $("#hero-table").hide();
    //ajax call to retrieve initial list of heroes
    $.ajax({
        method:"GET",
        url: localhost+"/counter/op",
        data: {opcode:0,body:""},
        success:function(response){
            //Converting response to object
            var obj = JSON.parse(response);
            heroes = obj;
            //Getting the elements for hold the hero portraits based off primary attribute
            var str = document.getElementById("str-portraits");
            var agi = document.getElementById("agi-portraits");
            var int = document.getElementById("int-portraits");
            //Setup for each hero
            for(var i = 0; i < obj.length; i++){
                var wrapper; 
                //cleaning up response syntax | Look into on server side
                obj[i].urlLargePortrait = obj[i].urlLargePortrait.replace("}","");
                //Assign container based off primary attribute
                if(obj[i].primaryAttribute === "agility")
                    wrapper = agi;
                if(obj[i].primaryAttribute === "strength")
                    wrapper = str;
                if(obj[i].primaryAttribute === "intelligence")
                    wrapper = int;
                //Create new div for hero portrait
                var portrait = $("<div />",{id:obj[i].name,class:"hero-portrait"});
                $(portrait).css({
                    "background-image": "url("+obj[i].urlVertPortrait+")"
                });
                //Add portrait to dom and assign data to hold hero info
                $(wrapper).append(portrait);
                $(portrait).data("obj",obj[i]);
                //Creates a highlight for when a hero portrait is moused over
                $(portrait).on("mouseenter",function(){
                    var sel = $("#preview-selector");
                    $(sel).show();
                    //assign the hero to preview-selector
                    $(sel).data("obj",$(this).data("obj"));
                    var xOffset = 0;// use for edge offsets | Not yet set up.
                    var yOffset = 0;
                    $("#preview-text").html($(sel).data("obj").name.replace(/-/g," "));//Show hero name, replace -'s with a space
                    //positional and portrait assignment
                    $(sel).css({
                        "top": ($(this).position().top - 46 + yOffset) + "px",
                        "left":($(this).position().left - (this.offsetWidth*0.9) + xOffset) + "px",
                        "background-image":"url("+$(this).data("obj").urlVertPortrait+")"
                    });
                    //Grey out if selected
                    if($(this).hasClass("selected"))
                        $(sel).addClass("grey");
                });
            }//End of hero loop
            $("#preview-selector").on("click",function(){
                //Allow selection of heroes while there are less then five
                if(picks.length < 5){
                    var obj = $(this).data("obj");
                    var dup = false; //is duplicate
                    for(var i = 0; i< picks.length;i++){
                        if(picks[i] === obj)
                            dup = true;
                    }
                    if(dup === false){
                        //insert at the end of picks array
                        var pos = picks.length;
                        picks.push($(this).data("obj"));
                        //Define as selected in DOM
                        $("#"+obj.name).addClass("selected");
                        var icon = $("#pick-icon-"+pos);
                        $(icon).data("obj",obj);
                        $(icon).data("pos",pos);
                        //ajax call for comparison data on the chosen hero
                        $.ajax({
                            method:"GET",
                            url: localhost+"/counter/op",
                            data:{opcode:2,body:obj.name},
                            success:function(response){
                               var comps = JSON.parse(response);
                               calculateCounters(icon,comps);
                            }
                        });
                        $(icon).css({"background-image":"url("+obj.urlLargePortrait+")"});
                    }
                }
                //hide preview selector on selection, adds some responsiveness if nothing else.
                $(this).hide();
            }).mouseleave(function(){
                $(this).removeClass("grey");
                $(this).hide();
            })
            .bind("mousewheel",function(){
                 $(this).hide();
            });
            $(".pick-icon").on("click",function(){
                // remove hero from pick pool and truncate icons
                if($(this).data("obj")){
                    //get the element that was clicked and its data
                    var obj = $(this).data("obj");
                    var pos = $(this).data("pos");
                    var comps = $(this).data("comps");
                    //clear the element
                    $(this).removeData("obj");
                    $(this).removeData("pos");
                    $(this).css({
                        "background-image":"none"
                    });
                    //splice the elements data from the lists so they're reordered appropriately
                    picks.splice(pos,1);
                    comparisons.splice(comparisons.indexOf(comps),1);
                    // reconstruct visuals and data.
                    drawIcons();
                    calculateCounters();
                    $("#"+obj.name).removeClass("selected");
                }
            });
            resize();
            // Hides the hero table until all images have finished loading.
            // Might applies to suggestion list as well.
            $('#hero-table').waitForImages(true).progress(function(loaded, count, success) {
                console.log(loaded + ' of ' + count + ' images has ' + (success ? 'loaded' : 'failed to load') +  '.');
                if(loaded + 1 === count){
                    $('#hero-table').show();
                    $('#loader-icon').hide();
                    return;
                }
            });            
        },
        error:function(){
            console.log("failure");
        }
    });
    //When suggestion div is horizontal, if scrolled upon, scroll horizontally.
    $('#suggestion-scroller').bind("mousewheel",function(e) {
        if($('#suggestion').width() > $('#suggestion').height()){
            
            this.scrollLeft -= (e.originalEvent.wheelDelta * 0.3);
            e.preventDefault();
        }
   });
   //Hide and show menu buttons
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
    //if adding a new hero instead of removing.
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
        //Average out the data based off number of picks
        $.each(compTotals,function(index,heroComp){
            heroComp.advantage = heroComp.advantage/picks.length;
            heroComp.winRate = heroComp.winRate/picks.length;
        });
        //sort based off our sorting variable
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
        //empty container first
        $(container).empty();
        //Return 15 counters || advanced functionality could be to make this an adjustable amount
        for(var i = 0; i < 15; i++){
            //Check to see if the counter is a hero in the pick list
            var valid = true;
            $.each(picks,function(index,obj){
                if(compTotals[i].heroName === obj.name.toLowerCase())
                    valid = false;
            });
            if(valid){
                //console.log(compTotals[i].heroName + ", " + compTotals[i].advantage);
                //add an item to the suggestion list with the hero's information.
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
                //icon hover is for when the list is minimized. 
                //You can still see the advantage stat when hovering 
                var iconHover = $("<div />",{class:"suggestion-icon-hover"});  
                $(iconHover).html(compTotals[i].advantage.toFixed(2)+"%");
                $(itemIcon).append(iconHover);
                $(item).append(itemIcon);
                //element lisiting the stats
                var stats = $("<div />",{class:"suggestion-stats"});
                //for each of the 3 stats: advantage, win rate, and matches
                for(var j = 0; j < 3; j++){
                    var stat = $("<div />",{class:"stat"});
                    //For each rank we have a title, a value, and bar for judging the worth of that value.
                    var ranking = $("<div />",{class:"rank-bar"});
                    var title = $("<div />",{class:"stat-title"});
                    var val = $("<div />",{class:"stat-value"});
                    var rankWidth = 0;
                    //hovering tooltip to tell the user what the stat means
                    var tooltip = $("#tooltip");
                    $(title).hover(function(){
                        var offset = $(this).offset();
                        var text = $(this).html();
                        $(this).data("timer",setTimeout(function(){
                            //show and position under the title
                            $(tooltip).show();
                            $(tooltip).css({
                                "top": offset.top + 25 + "px",
                                "left": offset.left - 100 + "px"
                            });
                            //What tip to show based off the title
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
                        //hide the tooltip if the user stops hovering
                        clearTimeout($(this).data("timer"));
                        $(tooltip).hide();
                    });
                    //Info for each stat
                    switch(j){
                        case 0:
                            $(title).html("Advantage:");
                            $(val).html(compTotals[i].advantage.toFixed(2)+"%");
                            //evaluate as a percentage from 0 to 100
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
                    //if the percentage is greater than 100 make it 100
                    if(rankWidth > 100){
                        rankWidth = 100;
                    }
                    //apply the width
                    $(ranking).css({
                        "width": rankWidth + "%"
                    });
                    //add a division line to the stat except to the first
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
//function for redrawing the pick icons in order.
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
        //zero it out so the parent resets its height 
        $(this).find(".ability-title").css({
            "height": "0px"
        });
        //then set the height to the height of the parent
        $(this).find(".ability-title").css({
            "height":$(this).height()
        });
        //get the text and the icon elements
        var text = $(this).find(".ability-text");
        var icon = $(this).find("image");
        //width for this specific title
        var textWidth = text[0].getBBox().width/2 + 4;
        //set the text to be aligned to the top if the first divider's height is above 500px
        //else set it to be vertically centered to the divider
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
        //make the line as long as the dividers height
        $(this).find("line").attr("y2",$(this).height() - 5);
    });
}

function initLogoBar(){
    createLogoRotation($("#buff-bar"),buffTimerIndex);
}
//Interval the rotates through the visisblity of all the children of an element
//Goes off of and increments a global counter for the element
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


