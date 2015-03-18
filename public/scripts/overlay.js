    function drawOverlayCanvas(svg, id, numOfWeeks){
        if(!numOfWeeks){
            numOfWeeks = 1;
        }
        // expands the svg height according to the # of weeks to be displayed
        // svg.style({'height': svgHeight*4 + 'px' });

        //addjust svg height and 
        // svgHeight = svgHeight * 4;

        //get width of the graph
        var graphWidth = svgPadding*8 - svgWidth - svgPadding; 

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
        alert(day);
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
                        //create a moment and compare the times
                        var tempTime = moment(testDrive.dates[0] + " " + testDrive.times[i]);
                        console.log(tempTime.toDate());
                        console.log(moment(testDrive.dates[0] + " 6:00").toDate());
                        if(tempTime.isAfter(testDrive.dates[0] + " 6:00") && tempTime.isBefore(testDrive.dates[0] + " 9:00")) {
                            console.log(testDrive.times[i]);
                            console.log("breakfast");
                            mealNums.breakfastTotal++;
                            return 'breakfast';
                        }
                        else if(tempTime.isAfter(testDrive.dates[0] + " 11:00") && tempTime.isBefore(testDrive.dates[0] + " 14:00")) {
                            console.log(testDrive.times[i]);
                            console.log("lunch");
                            mealNums.lunchTotal++;
                            return 'lunch';
                        }
                        else if(tempTime.isAfter(testDrive.dates[0] + " 17:00") && tempTime.isBefore(testDrive.dates[0] + " 20:00")) {
                            console.log(testDrive.times[i]);
                            console.log("dinner");
                            mealNums.dinnerTotal++;
                            return 'dinner';
                        }
                        else
                            return 'none';
                    },
                    'week': currentWeek})
                .style({'stroke': 'none', 'fill': function(d,i){
                    if(parseInt(d)<low){
                        return "rgba(0,0,255,0.5)";
                    }else if(parseInt(d)>high){
                        return "rgba(255,0,0,0.5)";
                    }else{
                        return "rgba(30,30,30,0.5)";
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


    //handle criteria
    function overlayRun(draw, drawCanvas, svgs, weeksToDisplay, map) {
        var svg = svgs[0];
        //to keep track of violating values at mealtime
        var mealValues = {breakfastTotal:0, lunchTotal:0, dinnerTotal:0, breakfastHigh: 0, lunchHigh:0, dinnerHigh:0};
        for(var i=0; i<weeksToDisplay; i++){
            if(i == 0)
                drawCanvas(svgs[i], $(svgs[i]).attr('id'), weeksToDisplay);
            draw(svgs[0], weeksToDisplay, map[i], i, mealValues);
        }

        //highlight points during mealtime taht are too high or too low
        var breakfastHigh = 180;
        svg.selectAll('g.elementGroup').selectAll("circle[meal='breakfast']")
                .style({'fill': function(d,i){
                    if(parseInt(d)>breakfastHigh) {
                        mealValues.breakfastHigh++;
                        return "rgba(255,255,0,0.5)";
                    }
                    else if(parseInt(d)<low){
                        return "rgba(0,0,255,0.5)";
                    }else if(parseInt(d)>high){
                        return "rgba(255,0,0,0.5)";
                    }else{
                        return "rgba(30,30,30,0.5)";
                    }
                }
            }
        );

        svg.selectAll('g.elementGroup').selectAll("circle[meal='lunch']")
                .style({'fill': function(d,i){
                    if(parseInt(d)>breakfastHigh) {
                        mealValues.lunchHigh++;
                        return "rgba(255,255,0,0.5)";
                    }
                    else if(parseInt(d)<low){
                        return "rgba(0,0,255,0.5)";
                    }else if(parseInt(d)>high){
                        return "rgba(255,0,0,0.5)";
                    }else{
                        return "rgba(30,30,30,0.5)";
                    }
                }
            }
        );

        svg.selectAll('g.elementGroup').selectAll("circle[meal='dinner']")
                .style({'fill': function(d,i){
                    if(parseInt(d)>breakfastHigh) {
                        mealValues.dinnerHigh++;
                        return "rgba(255,255,0,0.5)";
                    }
                    else if(parseInt(d)<low){
                        return "rgba(0,0,255,0.5)";
                    }else if(parseInt(d)>high){
                        return "rgba(255,0,0,0.5)";
                    }else{
                        return "rgba(30,30,30,0.5)";
                    }
                }
            }
        );

        console.log(mealValues.breakfastHigh);
        console.log(mealValues.breakfastTotal);
        if(mealValues.breakfastHigh / mealValues.breakfastTotal > 0.5)
            alert("More than 50% of your breakfast values are over 180");
        if(mealValues.lunchHigh / mealValues.lunchTotal > 0.5)
            alert("More than 50% of your lunch values are over 180");
        if(mealValues.dinnerHigh / mealValues.dinnerHigh > 0.5)
            alert("More than 50% of your dinner values are over 180");

    }