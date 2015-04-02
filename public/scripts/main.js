/**
 * Created with JetBrains PhpStorm.
 * User: jooskim
 * Date: 10/5/13
 * Time: 4:24 PM
 * To change this template use File | Settings | File Templates.
 */


//alert("mode" + " = " + getQuerystringNameValue("mode"));
function getQuerystringNameValue(name)
{
    // For example... passing a name parameter of "name1" will return a value of "100", etc.
    // page.htm?name1=100&name2=101&name3=102

    var nameValue = null;
    var winURL = window.location.href;

    if (winURL.indexOf("?") > 0) { 
        var queryStringArray = winURL.split("?");
        var queryStringParamArray = queryStringArray[1].split("&");

        for ( var i=0; i<queryStringParamArray.length; i++ )
        {           
            queryStringNameValueArray = queryStringParamArray[i].split("=");

            if ( name == queryStringNameValueArray[0] )
            {
                nameValue = queryStringNameValueArray[1];
            }                       
        }
    }
    return nameValue;
}


require.config({
    paths: {
        'jquery': 'vendor/jquery/jquery',
        'D3': 'vendor/d3/d3.v3',
        'queue': 'vendor/d3/queue.v1.min',
        'moment': 'vendor/momentjs/moment.min',
        'bootstrap': 'vendor/bootstrap/bootstrap',
        'slider': 'slider/js/bootstrap-slider',
        'datepicker': 'datepicker/js/bootstrap-datepicker'
    },
    shim: {
        'D3': {
            exports: 'd3'
        },
        'queue': {
            exports: 'queue'
        },
        'moment': 'moment',
        'bootstrap': {
            deps: ['jquery']
        },
        'slider': {
            deps: ['jquery']
        },
        'datepicker': {
            deps: ['jquery']
        }

    }
});


define(['jquery','D3','queue','moment','slider','datepicker'], function($, d3, queue, moment){
    var raw = [];
    var structured = [];
    var dateSel = '';
    var maximumBG = 420;
    var weeksToDisplay = 4;
    var svgWidth = 900;
    var svgHeight = 180;
    var svgPadding = 20;
    var svgGutter = 80; //gutter for the suggestions text
    var svgGraph = 200; //extra heigh for summary graph

    // thresholds for BG value
    var low = 70;
    var high = 120;
    var mealHigh = 180;

    //standard colors
    var normalColor = "rgba(220,252,0,0.5)";
    var highColor = "rgba(247,80,119,0.5)";
    var higherColor = "rgba(255,0,0,0.5)";
    var lowColor = "rgba(8,71,218,0.5)"

    // debug
    var mode = getQuerystringNameValue("mode"); // 0 for scatter plot, 1 for heatmap, 2 for shape
    if (mode == null) mode = 0;
    //var showValue = 1;

    /*
    data structure is something like below:
    {
        "week": 1,
        "monday": [
            {"date": "10/12/2013"},
            {"BG": [{"time": "12:33:00 AM", "level": 221.0}, ... ] },
            {"insulin": }
        ],
         "tuesday": [
         {"date": "10/13/2013"},
         {"BG": [{"time": "12:33:00 AM", "level": 221.0}, ... ] },
         {"insulin": }
         ],
         ...

    */

    function loadData(date){
        if(date == ''){
            // default data
            var startDate = '2013-07-01';
            var endDate = '2013-09-16';
        }else{
            $('svg,hr').remove();
            var d = new Date(date);
            var startDate = moment(d).format('YYYY-MM-DD');
            var endDate = moment(d.getTime() + 1000*60*60*24*7*4).format('YYYY-MM-DD'); // + 4 weeks
        }

        console.log(startDate, endDate);

        queue()
            .defer(function(i, callback){
                d3.json("bg/"+startDate+"/"+endDate+"/", function(d){
                    structured = [];
                    raw = [];
                    d.forEach(function(data){
                        raw.push(data);
                    });
                    callback(null,i);
                })
            }, 'bg')
            .await(run);
    }


    function unique(list) {
        var result = [];
        $.each(list, function(i, e) {
            if ($.inArray(e, result) == -1) result.push(e);
        });
        return result;
    }

    function structureData(){
        //console.log(raw);
        var datesAggregated = [];

        raw.forEach(function(data){
            datesAggregated.push(moment(data.createdDate).valueOf());
        });

        // total number of weeks
        var totWeeks = moment(d3.max(datesAggregated)).week();
        for(var i=0; i<totWeeks - moment(d3.min(datesAggregated)).week() + 1; i++){
            var tempLevels = [['sun',[]],['mon',[]],['tue',[]],['wed',[]],['thu',[]],['fri',[]],['sat',[]],['prevsat',[]]];
            var tempTimes = [['sun',[]],['mon',[]],['tue',[]],['wed',[]],['thu',[]],['fri',[]],['sat',[]],['prevsat',[]]];
            var tempDates = [['sun',[]],['mon',[]],['tue',[]],['wed',[]],['thu',[]],['fri',[]],['sat',[]],['prevsat',[]]];
            raw.forEach(function(data){
                if(moment(data.createdDate).week()-(moment(d3.min(datesAggregated)).week()) == i){
                    if(moment(data.createdDate).day() == 0){
                        tempLevels[0][1].push(data.level);
                        tempTimes[0][1].push(data.createdTime);
                        tempDates[0][1].push(data.createdDate);
                    }else if(moment(data.createdDate).day() == 1){
                        tempLevels[1][1].push(data.level);
                        tempTimes[1][1].push(data.createdTime);
                        tempDates[1][1].push(data.createdDate);
                    }else if(moment(data.createdDate).day() == 2){
                        tempLevels[2][1].push(data.level);
                        tempTimes[2][1].push(data.createdTime);
                        tempDates[2][1].push(data.createdDate);
                    }else if(moment(data.createdDate).day() == 3){
                        tempLevels[3][1].push(data.level);
                        tempTimes[3][1].push(data.createdTime);
                        tempDates[3][1].push(data.createdDate);
                    }else if(moment(data.createdDate).day() == 4){
                        tempLevels[4][1].push(data.level);
                        tempTimes[4][1].push(data.createdTime);
                        tempDates[4][1].push(data.createdDate);
                    }else if(moment(data.createdDate).day() == 5){
                        tempLevels[5][1].push(data.level);
                        tempTimes[5][1].push(data.createdTime);
                        tempDates[5][1].push(data.createdDate);
                    }else if(moment(data.createdDate).day() == 6){
                        tempLevels[6][1].push(data.level);
                        tempTimes[6][1].push(data.createdTime);
                        tempDates[6][1].push(data.createdDate);
                    }
                }
                if(moment(data.createdDate).week() - (moment(d3.min(datesAggregated)).week()) == i-1){
                    if(moment(data.createdDate).day() == 6){
                        tempLevels[7][1].push(data.level);
                        tempTimes[7][1].push(data.createdTime);
                        tempDates[7][1].push(data.createdDate);
                    }
                }


            });

            structured.push({
                'week': i+1,
                'prevsat': {'dates': tempDates[7][1], 'times': tempTimes[7][1], 'levels': tempLevels[7][1], 'count': tempDates[7][1].length},
                'sunday': {'dates': tempDates[0][1], 'times': tempTimes[0][1], 'levels': tempLevels[0][1], 'count': tempDates[0][1].length},
                'monday': {'dates': tempDates[1][1], 'times': tempTimes[1][1], 'levels': tempLevels[1][1], 'count': tempDates[1][1].length},
                'tuesday': {'dates': tempDates[2][1], 'times': tempTimes[2][1], 'levels': tempLevels[2][1], 'count': tempDates[2][1].length},
                'wednesday': {'dates': tempDates[3][1], 'times': tempTimes[3][1], 'levels': tempLevels[3][1], 'count': tempDates[3][1].length},
                'thursday': {'dates': tempDates[4][1], 'times': tempTimes[4][1], 'levels': tempLevels[4][1], 'count': tempDates[4][1].length},
                'friday': {'dates': tempDates[5][1], 'times': tempTimes[5][1], 'levels': tempLevels[5][1], 'count': tempDates[5][1].length},
                'saturday': {'dates': tempDates[6][1], 'times': tempTimes[6][1], 'levels': tempLevels[6][1], 'count': tempDates[6][1].length}
            });
        }


    }

    function drawShape(svg, numOfWeeks, day){
        if(numOfWeeks == undefined){
            numOfWeeks = 1;
        }

        var currentWeek = parseInt(svg.attr('id'));
        var date = [];
        var mapDay = {0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat"};

//        svg.append('g').attr({'class': 'testGraph'+currentWeek});
        console.log(structured);

        var mapD = {0: "prevsat", 1: "sunday", 2: "monday", 3: "tuesday", 4: "wednesday", 5: "thursday", 6: "friday", 7: "saturday"};
        var dates = [];

        for(var i=0; i<7; i++){
            dates.push(eval("structured[currentWeek]."+mapD[i]+".dates[0]"));

        }

        svg.selectAll('text.monthIndicator').data(dates).enter().append('text')
            .attr({'x': svgPadding*5+35, 'y': function(d,i){ return 30+39*i; }, 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 12, 'class': 'monthIndicator'})
            .text(function(d,i){ if(d != undefined){ return moment(d).format('MMM, DD') }else{ return null;}})
            .attr("text-anchor","end")
            .style({'fill': '#666', 'stroke-width': 0, 'stroke': '#666'});

        svg.selectAll('text.dayIndicator').data(dates).enter().append('text')
            .attr({'x': svgPadding*3+20, 'y': function(d,i){ return 30+39*i; }, 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 12, 'class': 'dayIndicator'})
            .text(function(d,i){ if(d){ return mapDay[moment(d).day()]; } })
            .attr("text-anchor","end")
            .style({'fill': '#666', 'stroke-width': 0, 'stroke': '#666'});

        svg.append('g').attr({'class': 'testGraph'+currentWeek});

        for(var i=0; i<7; i++){
            var testDrive = eval('structured[currentWeek].'+mapD[i]);
            var group = svg.select('g.testGraph'+currentWeek).selectAll('g#day'+i).data(testDrive.levels).enter().append('g')
                .attr({'class': 'elementGroup', 'id': 'day'+i});
            group.append('path')
                .attr({
                    'd': function(d,idx){
                        var dPath = 'M '+parseInt(scaleTimeHeatmap(testDrive.times[idx], testDrive.dates[0]))+' '+parseInt(svgPadding-10 + i*39);
                        if(parseInt(d)>high){ // draw circle
                            dPath += ' m -14.5, 14.5 a 14.5,14.5 0 1, 0 29, 0 a 14.5,14.5 0 1,0 -29,0';
                        }else if(parseInt(d)<=high && parseInt(d)>low){
                            dPath += ' m -14.5, 0 l 29 0 l 0 29 l -29 0 l 0 -29'; // m 14.5, 29 l 14.5 0 l 0 -29 l -29 0 l 0 29 l 14.5 0';
                        }else{
                            dPath += ' m 0, 0 l -14.5 29 l 29 0 l -14.5 -29';
                        }
                        return dPath;},
                    'id': function(d,i){
                        return i;},
                    'class': 'path' + ' ' + mapD[i]
                })
                .attr({"stroke-dasharray":function(d,i){ if(parseInt(d)<=high && parseInt(d)>low){ return "5,5" }else{ return ""} }})
                .style({'fill': '#ffffff'})
                .style({'stroke': function(d,i){ if(parseInt(d)>high || parseInt(d)<=low){ return 'rgba(110,110,110,0.8)' }else{return 'rgba(110,110,110,0.8)'} }, 'stroke-width': function(d,i){ if(parseInt(d)>high || parseInt(d)<=low){ return 3;} else{ return 1; }} });

            group.append('text')
                .attr({'x': function(d,idx){ return scaleTimeHeatmap(testDrive.times[idx], testDrive.dates[0])-(svgWidth-10*svgPadding)/24/2 + 6;}, 'y': svgPadding+ 10 + i*39, 'font-size': 9, 'id': function(d,i){ return i;}, 'class': 'BGValue' + ' ' +mapD[i]})
                .text(function(d,i){ return parseInt(d);})
                .style({'fill': '#000000', 'stroke-width': 0, 'stroke': '#000000'});

        }

        $(".slider.normalrange").slider()
            .on('slideStop', function(e){
                var lohi = $('.normalController .tooltip-inner').text().replace(/\s/g,'').split(':');
                low = lohi[0];
                high = lohi[1];
                svg.select('g.testGraph'+currentWeek).selectAll('g.elementGroup').selectAll('path,text').remove();

                for(var i=0; i<7; i++){
                    var testDrive = eval('structured[currentWeek].'+mapD[i]);
                    var group = svg.select('g.testGraph'+currentWeek).selectAll('g#day'+i);
                    group.append('path')
                        .attr({
                            'd': function(d,idx){
                                var dPath = 'M '+parseInt(scaleTimeHeatmap(testDrive.times[idx], testDrive.dates[0]))+' '+parseInt(svgPadding-10 + i*39);
                                if(parseInt(d)>high){ // draw circle
                                    dPath += ' m -14.5, 14.5 a 14.5,14.5 0 1, 0 29, 0 a 14.5,14.5 0 1,0 -29,0';
                                }else if(parseInt(d)<=high && parseInt(d)>low){
                                    dPath += ' m -14.5, 0 l 29 0 l 0 29 l -29 0 l 0 -29'; // m 14.5, 29 l 14.5 0 l 0 -29 l -29 0 l 0 29 l 14.5 0';
                                }else{
                                    dPath += ' m 0, 0 l -14.5 29 l 29 0 l -14.5 -29';
                                }
                                return dPath;},
                            'id': function(d,i){
                                return i;},
                            'class': 'path' + ' ' + mapD[i]
                        })
                        .attr({"stroke-dasharray":function(d,i){ if(parseInt(d)<=high && parseInt(d)>low){ return "5,5" }else{ return ""} }})
                        .style({'fill': '#ffffff'})
                        .style({'stroke': function(d,i){ if(parseInt(d)>high || parseInt(d)<=low){ return 'rgba(110,110,110,0.8)' }else{return 'rgba(110,110,110,0.8)'} }, 'stroke-width': function(d,i){ if(parseInt(d)>high || parseInt(d)<=low){ return 3;} else{ return 1; }} });

                    group.append('text')
                        .attr({'x': function(d,idx){ return scaleTimeHeatmap(testDrive.times[idx], testDrive.dates[0])-(svgWidth-10*svgPadding)/24/2 + 6;}, 'y': svgPadding+ 10 + i*39, 'font-size': 9, 'id': function(d,i){ return i;}, 'class': 'BGValue' + ' ' +mapD[i]})
                        .text(function(d,i){ return parseInt(d);})
                        .style({'fill': '#000000', 'stroke-width': 0, 'stroke': '#000000'});

                }

            });

        svg.selectAll('.elementGroup').on('mouseover', function(d,i){ // svg.selectAll('g rect').on('mouseover', function(d,i){
            d3.select(this).select('text').transition().attr({'font-size': 20}); // 'y': parseInt(d3.select(textElement)[0][0].attr('y')) - 20,
        });

        svg.selectAll('.elementGroup').on('mouseout', function(d,i){
//            var textElement = $(this).parent().find('.BGValue[id='+$(this).attr('id')+']');
            d3.select(this).select('text').transition().attr({ 'font-size': 9}); //'y': parseInt(d3.select(textElement)[0][0].attr('y')) + 20,
        });




    }

    var catColors = d3.scale.category10(); // color function

    // shape mode
    function drawShapeCanvas(svg, id, numOfWeeks){
        if(!numOfWeeks){
            numOfWeeks = 1;
        }
        // expands the svg height according to the # of days (7) to be displayed
        //if(mode == 0){
        //    svg.style({'height': svgHeight * 7+ 'px' });
        //}else if(mode == 1 || mode == 2){
            svg.style({'height': 39 * 8 + 'px' });
        //}

        svg.select(".weekIndicator").remove();
        svg.append('text')
            .text(function(){ return "Week " + parseInt(parseInt(svg.attr('id'))+1); })
            .attr({x: svgPadding*1-10+90, y: svgPadding-35, 'transform': 'rotate(90)', 'font-size': 25, "class": "weekIndicator"})
            .style({'fill':'#666666', 'stroke-width':0});

        for(var i=0; i<7; i++){
            svg.append('rect')
                .attr({x: svgPadding*8, y: svgPadding-10 + i * 39, width: 29*24, height: 29 })
                .style({'stroke': '#ddd', 'stroke-width': 0, 'fill': 'none'});

            for(var j=0; j<24; j++){
                svg.append('rect')
                    .attr({x: svgPadding*8 + 29 * j, y: svgPadding-10 + i * 39, width: 29, height: 29 })
                    .style({'stroke': '#ddd', 'stroke-width': 0, 'fill': 'none'})
            }

            svg.append('rect')
                .attr({x: scaleTimeHeatmap("06:00 AM", "2013-08-10"), y: svgPadding-10, width: scaleTimeHeatmap("09:00 AM", "2013-08-10") - scaleTimeHeatmap("06:00 AM", "2013-08-10"), "class": "breakfastBracket", "height": 147+117})
                .style({"fill": "#eeeeee"});

            svg.append('rect')
                .attr({x: scaleTimeHeatmap("11:00 AM", "2013-08-10"), y: svgPadding-10, width: scaleTimeHeatmap("02:00 PM", "2013-08-10") - scaleTimeHeatmap("11:00 AM", "2013-08-10"), "class": "lunchBracket", "height": 147+117})
                .style({"fill": "#eeeeee"});

            svg.append('rect')
                .attr({x: scaleTimeHeatmap("05:00 PM", "2013-08-10"), y: svgPadding-10, width: scaleTimeHeatmap("08:00 PM", "2013-08-10") - scaleTimeHeatmap("05:00 PM", "2013-08-10"), "class": "dinnerBracket", "height": 147+117})
                .style({"fill": "#eeeeee"});

        }

        var ticksTime = ["12:00 AM","3:00 AM","6:00 AM","9:00 AM","12:00 PM","3:00 PM","6:00 PM","9:00 PM","11:59 PM"];

        svg.selectAll('text.time').data(ticksTime).enter().append('text')
            .text(function(d,i){ if(i != 8){ return moment('2013/01/01 '+d).format('h A');}else{ return (moment('2013/01/01 '+d).hour()+1)/2+ ' AM'; } })
            .attr({'x': function(d,i){ return svgPadding*8+(svgWidth-10*svgPadding)/24*(i)*3-12; }, 'y': svgHeight - svgPadding*2 + 156, 'font-size': '9px', 'class': 'time'});
    }

    // heatmap mode
    function drawHeatmapCanvas(svg, id, numOfWeeks){
        if(!numOfWeeks){
            numOfWeeks = 1;
        }
        // expands the svg height according to the # of days (7) to be displayed
        //if(mode == 0){
        //    svg.style({'height': svgHeight * 7+ 'px' });
        //}else if(mode == 1 || mode == 2){
            svg.style({'height': 39 * 8 + 'px' });
        //}

        svg.select(".weekIndicator").remove();
        svg.append('text')
            .text(function(){ return "Week " + parseInt(parseInt(svg.attr('id'))+1); })
            .attr({x: svgPadding*1-10+90, y: svgPadding-35, 'transform': 'rotate(90)', 'font-size': 25, "class": "weekIndicator"})
            .style({'fill':'#666666', 'stroke-width':0});

        svg.append('rect')
            .attr({x: scaleTimeHeatmap("06:00 AM", "2013-08-10"), y: svgPadding-10, width: scaleTimeHeatmap("09:00 AM", "2013-08-10") - scaleTimeHeatmap("06:00 AM", "2013-08-10"), "class": "breakfastBracket", "height": 147+117})
            .style({"fill": "#eeeeee"});

        svg.append('rect')
            .attr({x: scaleTimeHeatmap("11:00 AM", "2013-08-10"), y: svgPadding-10, width: scaleTimeHeatmap("02:00 PM", "2013-08-10") - scaleTimeHeatmap("11:00 AM", "2013-08-10"), "class": "lunchBracket", "height": 147+117})
            .style({"fill": "#eeeeee"});

        svg.append('rect')
            .attr({x: scaleTimeHeatmap("05:00 PM", "2013-08-10"), y: svgPadding-10, width: scaleTimeHeatmap("08:00 PM", "2013-08-10") - scaleTimeHeatmap("05:00 PM", "2013-08-10"), "class": "dinnerBracket", "height": 147+117})
            .style({"fill": "#eeeeee"});

        for(var i=0; i<7; i++){
            svg.append('rect')
                .attr({x: svgPadding*8, y: svgPadding-10 + i * 39, width: 29*24, height: 29 })
                .style({'stroke': '#ddd', 'stroke-width': 0, 'fill': 'none'});

            for(var j=0; j<24; j++){
                svg.append('rect')
                    .attr({x: svgPadding*8 + 29 * j, y: svgPadding-10 + i * 39, width: 29, height: 29 })
                    .style({'stroke': '#ddd', 'stroke-width': 0, 'fill': 'none'})
            }

        }

        var ticksTime = ["12:00 AM","3:00 AM","6:00 AM","9:00 AM","12:00 PM","3:00 PM","6:00 PM","9:00 PM","11:59 PM"];


        svg.selectAll('text.time').data(ticksTime).enter().append('text')
            .text(function(d,i){ if(i != 8){ return moment('2013/01/01 '+d).format('h A');}else{ return (moment('2013/01/01 '+d).hour()+1)/2+ ' AM'; } })
            .attr({'x': function(d,i){ return svgPadding*8+(svgWidth-10*svgPadding)/24*(i)*3-12; }, 'y': svgHeight - svgPadding*2 + 156, 'font-size': '9px', 'class': 'time'});

    }

    function drawHeatmap(svg, numOfWeeks, day){
        if(numOfWeeks == undefined){
            numOfWeeks = 1;
        }

        var currentWeek = parseInt(svg.attr('id'));
        var date = [];
        var mapDay = {0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat"};

//        svg.append('g').attr({'class': 'testGraph'+currentWeek});
        console.log(structured);

        var mapD = {0: "prevsat", 1: "sunday", 2: "monday", 3: "tuesday", 4: "wednesday", 5: "thursday", 6: "friday", 7: "saturday"};
        var dates = [];

        for(var i=0; i<7; i++){
            dates.push(eval("structured[currentWeek]."+mapD[i]+".dates[0]"));

        }

        svg.selectAll('text.monthIndicator').data(dates).enter().append('text')
            .attr({'x': svgPadding*5+35, 'y': function(d,i){ return 30+39*i; }, 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 12, 'class': 'monthIndicator'})
            .text(function(d,i){ if(d != undefined){ return moment(d).format('MMM, DD') }else{ return null;}})
            .attr("text-anchor","end")
            .style({'fill': '#666', 'stroke-width': 0, 'stroke': '#666'});

        svg.selectAll('text.dayIndicator').data(dates).enter().append('text')
            .attr({'x': svgPadding*3+20, 'y': function(d,i){ return 30+39*i; }, 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 12, 'class': 'dayIndicator'})
            .text(function(d,i){ if(d){ return mapDay[moment(d).day()]; } })
            .attr("text-anchor","end")
            .style({'fill': '#666', 'stroke-width': 0, 'stroke': '#666'});

        svg.append('g').attr({'class': 'testGraph'+currentWeek});

        for(var i=0; i<7; i++){
            var testDrive = eval('structured[currentWeek].'+mapD[i]);


            var group = svg.select('g.testGraph'+currentWeek).selectAll('g#day'+i).data(testDrive.levels).enter().append('g')
                .attr({'class': 'elementGroup','id': 'day'+i});
            group.append('circle')
                .attr({'cx': function(d,idx){ return scaleTimeHeatmap(testDrive.times[idx], testDrive.dates[0]);}, 'cy': svgPadding-10 + 14.5 + i*39, 'r': 14.5, 'id': function(d,idx){ return idx;}, 'class': 'path' + ' ' + mapD[i] })
                .style({'stroke': function(d, idx){
                    if(parseInt(d)<=high && parseInt(d)>low){
                        return '#999999';
                    }else{
                        return 'none';
                    }
                }})
                .style({'fill-opacity': 0.65, 'fill': function(d,idx){
                    var h=0;
                    var s=0;
                    var l=0;

                    if(parseInt(d)>high){
                        var sRangeFunc = d3.scale.linear().domain([parseInt(high)+1, maximumBG]).range([30, 100]);
                        var lRangeFunc = d3.scale.pow().domain([parseInt(high)+1, maximumBG]).range([80, 54]);

                        if(parseInt(d)>maximumBG){
                            s=100;
                            l=54;
                        }else{
                            s=sRangeFunc(parseInt(d));
                            l=lRangeFunc(parseInt(d));
                        }
                    }else if(parseInt(d)<=high && parseInt(d)>low){
                        return 'none';
                    }else{
                        h=224;
                        var sRangeFunc = d3.scale.linear().domain([0, low]).range([100,30]);
                        var lRangeFunc = d3.scale.linear().domain([0, low]).range([38,80])
                        s=sRangeFunc(d);
                        l=lRangeFunc(d);
                    }
                    return 'hsl('+h+','+s+'%,'+l+'%)';
                }
                });
            group.append('text')
                .attr({'x': function(d,idx){ return scaleTimeHeatmap(testDrive.times[idx], testDrive.dates[0]) - 8;}, 'y': svgPadding+ 10 + i*39, 'font-size': 9, 'id': function(d,idx){ return idx;}, 'class': 'BGValue' + ' ' +mapD[i]})
                .text(function(d,idx){ return parseInt(d);})
                .style({'fill': '#000000', 'stroke-width': 0, 'stroke': '#000000'});



        }

        $(".slider.normalrange").slider()
            .on('slideStop', function(e){
                var lohi = $('.normalController .tooltip-inner').text().replace(/\s/g,'').split(':');
                low = lohi[0];
                high = lohi[1];
                svg.select('g.testGraph'+currentWeek).selectAll('g').selectAll('circle').transition()
                    .style({'stroke': function(d, idx){
                        if(parseInt(d)<=high && parseInt(d)>low){
                            return '#999999';
                        }else{
                            return 'none';
                        }
                    }})
                    .style({'fill-opacity': 0.65, 'fill': function(d,idx){
                        var h=0;
                        var s=0;
                        var l=0;

                            if(parseInt(d)>high){
                                var sRangeFunc = d3.scale.linear().domain([parseInt(high)+1, maximumBG]).range([30, 100]);
                                var lRangeFunc = d3.scale.pow().domain([parseInt(high)+1, maximumBG]).range([80, 54]);

                                if(parseInt(d)>maximumBG){
                                    s=100;
                                    l=54;
                                }else{
                                    s=sRangeFunc(parseInt(d));
                                    l=lRangeFunc(parseInt(d));
                                }
                            }else if(parseInt(d)<=high && parseInt(d)>low){
                                return 'none';
                            }else if(parseInt(d)<=low){
                                h=224;
                                var sRangeFunc = d3.scale.linear().domain([0, low]).range([100,30]);
                                var lRangeFunc = d3.scale.linear().domain([0, low]).range([38,80]);
                                s=sRangeFunc(parseInt(d));
                                l=lRangeFunc(parseInt(d));
                            }
                        return 'hsl('+h+','+s+'%,'+l+'%)';
                    }
                    });
            });


        svg.selectAll('.elementGroup').on('mouseover', function(d,i){ // svg.selectAll('g rect').on('mouseover', function(d,i){
//            var textElement = $(this).parent().find('.BGValue[id='+$(this).attr('id')+']');
//            console.log(d3.select(textElement)[0][0]);

            d3.select(this).select('text').transition().attr({'font-size': 20}); // 'y': parseInt(d3.select(textElement)[0][0].attr('y')) - 20,
        });

        svg.selectAll('.elementGroup').on('mouseout', function(d,i){
//            var textElement = $(this).parent().find('.BGValue[id='+$(this).attr('id')+']');
            d3.select(this).select('text').transition().attr({ 'font-size': 9}); //'y': parseInt(d3.select(textElement)[0][0].attr('y')) + 20,
        });

    }

    // scatter plot mode
    function scaleBG(item, array){
        var BGValues = [];
        array.forEach(function(data){
            BGValues.push(parseFloat(data.level));
        });
//        var rangeFunc = d3.scale.linear().domain([0, d3.max(BGValues)]).range([svgHeight - svgPadding, svgPadding]);
        var rangeFunc = d3.scale.linear().domain([0, maximumBG]).range([svgHeight - svgPadding, svgPadding]); // fixed maximum BG
        return rangeFunc(item);
    }

    function scaleTime(item, date){
        date = date.replace(/\b-\b/g, "/");
        var beginning = moment(date + " 12:00:00 AM").valueOf();
        var ending = beginning + 86400000;
        var rangeFunc = d3.scale.linear().domain([beginning, ending]).range([svgPadding*8, svgWidth - svgPadding]);
        return rangeFunc(moment(date+' '+item).valueOf());
    }

    function scaleTimeHeatmap(item, date){
        date = date.replace(/\b-\b/g, "/");
        var beginning = moment(date + " 12:00:00 AM").valueOf();
        var ending = beginning + 86400000;
        var rangeFunc = d3.scale.linear().domain([beginning, ending]).range([svgPadding*8, svgPadding*8 + 24*29]);
        return rangeFunc(moment(date+' '+item).valueOf());
    }

    //scale for 8 ticks for each day of the week
    function scaleTimeOverlay(item){
        // date = date.replace(/\b-\b/g, "/");
        var beginning = 0
        var ending = 7;
        var rangeFunc = d3.scale.linear().domain([beginning, ending]).range([svgPadding*8, svgWidth - svgPadding]);
        return rangeFunc(item).valueOf();
    } 

    function scaleWeek(item, date){
        date = date.replace(/\b-\b/g, "/");
        var dateMoment = moment(date + " " + item);
        var target = dateMoment.valueOf();

        //set beginning of the week
        var beginning = dateMoment;
        beginning.subtract(beginning.day(), 'd');
        beginning.startOf('day');
        var start = beginning.valueOf();


        //set end of the week
        var ending = beginning;
        ending.add(6 , 'd');
        ending.endOf('day');
        var end = ending.valueOf()

        var rangeFunc = d3.scale.linear().domain([start, end]).range([svgPadding*8, svgWidth - svgPadding]);
        return rangeFunc(target);
    }

    function drawScatterCanvas(svg, id, numOfWeeks){
        if(!numOfWeeks){
            numOfWeeks = 1;
        }
        // expands the svg height according to the # of weeks to be displayed
        svg.style({'height': svgHeight*7 + 'px' });

        svg.select(".weekIndicator").remove();
        svg.append('text')
            .text(function(){ return "Week " + parseInt(parseInt(svg.attr('id'))+1); })
            .attr({x: svgPadding*1-10+20, y: svgPadding-35, 'transform': 'rotate(90)', 'font-size': 25, "class": "weekIndicator"})
            .style({'fill':'#666666', 'stroke-width':0});

        for(var i=0; i<7; i++){
            svg.append('line')
                .attr({x1: svgPadding*8, x2: svgWidth - svgPadding, y1: svgHeight - svgPadding + i * svgHeight, y2: svgHeight - svgPadding + i * svgHeight })
                .style({'stroke': '#999', 'stroke-width': 1});
            svg.append('line')
                .attr({x1: svgPadding*8, x2: svgPadding*8, y1: svgHeight - svgPadding + i * svgHeight, y2: svgPadding + i * svgHeight })
                .style({'stroke': '#999', 'stroke-width': 1});
        }

        // draw ticks
        var ticksBG = [0, 50, 100, 150, 200, 250, 300, 350];
        var ticksTime = ["12:00 AM","3:00 AM","6:00 AM","9:00 AM","12:00 PM","3:00 PM","6:00 PM","9:00 PM","11:59 PM"];


        for(var j=0; j<7; j++){
            svg.append('rect')
                .attr({x: scaleTimeHeatmap("06:00 AM", "2013-08-10"), y: svgPadding-10+j*svgHeight, width: scaleTimeHeatmap("09:00 AM", "2013-08-10") - scaleTimeHeatmap("06:00 AM", "2013-08-10"), "class": "breakfastBracket", "height": 149})
                .style({"fill": "#eeeeee"});

            svg.append('rect')
                .attr({x: scaleTimeHeatmap("11:00 AM", "2013-08-10"), y: svgPadding-10+j*svgHeight, width: scaleTimeHeatmap("02:00 PM", "2013-08-10") - scaleTimeHeatmap("11:00 AM", "2013-08-10"), "class": "lunchBracket", "height": 149})
                .style({"fill": "#eeeeee"});

            svg.append('rect')
                .attr({x: scaleTimeHeatmap("05:00 PM", "2013-08-10"), y: svgPadding-10+j*svgHeight, width: scaleTimeHeatmap("08:00 PM", "2013-08-10") - scaleTimeHeatmap("05:00 PM", "2013-08-10"), "class": "dinnerBracket", "height": 149})
                .style({"fill": "#eeeeee"});

            svg.selectAll('text.BG'+j).data(ticksBG).enter().append('text')
                .text(function(d){ return d; })
                .attr({'x': svgPadding*7, 'y': function(d,i){ return svgHeight*j + scaleBG(d, raw) + 3;}, 'font-size': '9px', 'class': 'BG'+j})

            svg.selectAll('line.ticksBG'+j).data(ticksBG).enter().append('line')
                .attr({'x1': svgPadding*8+'px', 'x2': svgPadding*8 + 3+'px', 'y1': function(d,i){ return scaleBG(d, raw) + j*svgHeight;}, 'y2': function(d,i){ return scaleBG(d, raw)+j*svgHeight;}, 'class': 'ticksBG'+j})
                .style({'stroke-width': '1px', 'stroke': '#999'});


            svg.selectAll('line.ticksTime'+j).data(ticksTime).enter().append('line')
                .attr({'x1': function(d,i){ return scaleTime(d, "2013/01/01")+'px';}, 'x2': function(d,i){ return scaleTime(d, "2013/01/01")+'px';}, 'y1': svgHeight - svgPadding + svgHeight*j, 'y2': svgHeight - svgPadding - 3 + j*svgHeight, 'class': 'ticksTime'+j })
                .style({'stroke-width': '1px', 'stroke': '#999'});

            svg.selectAll('text.time'+j).data(ticksTime).enter().append('text')
                .text(function(d,i){ if(i != 8){ return moment('2013/01/01 '+d).format('h A');}else{ return (moment('2013/01/01 '+d).hour()+1)/2+ ' AM'; } })
                .attr({'x': function(d,i){ return scaleTime(d, "2013/01/01") - 14+'px'; }, 'y': svgHeight - svgPadding + 15 + j*svgHeight, 'font-size': '9px', 'class': 'time'+j});
        }

        // draw the normal range
        for(var j=0; j<7; j++){
            svg.append('rect')
                .attr({'class':'normalrange', 'x': svgPadding*8, 'y': scaleBG(120, raw)+j*svgHeight, 'width': svgWidth - svgPadding*9, 'height': parseFloat(scaleBG(70, raw) - scaleBG(120,raw))})
                .style({'fill': 'rgba(200,200,200,0.5)'});
        }

    }

    function drawScatter(svg, numOfWeeks, day){
        if(numOfWeeks == undefined){
            numOfWeeks = 1;
        }

        var currentWeek = parseInt(svg.attr('id'));
        var date = [];
        var mapDay = {0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday"};

        svg.append('g').attr({'class': 'testGraph'+currentWeek});
        console.log(structured);

        var mapD = {0: "prevsat", 1: "sunday", 2: "monday", 3: "tuesday", 4: "wednesday", 5: "thursday", 6: "friday", 7: "saturday"};
        var dates = [];

        for(var i=0; i<7; i++){
            dates.push(eval("structured[currentWeek]."+mapD[i]+".dates[0]"));

        }

        console.log(currentWeek);

        svg.selectAll('text.monthIndicator').data(dates).enter().append('text')
            .attr({'x': svgPadding*5 + 15, 'y': function(d,i){ return svgHeight*(i+1)-130; }, 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 12, 'class': 'monthIndicator'})
            .text(function(d,i){ if(d != undefined){ return moment(d).format('MMM, DD') }else{ return null;}})
            .attr("text-anchor","end")
            .style({'fill': '#666', 'stroke-width': 0, 'stroke': '#666'});

        svg.selectAll('text.dayIndicator').data(dates).enter().append('text')
            .attr({'x': svgPadding*5 + 15, 'y': function(d,i){ return svgHeight*(i+1)-150; }, 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 12, 'class': 'dayIndicator'})
            .text(function(d,i){ if(d){ return mapDay[moment(d).day()]; } })
            .attr("text-anchor","end")
            .style({'fill': '#666', 'stroke-width': 0, 'stroke': '#666'});

        svg.append('g').attr({'class': 'testGraph'+currentWeek});

        for(var j=0; j<7; j++){
            var testDrive = eval('structured[currentWeek].'+mapD[j]);
            var group = svg.select('g.testGraph'+currentWeek).selectAll('g#day'+j).data(testDrive.levels).enter().append('g')
                .attr({'class': 'elementGroup','id': 'day'+j});
            group.append('circle')
                .attr({'r': 6, 'cx': function(d,i){ return scaleTime(testDrive.times[i], testDrive.dates[0]);}, 'cy': function(d,i){ return svgHeight*(j) + scaleBG(testDrive.levels[i], raw)}, 'class': 'path' + ' ' + mapD[j]})
                .style({'stroke': 'none', 'fill': function(d,i){
                    if(parseInt(d)<low){
                        return "rgba(0,0,255,0.5)";
                    }else if(parseInt(d)>high){
                        return "rgba(255,0,0,0.5)";
                    }else{
                        return "rgba(30,30,30,0.5)";
                    }
                }});

            group.append('text')
                    .attr({'x': function(d,idx){ return scaleTime(testDrive.times[idx], testDrive.dates[0])-(svgWidth-10*svgPadding)/24/2 + 6;}, 'y': function(d,idx){ return svgHeight*(j) + scaleBG(testDrive.levels[idx], raw) + 15 }, 'font-size': 9, 'id': function(d,i){ return i;}, 'class': 'BGValue' + ' ' +mapD[j]})
                    .text(function(d,i){ return parseInt(d);})
                    .style({'fill': '#000000', 'stroke-width': 0, 'stroke': '#000000'});

        }

        $(".slider.normalrange").slider()
            .on('slideStop', function(e){
                var lohi = $('.normalController .tooltip-inner').text().replace(/\s/g,'').split(':');
                low = lohi[0];
                high = lohi[1];

                svg.selectAll('rect.normalrange').attr({'y': function(d,i){
                    return scaleBG(high, raw)+i*svgHeight;
                }, 'height': parseFloat(scaleBG(low, raw) - scaleBG(high,raw))});

                svg.select('g.testGraph'+currentWeek).selectAll('g.elementGroup').selectAll('circle')
                    .style({'fill': function(d,i){
                        if(parseInt(d)<low){
                            return "rgba(0,0,255,0.5)";
                        }else if(parseInt(d)>high){
                            return "rgba(255,0,0,0.5)";
                        }else{
                            return "rgba(30,30,30,0.5)";
                        }
                    }});
            });

        svg.selectAll('.elementGroup').on('mouseover', function(d,i){ // svg.selectAll('g rect').on('mouseover', function(d,i){

            d3.select(this).select('text').transition().attr({'font-size': 20}); // 'y': parseInt(d3.select(textElement)[0][0].attr('y')) - 20,
        });

        svg.selectAll('.elementGroup').on('mouseout', function(d,i){
            d3.select(this).select('text').transition().attr({ 'font-size': 9}); //'y': parseInt(d3.select(textElement)[0][0].attr('y')) + 20,
        });
    }

///////////////
////OVERLAY////
///////////////

//helper functions
    colorMeal = function(d,i){

        // coords[index] = {x: }
        if(parseInt(d)>breakfastHigh) {
            return higherColor;
        }
        else if(parseInt(d)<low){
            return lowColor;
        }else if(parseInt(d)>high){
            return highColor;
        }else{
            return normalColor;
        }
    };

    colorNormal = function(d,i){
        console.log(high);
        console.log(parseInt(d));
        if(parseInt(d)<low){
            return lowColor;
        }else if(parseInt(d)>high){
            return highColor;
        }else{
            return normalColor;
        }
    }

    function drawGraph(mealValues, svgGraph) {
        //delete previous graph
        d3.select(".graph").selectAll("table").remove();

        //prepare data
        var columns = ["Criteria", "High", "Total", "Action"];
        var data = [{Criteria: "Half Breakfast BS > 180", High: mealValues.breakfastHigh , Total: mealValues.breakfastTotal, Action: "Change basal insulin dose" },
                    {Criteria: "Half Lunch BS > 180", High: mealValues.lunchHigh , Total: mealValues.lunchTotal, Action: "Change breakfast carb ratio" },
                    {Criteria: "Half Dinner BS > 180", High: mealValues.dinnerHigh , Total: mealValues.dinnerTotal, Action: "Change lunch carb ratio" },
                    {Criteria: "Half Bedtime BS > 180", High: mealValues.bedtimeHigh , Total: mealValues.bedtimeTotal, Action: "Change dinner carb ratio" },
                    {Criteria: "2 or More Low BS Values", High: "N/A", Total: mealValues.lowTotal, Action: "Think about previous activity" }];


        var table = d3.select(".graph").append("table")
            .attr("style", "margin-left: 250px"),
                thead = table.append("thead"),
                tbody = table.append("tbody");

        //header row
        thead.append("tr").selectAll("th")
            .data(columns).enter()
            .append("th")
                .text(function(column) { return column; });

        var rows = tbody.selectAll("tr")
            .data(data).enter()
            .append("tr");

        var cells = rows.selectAll("td")
            .data(function(row) {
                return columns.map(function(column) {
                    return {column: column, value: row[column]};
                });
            })
            .enter()
            .append("td")
            .attr("style", "font-family: Courier")
                .html(function(d) { return d.value; });
    }

    function drawOverlayCanvas(svg, id, numOfWeeks){
        if(!numOfWeeks){
            numOfWeeks = 1;
        }
        // expands the svg height a little for suggestions text
        svg.style({'height': svgHeight + svgGutter + 'px' });
        //expand svg width
        svg.style({'width': svgWidth * 1.5 + 'px'});


        svg.select(".weekIndicator").remove();

        //indicates the week on the right hand side
        svg.append('text')
            .text(function(){ return "Week " + parseInt(parseInt(svg.attr('id'))+1); })
            .attr({x: svgPadding*1-10+20, y: svgPadding-35, 'transform': 'rotate(90)', 'font-size': 25, "class": "weekIndicator"})
            .style({'fill':'#666666', 'stroke-width':0});

        //draw the axises
        var i = 0;
        svg.append('line')
            .attr({x1: svgPadding*8, x2: svgWidth - svgPadding, y1: svgHeight - svgPadding + i * svgHeight, y2: svgHeight - svgPadding + i * svgHeight })
            .style({'stroke': '#999', 'stroke-width': 1});
        svg.append('line')
            .attr({x1: svgPadding*8, x2: svgPadding*8, y1: svgHeight - svgPadding + i * svgHeight, y2: svgPadding + i * svgHeight })
            .style({'stroke': '#999', 'stroke-width': 1});

        // draw ticks
        var ticksBG = [0, 50, 100, 150, 200, 250, 300, 350];
        var ticksTimeNums = [0, 1, 2, 3, 4, 5, 6, 7];
        var ticksTime = ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];


        for(var j=0; j<1; j++){
            svg.append('rect')
                .attr({x: scaleWeek("12:00 AM", "2015-03-9"), y: svgPadding-10+j*svgHeight, width: scaleWeek("12:00 AM", "2015-03-10") - scaleWeek("12:00 AM", "2015-03-9"), "class": "mondayBracket", "height": svgHeight - svgPadding - 10})
                .style({"fill": "#eeeeee"});

            svg.append('rect')
                .attr({x: scaleWeek("12:00 AM", "2015-03-11"), y: svgPadding-10+j*svgHeight, width: scaleWeek("12:00 AM", "2015-03-12") - scaleWeek("12:00 AM", "2015-03-11"), "class": "wednesdayBracket", "height": svgHeight - svgPadding - 10})
                .style({"fill": "#eeeeee"});

            svg.append('rect')
                .attr({x: scaleWeek("12:00 AM", "2015-03-13"), y: svgPadding-10+j*svgHeight, width: scaleWeek("12:00 AM", "2015-03-14") - scaleWeek("12:00 AM", "2015-03-13"), "class": "fridayBracket", "height": svgHeight - svgPadding - 10})
                .style({"fill": "#eeeeee"});

            svg.selectAll('text.BG'+j).data(ticksBG).enter().append('text')
                .text(function(d){ return d; })
                .attr({'x': svgPadding*7, 'y': function(d,i){ return svgHeight*j + scaleBG(d, raw) + 3;}, 'font-size': '9px', 'class': 'BG'+j})

            svg.selectAll('line.ticksBG'+j).data(ticksBG).enter().append('line')
                .attr({'x1': svgPadding*8+'px', 'x2': svgPadding*8 + 3+'px', 'y1': function(d,i){ return scaleBG(d, raw) + j*svgHeight;}, 'y2': function(d,i){ return scaleBG(d, raw)+j*svgHeight;}, 'class': 'ticksBG'+j})
                .style({'stroke-width': '1px', 'stroke': '#999'});


            svg.selectAll('line.ticksTimeNums'+j).data(ticksTimeNums).enter().append('line')
                .attr({'x1': function(d,i){ return scaleTimeOverlay(d)+'px';},
                    'x2': function(d,i){ return scaleTimeOverlay(d)+'px';}, 
                    'y1': svgHeight - svgPadding + svgHeight*j, 
                    'y2': svgHeight - svgPadding - 3 + j*svgHeight, 'class': 'ticksTime'+j })
                .style({'stroke-width': '1px', 'stroke': '#999'});

            svg.selectAll('text.time'+j).data(ticksTimeNums).enter().append('text')
                .text(function(d,i) { return ticksTime[i]})
                .attr({'x': function(d,i){ return scaleTimeOverlay(d) - 14+'px'; }, 'y': svgHeight - svgPadding + 15 + j*svgHeight, 'font-size': '9px', 'class': 'time'+j});
        }

        //rectangles for mealtimes
        var offset = scaleWeek("12:00 AM", "2015-03-10") - scaleWeek("12:00 AM", "2015-03-9");
        for(var j=0; j<7; j++){
            svg.append('rect')
                .attr({x: scaleWeek("6:00 AM", "2015-03-8") + (j*offset), y: svgPadding-10, width: scaleWeek("9:00 AM", "2015-03-9") - scaleWeek("6:00 AM", "2015-03-9"), "class": "breakfastBracket", "height": svgHeight - svgPadding - 10})
                .style({"fill": "#ADD8E6"});

            svg.append('rect')
                .attr({x: scaleWeek("11:00 AM", "2015-03-8") + (j*offset), y: svgPadding-10, width: scaleWeek("2:00 PM", "2015-03-9") - scaleWeek("11:00 AM", "2015-03-9"), "class": "lunchBracket", "height": svgHeight - svgPadding - 10})
                .style({"fill": "#ADD8E6"});

            svg.append('rect')
                .attr({x: scaleWeek("5:00 PM", "2015-03-8") + (j*offset), y: svgPadding-10, width: scaleWeek("8:00 PM", "2015-03-9") - scaleWeek("5:00 PM", "2015-03-9"), "class": "dinnerBracket", "height": svgHeight - svgPadding - 10})
                .style({"fill": "#ADD8E6"});    
        }

        // draw the normal range
        for(var j=0; j<1; j++){
            svg.append('rect')
                .attr({'class':'normalrange', 'x': svgPadding*8, 'y': scaleBG(120, raw)+j*svgHeight, 'width': svgWidth - svgPadding*9, 'height': parseFloat(scaleBG(70, raw) - scaleBG(120,raw))})
                .style({'fill': 'rgba(200,200,200,0.5)'});
        }

    }

    function drawOverlay(svg, numOfWeeks, day, weeks, mealNums){
        if(numOfWeeks == undefined){
            numOfWeeks = 1;
        }

        var currentWeek = parseInt(svg.attr('id'));
        currentWeek = weeks;
        var date = [];
        var mapDay = {0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday"};

        svg.append('g').attr({'class': 'testGraph'+currentWeek});
        console.log(structured);

        var mapD = {0: "prevsat", 1: "sunday", 2: "monday", 3: "tuesday", 4: "wednesday", 5: "thursday", 6: "friday", 7: "saturday"};
        var dates = [];

        for(var i=0; i<7; i++){
            dates.push(eval("structured[currentWeek]."+mapD[i]+".dates[0]"));

        }
        console.log(currentWeek);
        console.log(day);
        console.log(structured);

        svg.selectAll('text.monthIndicator').data(dates).enter().append('text')
            .attr({'x': svgPadding*5 + 15, 'y': function(d,i){ return svgHeight*(i+1)-130; }, 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 12, 'class': 'monthIndicator'})
            .text(function(d,i){ if(d != undefined){ return moment(d).format('MMM, DD') }else{ return null;}})
            .attr("text-anchor","end")
            .style({'fill': '#666', 'stroke-width': 0, 'stroke': '#666'});

        svg.selectAll('text.dayIndicator').data(dates).enter().append('text')
            .attr({'x': svgPadding*5 + 15, 'y': function(d,i){ return svgHeight*(i+1)-150; }, 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 12, 'class': 'dayIndicator'})
            .text(function(d,i){ if(d){ return mapDay[moment(d).day()]; } })
            .attr("text-anchor","end")
            .style({'fill': '#666', 'stroke-width': 0, 'stroke': '#666'});

        svg.append('g').attr({'class': 'testGraph'+currentWeek});

        for(var j=0; j<7; j++){
            var testDrive = eval('structured[currentWeek].'+mapD[j]);
            var group = svg.select('g.testGraph'+currentWeek).selectAll('g#day'+j).data(testDrive.levels).enter().append('g')
                .attr({'class': 'elementGroup','id': 'day'+j});

            group.append('circle')
                .attr({'r': 2, 'cx': function(d,i){ return scaleWeek(testDrive.times[i], testDrive.dates[0]);}, 'cy': function(d,i){ return scaleBG(testDrive.levels[i], raw)}, 'class': 'path' + ' ' + mapD[j],
                    'meal': function(d,i){
                        //check for low times
                        if(d < low)
                            mealNums.lowTotal++;
                        //create a moment and compare the times
                        var tempTime = moment(testDrive.dates[0] + " " + testDrive.times[i]);
                        if(tempTime.isAfter(testDrive.dates[0] + " 6:00") && tempTime.isBefore(testDrive.dates[0] + " 9:00")) {
                            mealNums.breakfastTotal++;
                            return 'breakfast';
                        }
                        else if(tempTime.isAfter(testDrive.dates[0] + " 11:00") && tempTime.isBefore(testDrive.dates[0] + " 14:00")) {
                            mealNums.lunchTotal++;
                            return 'lunch';
                        }
                        else if(tempTime.isAfter(testDrive.dates[0] + " 17:00") && tempTime.isBefore(testDrive.dates[0] + " 20:00")) {
                            mealNums.dinnerTotal++;
                            return 'dinner';
                        }
                        else if(tempTime.isAfter(testDrive.dates[0] + " 20:00") && tempTime.isBefore(testDrive.dates[0] + " 24:00")) {
                            mealNums.bedtimeTotal++;
                            return 'bedtime';
                        }
                        else
                            return 'none';
                    },
                    'week': currentWeek})
                .style({'stroke': 'none', 'fill': function(d,i){
                    if(parseInt(d)<low){
                        return lowColor;
                    }else if(parseInt(d)>high){
                        return highColor;
                    }else{
                        return normalColor;
                    }
                }});

            // group.append('text')
            //         .attr({'x': function(d,idx){ return scaleTime(testDrive.times[idx], testDrive.dates[0])-(svgWidth-10*svgPadding)/24/2 + 6;}, 'y': function(d,idx){ return svgHeight*(j) + scaleBG(testDrive.levels[idx], raw) + 15 }, 'font-size': 9, 'id': function(d,i){ return i;}, 'class': 'BGValue' + ' ' +mapD[j]})
            //         .text(function(d,i){ return parseInt(d);})
            //         .style({'fill': '#000000', 'stroke-width': 0, 'stroke': '#000000'});


        }



        $(".slider.normalrange").slider()
            .on('slideStop', function(e){
                var lohi = $('.normalController .tooltip-inner').text().replace(/\s/g,'').split(':');
                low = lohi[0];
                high = lohi[1];

                svg.selectAll('rect.normalrange').attr({'y': function(d,i){
                    return scaleBG(high, raw)+i*svgHeight;
                }, 'height': parseFloat(scaleBG(low, raw) - scaleBG(high,raw))});

                svg.select('g.testGraph'+currentWeek).selectAll('g.elementGroup').selectAll('circle')
                    .style({'fill': function(d,i){
                        if(parseInt(d)<low){
                            return "rgba(0,0,255,0.5)";
                        }else if(parseInt(d)>high){
                            return "rgba(255,0,0,0.5)";
                        }else{
                            return "rgba(30,30,30,0.5)";
                        }
                    }});
            });

        svg.selectAll('.elementGroup').on('mouseover', function(d,i){ // svg.selectAll('g rect').on('mouseover', function(d,i){

            d3.select(this).select('text').transition().attr({'font-size': 20}); // 'y': parseInt(d3.select(textElement)[0][0].attr('y')) - 20,
        });

        svg.selectAll('.elementGroup').on('mouseout', function(d,i){
            d3.select(this).select('text').transition().attr({ 'font-size': 9}); //'y': parseInt(d3.select(textElement)[0][0].attr('y')) + 20,
        });
    }

    //handles displaying alerts
    function showAlert(alerts, svg) {
        var spacing = 15;
        //iterate through the map and display the corresponding alerts
        //1
        var messages= ["Your breakfast values are high.  Try changing your Lantus or Basal insulin dosage.",
            "Your lunch values are high.  Try changing your breakfast carb ratio.",
            "Your dinner values are high.  Try changing your lunch carb ratio.",
            "Your bedtime values are high.  Try changing your dinner carb ratios.",
            "You have some very low values throughout the week.  Try to think about what kind of activity may be causing low blood sugar."];

        var counter = 1;
        svg.selectAll(".alertText").remove();

        for(var key of alerts.entries()) {
            console.log(key[1]);
            //clear messages
            //show the messages if needed
            console.log(key[0]);
            if(key[1] == true) {
                svg.append('text')
                    .attr({'x': svgWidth, 'y': (svgHeight + svgGutter / 2) + (counter * spacing), 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 12, 'class': 'alertText'})
                    .text(messages[key[0]])
                    .attr("text-anchor","end")
                    .style({'fill': '#666', 'stroke-width': 0, 'stroke': '#666'});
                counter++;
            }
        }
    }

    //handle criteria
    function overlayRun(draw, drawCanvas, svgs, weeksToDisplay, map) {
                //unbind listeners
        $('#breakfastcheck').off('change');
        $('#lunchcheck').off('change');
        $('#dinnercheck').off('change');
        $('#bedtimecheck').off('change');
        $('#lowcheck').off('change');

        //to keep track of violating values at mealtime
        var mealValues = {breakfastTotal:0, lunchTotal:0, dinnerTotal:0, bedtimeTotal:0, breakfastHigh: 0, lunchHigh:0, dinnerHigh:0, bedtimeHigh:0, lowTotal:0};
        
        //main canvas and secondary for graph
        var svg = svgs[0];
        // var svgGraph = d3.select('.graph').append('svg').style({'width': svgWidth * 1.5 +'px', 'height': svgGraph +'px' }).attr({'id': "graph"});

        for(var i=0; i<weeksToDisplay; i++){
            if(i == 0)
                drawCanvas(svgs[i], $(svgs[i]).attr('id'), weeksToDisplay);
            draw(svgs[0], weeksToDisplay, map[i], i, mealValues);
        }

        //for the suggestions test
        var alerts = new Map();

        var breakfastHigh = 180;

        //count the high points for criteria
        svg.selectAll('g.elementGroup').selectAll("circle[meal='breakfast']")
            .each(function(d,i){
                if(parseInt(d)>breakfastHigh)  mealValues.breakfastHigh++;   
            });

        svg.selectAll('g.elementGroup').selectAll("circle[meal='lunch']")
            .each(function(d,i){
                if(parseInt(d)>breakfastHigh) mealValues.lunchHigh++;
            });

        svg.selectAll('g.elementGroup').selectAll("circle[meal='dinner']")
            .each(function(d,i){
                if(parseInt(d)>breakfastHigh) mealValues.dinnerHigh++;
            });

        svg.selectAll('g.elementGroup').selectAll("circle[meal='bedtime']")
            .each(function(d,i){
                if(parseInt(d)>breakfastHigh) mealValues.bedtimeHigh++;
            });

        console.log(mealValues.breakfastHigh);
        console.log(mealValues.breakfastTotal);

        //highlight points during mealtime that are too high or too low
        $('#breakfastcheck').change({svg: svg, breakfastHigh: breakfastHigh},
            function(){
                if (this.checked) {
                    var coords = [];
                    var index = 0;

                    //get x and y coords from circles
                    svg.selectAll('g.elementGroup').selectAll("circle[meal='breakfast']")
                        .each(function(d,i){
                            var current = d3.select(this);
                            if(d > 180) {
                                coords[index] = {x: current.attr("cx"), y: current.attr("cy")};
                                index++;
                            }
                        })
                    //append triangles on high meal values
                    svg.selectAll('g.mealGroup')
                        .data(coords).enter()
                        .append('path')
                            .style("stroke", "black")
                            .style("fill", "red")
                            .attr("transform", function(d){
                                return "translate(" + d.x +"," + d.y + ")";
                            })
                            .attr("d", d3.svg.symbol()
                                .size(10)
                                .type('triangle-up'))
                            .attr("meal", "breakfast")
                            .attr("status", "high");


                    // svg.append('text')
                    //     .attr({'x': svgWidth / 2 + 15, 'y': svgHeight + svgGutter / 2, 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 12, 'class': 'alertText'})
                    //     .text("alert")
                    //     .attr("text-anchor","end")
                    //     .style({'fill': '#666', 'stroke-width': 0, 'stroke': '#666'});

                    console.log("breakfast high: " + mealValues.breakfastHigh);
                    console.log("breakfast total:" + mealValues.breakfastTotal);
                    //show alert
                    if(mealValues.breakfastHigh / mealValues.breakfastTotal > 0.5) {
                        alert("More than 50% of your breakfast values are over 180");
                        alerts.set(0, true);
                        showAlert(alerts, svg);
                    }
                }
                else {
                    
                    //remove triangles
                    svg.selectAll("path[meal='breakfast']")
                        .remove();
                    //remove alert
                    alerts.set(0, false);
                    showAlert(alerts, svg);
                }
            }
        );

        $('#lunchcheck').change({svg: svg, breakfastHigh: breakfastHigh},
            function(){
                if (this.checked) {
                    var coords = [];
                    var index = 0;

                    //get x and y coords from circles
                    svg.selectAll('g.elementGroup').selectAll("circle[meal='lunch']")
                        .each(function(d,i){
                            var current = d3.select(this);
                            if(d > 180) {
                                coords[index] = {x: current.attr("cx"), y: current.attr("cy")};
                                index++;
                            }
                        })
                    //append triangles on high meal values
                    svg.selectAll('g.mealGroup')
                        .data(coords).enter()
                        .append('path')
                            .style("stroke", "black")
                            .style("fill", "red")
                            .attr("transform", function(d){
                                return "translate(" + d.x +"," + d.y + ")";
                            })
                            .attr("d", d3.svg.symbol()
                                .size(10)
                                .type('triangle-up'))
                            .attr("meal", "lunch")
                            .attr("status", "high");

                    console.log("lunch high: " + mealValues.lunchHigh);
                    console.log("lunch total:" + mealValues.lunchTotal);

                    //show alert
                    if(mealValues.lunchHigh / mealValues.lunchTotal > 0.5) {
                        alert("More than 50% of your lunch values are over 180");
                        alerts.set(1, true);
                        showAlert(alerts, svg);
                    }
                }
                else {
                    
                    //remove triangles
                    svg.selectAll("path[meal='lunch']")
                        .remove();
                    //remove alert
                    alerts.set(1, false);
                    showAlert(alerts, svg);
                }
            }
        );

        $('#dinnercheck').change({svg: svg, breakfastHigh: breakfastHigh},
            function(){
                if (this.checked) {
                    var coords = [];
                    var index = 0;

                    //get x and y coords from circles
                    svg.selectAll('g.elementGroup').selectAll("circle[meal='dinner']")
                        .each(function(d,i){
                            var current = d3.select(this);
                            if(d > 180) {
                                coords[index] = {x: current.attr("cx"), y: current.attr("cy")};
                                index++;
                            }
                        })
                    //append triangles on high meal values
                    svg.selectAll('g.mealGroup')
                        .data(coords).enter()
                        .append('path')
                            .style("stroke", "black")
                            .style("fill", "red")
                            .attr("transform", function(d){
                                return "translate(" + d.x +"," + d.y + ")";
                            })
                            .attr("d", d3.svg.symbol()
                                .size(10)
                                .type('triangle-up'))
                            .attr("meal", "dinner")
                            .attr("status", "high");

                    console.log("dinner high: " + mealValues.dinnerHigh);
                    console.log("dinner total:" + mealValues.dinnerTotal);

                    //show alert
                    if(mealValues.dinnerHigh / mealValues.dinnerTotal > 0.5) {
                        alert("More than 50% of your dinner values are over 180");
                        alerts.set(2, true);
                        showAlert(alerts, svg);
                    }
                }
                else {
                    //remove triangles
                    svg.selectAll("path[meal='dinner']")
                        .remove();
                    //remove alert
                    alerts.set(2, false);
                    showAlert(alerts, svg);
                }
            }
        );

        $('#bedtimecheck').change({svg: svg, breakfastHigh: breakfastHigh},
            function(){
                if (this.checked) {
                    var coords = [];
                    var index = 0;

                    //get x and y coords from circles
                    svg.selectAll('g.elementGroup').selectAll("circle[meal='bedtime']")
                        .each(function(d,i){
                            var current = d3.select(this);
                            if(d > 180) {
                                coords[index] = {x: current.attr("cx"), y: current.attr("cy")};
                                index++;
                            }
                        })
                    //append triangles on high meal values
                    svg.selectAll('g.mealGroup')
                        .data(coords).enter()
                        .append('path')
                            .style("stroke", "black")
                            .style("fill", "red")
                            .attr("transform", function(d){
                                return "translate(" + d.x +"," + d.y + ")";
                            })
                            .attr("d", d3.svg.symbol()
                                .size(10)
                                .type('triangle-up'))
                            .attr("meal", "bedtime")
                            .attr("status", "high");

                    console.log("bedtime high: " + mealValues.bedtimeHigh);
                    console.log("bedtime total:" + mealValues.bedtimeTotal);

                    //show alert
                    if(mealValues.bedtimeHigh / mealValues.bedtimeTotal > 0.5) {
                        alert("More than 50% of your bedtime values are over 180");
                        alerts.set(3, true);
                        showAlert(alerts, svg);
                    }
                }
                else {
                    //remove triangles
                    svg.selectAll("path[meal='bedtime']")
                        .remove();
                    //remove alert
                    alerts.set(3, false);
                    showAlert(alerts, svg);
                }
            }
        );

        $('#lowcheck').change({svg: svg, breakfastHigh: breakfastHigh},
            function(){
                if (this.checked) {
                    var coords = [];
                    var index = 0;

                    //get x and y coords from circles
                    svg.selectAll('g.elementGroup').selectAll("circle")
                        .each(function(d,i){
                            var current = d3.select(this);
                            if(d < low) {
                                coords[index] = {x: current.attr("cx"), y: current.attr("cy")};
                                index++;
                            }
                        })
                    //append triangles on high meal values
                    svg.selectAll('g.mealGroup')
                        .data(coords).enter()
                        .append('path')
                            .style("stroke", "black")
                            // .style("stroke-width", 1)
                            // .style("fill", "rgba(0,0,255,0.5)")
                            .style("fill","skyblue")
                            .attr("transform", function(d){
                                return "translate(" + d.x +"," + d.y + ")";
                            })
                            .attr("d", d3.svg.symbol()
                                .size(10)
                                .type('triangle-down'))
                            .attr("status", "low");

                    //show alert
                    if(mealValues.lowTotal > 2) {
                        alerts.set(4, true);
                        showAlert(alerts, svg);
                    }
                }
                else {
                    //remove triangles
                    svg.selectAll("path[status='low']")
                        .remove();
                    //remove alert
                    alerts.set(4, false);
                    showAlert(alerts, svg);
                }
            }
        );

        //check the checkboxes to begin
        $("#breakfastcheck").prop("checked", true).trigger("change");
        $("#lunchcheck").prop("checked", true).trigger("change");
        $("#dinnercheck").prop("checked", true).trigger("change");
        $("#bedtimecheck").prop("checked", true).trigger("change");
        $("#lowcheck").prop("checked", true).trigger("change");

        //load a summary graph
        drawGraph(mealValues, svgGraph);
    }

    $(document).ready(function(){
        // initiate the date picker
        if(getQuerystringNameValue('startDate')){
            $('#datepicker').datepicker('setValue', getQuerystringNameValue('startDate'));
            dateSel = getQuerystringNameValue('startDate');
        }else{
            if(!$('#datepicker').val()){
                $('#datepicker').datepicker('setValue', '07/01/2013');
            }
        }


        $('#datepicker').datepicker().on('changeDate', function(ev){
            dateSel = ev.date.valueOf();

            //unbind listeners
            $('#breakfastcheck').off('change');
            $('#lunchcheck').off('change');
            $('#dinnercheck').off('change');
            $('#bedtimecheck').off('change');
            $('#lowcheck').off('change');

//            queue()
//                .defer(function(i, callback){
//                    d3.json("bg/2013-07-01/2013-09-16/", function(d){
//                        raw = [];
//                        structured = [];
//                        d.forEach(function(data){
//                            raw.push(data);
//                        });
//                        callback(null,i);
//                    })
//                }, 'bg')
//                .await(run);
            loadData(dateSel);
            $(this).datepicker('hide');
        });
//        $('#datepicker').val('2013-07-01');

        loadData(dateSel);

        //criteria

    });

    function run(){
        if(mode == 0){
            var drawCanvas = drawScatterCanvas;
            var draw = drawScatter;
        }else if(mode == 1){
            var drawCanvas = drawHeatmapCanvas;
            var draw = drawHeatmap;
        }else if(mode == 2){
            var drawCanvas = drawShapeCanvas;
            var draw = drawShape;
        }else if(mode == 3){
            var drawCanvas = drawOverlayCanvas;
            var draw = drawOverlay;
        }



        // configure the radio box
        $('button[name="viewmode"][data-value="'+mode+'"]').addClass('active');

        $('.slider.weeks').slider({'tooltip': 'show'})
            .on('slideStop', function(e){
                weeksToDisplay = $(this).val();
                $('svg,hr').remove();


                for(var i=0; i<weeksToDisplay; i++){
                    svgs[i] = d3.select('.vizElement').append('svg').style({'width': svgWidth+'px', 'height': svgHeight+'px' }).attr({'id': i});
                    if(mode == 3)
                    break;
                }

                //only one draw for overlay plot
                if(mode == 3) {
                    overlayRun(draw, drawCanvas, svgs, weeksToDisplay, map);
                }
                else {
                    for(var i=0; i<weeksToDisplay; i++){
                        drawCanvas(svgs[i], $(svgs[i]).attr('id'), weeksToDisplay);
                        draw(svgs[i], weeksToDisplay, map[i]);
                    }
                }
        
                $('svg').after("<hr>");
//                console.log($(this).val());
            });


        // toggle viewmode
        $('.viewmode').click(function() {
            window.location.href = "/diabetes-viz/public/?mode=" + $(this).val() + '&startDate=' + $('#datepicker').val();
        });

        // toggle buttons
        $(".cb-enable").click(function(){
            var parent = $(this).parents('.switch');
            $('.cb-disable',parent).removeClass('selected');
            $(this).addClass('selected');

            var toggle_id = $(this).attr('id');
            switch(toggle_id) {
                case "toggle_numbers":
                    $('.BGValue').show();
                    break;
                case "toggle_mealtime":
                    $('.breakfastBracket').show();
                    $('.lunchBracket').show();
                    $('.dinnerBracket').show();
                    break;
                case "toggle_weekdays":
                	d3.selectAll('.BGValue.monday, .BGValue.tuesday, .BGValue.wednesday, .BGValue.thursday, .BGValue.friday ').style("fill", "rgb(51,51,51)");

                	if (mode == 0) {
	                	d3.selectAll('.path.monday, .path.tuesday, .path.wednesday, .path.thursday, .path.friday').style("fill", "rgba(30,30,30,0.5)");
                	} else if (mode == 1) {
    	            	d3.selectAll('.path.monday, .path.tuesday, .path.wednesday, .path.thursday, .path.friday').style("fill-opacity", "0.65");
                	} else {
	                	d3.selectAll('.path.monday, .path.tuesday, .path.wednesday, .path.thursday, .path.friday').style("stroke", "rgba(110,110,110,0.8)");
    	            }
                    break;
                case "toggle_weekends":
                	d3.selectAll('.BGValue.prevsat, .BGValue.saturday, .BGValue.sunday').style("fill", "rgb(51,51,51)");

                	if (mode == 0) {
                		d3.selectAll('.path.prevsat, .path.saturday, .path.sunday').style("fill", "rgba(30,30,30,0.5)");
                	} else if (mode == 1) {
	                	d3.selectAll('.path.prevsat, .path.saturday, .path.sunday').style("fill-opacity", "0.65");
                	} else {
    	            	d3.selectAll('.path.prevsat, .path.saturday, .path.sunday').style("stroke", "rgba(110,110,110,0.8)");
	                }
                    break;
                case "toggle_normalrange":
                	$('.normalrange').show();
                	break;
            }
        });
        $(".cb-disable").click(function(){
            var parent = $(this).parents('.switch');
            $('.cb-enable',parent).removeClass('selected');
            $(this).addClass('selected');

            var toggle_id = $(this).attr('id');
            switch(toggle_id) {
                case "toggle_numbers":
                    $('.BGValue').hide();
                    break;
                case "toggle_mealtime":
                    $('.breakfastBracket').hide();
                    $('.lunchBracket').hide();
                    $('.dinnerBracket').hide();
                    break;
                case "toggle_weekdays":
                	//d3.selectAll('.monday, .tuesday, .wednesday, .thursday, .friday ').style("fill", "rgb(180,180,180)");
                	d3.selectAll('.BGValue.monday, .BGValue.tuesday, .BGValue.wednesday, .BGValue.thursday, .BGValue.friday ').style("fill", "rgb(180,180,180)");

                	if (mode == 0) {
 	               		d3.selectAll('.path.monday, .path.tuesday, .path.wednesday, .path.thursday, .path.friday').style("fill", "rgba(30,30,30,0.2)");
                	} else if (mode == 1) {
                		d3.selectAll('.path.monday, .path.tuesday, .path.wednesday, .path.thursday, .path.friday').style("fill-opacity", "0.01");
                    } else {
 	               		d3.selectAll('.path.monday, .path.tuesday, .path.wednesday, .path.thursday, .path.friday').style("stroke", "rgba(110,110,110,0.4)");
                    }
                    break;
                case "toggle_weekends":
                	//d3.selectAll('.prevsat, .saturday, .sunday').style("fill", "rgb(180,180,180)");
                	d3.selectAll('.BGValue.prevsat, .BGValue.saturday, .BGValue.sunday').style("fill", "rgb(180,180,180)");

                	if (mode == 0) {
	                	d3.selectAll('.path.prevsat, .path.saturday, .path.sunday').style("fill", "rgba(30,30,30,0.2)");
                	} else if (mode == 1) {
                		d3.selectAll('.path.prevsat, .path.saturday, .path.sunday').style("fill-opacity", "0.01");
                	} else {
                		d3.selectAll('.path.prevsat, .path.saturday, .path.sunday').style("stroke", "rgba(110,110,110,0.4)");
                	}
                    break;
                case "toggle_normalrange":
                	$('.normalrange').hide();
                	break;
            }
        });


        $('div.spinner').hide();
        structureData();

        var svgs = [];
        var map = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
//        for(var i=0; i<7; i++){
//            svgs[i] = d3.select('.vizElement').append('svg').style({'width': svgWidth+'px', 'height': svgHeight+'px' }).attr({'id': i});
//        }

        for(var i=0; i<weeksToDisplay; i++){
            svgs[i] = d3.select('.vizElement').append('svg').style({'width': svgWidth+'px', 'height': svgHeight+'px' }).attr({'id': i});
            if(mode == 3)
                break;
        }

        $('svg').after("<hr>");

//        for(var i=0; i<7; i++){
//
////            drawScatterCanvas(svgs[i], $(svgs[i]).attr('id'), weeksToDisplay);
//            drawCanvas(svgs[i], $(svgs[i]).attr('id'), weeksToDisplay);
////            drawScatter(svgs[i], weeksToDisplay, map[i]);
//            draw(svgs[i], weeksToDisplay, map[i]);
//        }

        //only one draw for overlay plot
        if(mode == 3) {
            overlayRun(draw, drawCanvas, svgs, weeksToDisplay, map);
        }
        else {
            for(var i=0; i<weeksToDisplay; i++){
                drawCanvas(svgs[i], $(svgs[i]).attr('id'), weeksToDisplay);
                draw(svgs[i], weeksToDisplay, map[i]);
            }
        }

        console.log(structured);


        if (mode == 0) {
        	$('.scatter').show();
        } else {
        	$('.scatter').hide();
        }
    }

    $('#eraseData').click(function(e){
        if(confirm("Are your sure you want to delete the data from the database? Data cannot be restored once deleted!")){
            location.href='deleteAll';
        }
    });
});