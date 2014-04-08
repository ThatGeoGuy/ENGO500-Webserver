$(document).ready(function () {

/**
* Store viewer ----------------------------------------------------------------
*/

// Heat Ramp for historical observations
var heatRamp = ["#FFFFFF", "#FFFF00", "#FFDD00", "#FFBB00", "#FF9900", "#FF7700", "#FF5500", "#FF3300", "#FF1100"];
var heatScale = 50;

// ceiling is the max # of observations that will be in a given time period
var ceiling = 100;

var storeW = 800,
	storeH = 510,
	strokePadding = 1;

var storeRealSVG = d3.select('#storeReal').append("svg")
	.attr("width", storeW)
	.attr("height", storeH);

var storeHistSVG = d3.select('#storeHist').append("svg")
	.attr("width", storeW)
	.attr("height", storeH);

// Create a dymanic scale which is updated when the shelves data is drawn
var scale,
	domainSize = 1,
	shelves = [];
	
// the property names on the data objects that we'll get data from
var trafficPropertyNames = [];
var stockPropertyNames = [];

// Load shelves data
$.ajax({
	type:			"get",
	url:			"/get-user-data",
	contentType:	"application/json",

	success: function(data, textStatus, jqXHR){
	if( data.length != undefined ){
		shelves = data;
	} else {
		shelves = [];
	}
	drawExisting(shelves, scale, storeRealSVG, "real");
	drawExisting(shelves, scale, storeHistSVG, "hist");
	trafficPropertyNames = getActiveSections( "motion" );
	stockPropertyNames = getActiveSections( "stock" );
	}
});

// Add slider for historic observations
$("#slider").slider({
	value: 0,
	min: 0,
	max: 24,
	step: 1,
	animate: true,
	slide: function( event, ui ) {
		$( "#amount" ).text( "Show past: " + ui.value + " h" );
	},
	stop: function( event, ui ){
		trafficPropertyNames.forEach( function (entry) {
			var shelfIndices = entry.split("s");
			var url = createHistQuery( shelfIndices[1], shelfIndices[2], "motion", ui.value );
			console.log("For motion in the past " + ui.value + " hrs");
			doHistGet(shelfIndices, url, "motion");
		});
		stockPropertyNames.forEach( function (entry) {
			var shelfIndices = entry.split("s");
			var url = createHistQuery( shelfIndices[1], shelfIndices[2], "stock", ui.value );
			console.log("For stock in the past " + ui.value + " hrs");
			doHistGet(shelfIndices, url, "stock");
		});
	}
});

var oldObs = {"Observations" : []},
	newObs = {"Observations" : []};

/**
* Traffic viewer  -------------------------------------------------------------
*/
var trafficW = 300,
	trafficH = 200;

// Y scale will fit values from 0-10 within pixels 0 - height
var y = d3.scale.linear().domain([0, ceiling]).range([0, trafficH]);

// initialize the chart without any data
displayStackedChart("traffic");

/**
* Stock viewer  ---------------------------------------------------------------
*/
var stockW = 300,
	stockH = 300;

var tau = 2 * Math.PI;

// An arc function to which you pass the endAngle
var arc = d3.svg.arc()
	.innerRadius(110)
	.outerRadius(150)
	.startAngle(0);

// Translate origin of svg to center to position arcs easily
var stockSVG = d3.select("#stock").append("svg")
	.attr("width", stockW)
    .attr("height", stockH)
	.append("g")
		.attr("transform", "translate(" + stockW / 2 + "," + stockH / 2 + ")")

var background = stockSVG.append("path")
    .datum({endAngle: tau})
    .style("fill", "#991C3D")
    .attr("d", arc);

var foreground = stockSVG.append("path")
    .datum({endAngle: tau})
    .style("fill", "#2E6E9E")
    .attr("d", arc);

/**
* Load & Monitor Data ---------------------------------------------------------
*/

// Monitor datastreams for changes
// Photo interrupter!
setInterval( function() { getObs("stock") }, 5000);
// PIR Motion sensor!
setInterval( function() { getObs("motion") }, 3000);
// Traffic parser!
var newData = {};
setInterval(function () {
	if( $.isEmptyObject( newData) == false ){
		addData("traffic", newData);
	}
	var date = new Date();
	newData = {};
	// Give each epoch an id based on the current time
	newData["id"] = "t" + date.getHours() + checktime(date.getMinutes()) + checktime(date.getSeconds());
	// Check all the active datastreams for observations that fall within the new epoch
	trafficPropertyNames.forEach(function (entry, index, array) {
		// Get the shelf indices from shelfIndeces: s#s#
		var shelfIndices = entry.split("s");
		var url = createTimeQuery( shelfIndices[1], shelfIndices[2], "motion", "active", 1 );
		doTrafficGet(entry, url, newData);
			
	});
}, 10000);
//}, 5*60000);

/**
* Functions -------------------------------------------------------------------
*
* Load & Monitor Data ---------------------------------------------------------
*/

function doTrafficGet(sectionIndex, url, newData){
	jQuery.get(url, function ( data, textStatus, xhr ) {
			if(xhr.status < 400){
				if('Observations' in data){
					newData[sectionIndex] = data.Observations.length;
				} else {
					newData[sectionIndex] = 1;
				}
			} else {
				newData[sectionIndex] = 0;
			}
		});
}

function doHistGet(sectionIndex, getURL, type){
	$.ajax({
		url: getURL,
		type: 'get',
		success: function ( data ) {
			var nObs;
			if('Observations' in data){
				nObs = data.Observations.length;
			} else {
				nObs = 1;
			}
			console.log("n Obs: " + nObs);
			if( type == "motion"){
				displayHistTraffic(sectionIndex, nObs);
			} else {
				displayHistStock(sectionIndex, nObs);
			}
		},
		error: function( req, textStatus, errorThrown ){
			var nObs = 0;
			console.log("n Obs: " + nObs);
			if( type == "motion"){
				displayHistTraffic(sectionIndex, nObs);
			} else {
				displayHistStock(sectionIndex, nObs);
			}
		}
	});
}

function displayHistTraffic( indices, n ){
	var color;
	if( n == 0 ){
		color = heatRamp[0];
	} else {
		colorind = Math.floor(n / heatScale) + 1;
		if(colorind > 8){
			colorind = 8;
		}
		color = heatRamp[colorind];
	}
	storeHistSVG.select( "#heats" + indices[1] + "s" + indices[2])
		.transition().duration(500)
		.attr("opacity", 0.5)
		.attr("fill", color);
}

function displayHistStock (indices, n ){
	storeHistSVG.select( "#stockNs" + indices[1] + "s" + indices[2])
		.transition().duration(500)
		.text(n);
}

// Set up the URL to get the observations
function getObs(obsType) {
	// Loop through all shelves and all sections
	for( var i = 0; i < shelves.length; i++ )	{
		for( var j = 0; j < shelves[i].sections.length; j++){
			// Set the url depending on what type of observation it is
			var obsURL;
			if (obsType == "motion" && shelves[i].sections[j].pirURL != null){ // PIR Motion sensor
				obsURL = createTimeQuery( i, j, "motion", "all", 60*24);
				doGet(i,j, obsURL, obsType);
			} else if (obsType == "stock" && shelves[i].sections[j].pintURL !=null){ // Photo interrupter
				//var obsURL = shelves[i].sections[j].pintURL;
				//obsURL = createTimeQuery( i, j, "stock", "all", 1);
				obsURL = shelves[i].sections[j].pintURL;
				doGet(i,j, obsURL, obsType);
			}
		}
	}
}

// Do the get Request to get observations
function doGet(shelfInd, sectionInd, URL, type) {
	jQuery.get(URL, function ( data, textStatus, xhr ) {
		if(xhr.status < 400){
			shelves[shelfInd].sections[sectionInd].obs = data;
			checkObs(data, type, shelfInd, sectionInd);
			if (type == "stock"){
				updateStockLevel();
			}
		}
	});
}

// Check what the value of the latest obs is and call the appropriate function to visualize it
function checkObs (obsJSON, obsType, shelfInd, sectionInd) {
	newObs = obsJSON;
	var resultValue = 0;
	if('Observations' in newObs){
		resultValue = newObs.Observations[newObs.Observations.length - 1].ResultValue
	} else {
		resultValue = newObs.ResultValue;
	}
	if( resultValue == 1 ){
		if( obsType == "stock"){
			displayStock(shelfInd, sectionInd, shelves, 1);
			shelves[shelfInd].sections[sectionInd].filled = false;
		} else if ( obsType == "motion" ){
			displayMotion(shelfInd, sectionInd, shelves);
		}
	} else {
		if( obsType == "stock"){
			displayStock(shelfInd, sectionInd, shelves, 0);
			shelves[shelfInd].sections[sectionInd].filled = true;
		}
	}
	oldObs = newObs;
}

function createTimeQuery ( shelfN, sectionN, obsType, obsValues, nMinutes ){
	var baseURL;
	if(obsType == "motion"){
		baseURL = shelves[shelfN].sections[sectionN].pirURL;
	} else {
		baseURL = shelves[shelfN].sections[sectionN].pintURL;
	}

	var filter1;
	if(obsValues == "all"){
		filter1 = "?$filter= Time ge STR_TO_DATE('";
	} else {
		filter1 = "?$filter= ResultValue eq '1' and Time ge STR_TO_DATE('";
	}
	var filter2 = "','%Y-%m-%dt%H:%i:%s') and Time le STR_TO_DATE('";
	var filter3 = "','%Y-%m-%dt%H:%i:%s')";

	var date = new Date();
	var realMonth = date.getMonth() + 1;
	var currentDateString = date.getFullYear() + "-" + realMonth + "-" + date.getDate() + "t" + date.getHours() + ":" + checktime(date.getMinutes()) + ":" + checktime(date.getSeconds()) + "-0600";
	var pastDate = new Date(date.getTime() - nMinutes*60000);
	var pastDateString = pastDate.getFullYear() + "-" + realMonth + "-" + pastDate.getDate() + "t" + pastDate.getHours() + ":" + checktime(pastDate.getMinutes()) + ":" + checktime(pastDate.getSeconds()) + "-0600";

	return baseURL + filter1 + pastDateString + filter2 + currentDateString + filter3;
}

function createHistQuery ( shelfN, sectionN, obsType, nHours ){
	var baseURL;
	if(obsType == "motion"){
		baseURL = shelves[shelfN].sections[sectionN].pirURL;
	} else {
		baseURL = shelves[shelfN].sections[sectionN].pintURL;
	}

	var	filter1 = "?$filter= ResultValue eq '1' and Time ge STR_TO_DATE('";
	var filter2 = "','%Y-%m-%dt%H:%i:%s') and Time le STR_TO_DATE('";
	var filter3 = "','%Y-%m-%dt%H:%i:%s')";

	var date = new Date();
	var realMonth = date.getMonth() + 1;
	var currentDateString = date.getFullYear() + "-" + realMonth + "-" + date.getDate() + "t" + date.getHours() + ":" + checktime(date.getMinutes()) + ":" + checktime(date.getSeconds()) + "-0600";
	var pastDate = new Date(date.getTime() - nHours * 60 * 60000);
	var pastDateString = pastDate.getFullYear() + "-" + realMonth + "-" + pastDate.getDate() + "t" + pastDate.getHours() + ":" + checktime(pastDate.getMinutes()) + ":" + checktime(pastDate.getSeconds()) + "-0600";

	return baseURL + filter1 + pastDateString + filter2 + currentDateString + filter3;
}

function checktime (time) {
	if (time < 10)
		time = "0" + time;
	return time;
}

/**
* Store Viewer - Create shelves + sections ------------------------------------
*/

function isOdd(num) { 
	return (num % 2) == 1;
}

function drawSections(shelfIndex, shelves, scale, delay, svg){

	var selector = ".shelf" + shelfIndex;

	var sectionScale = d3.scale.linear()
		.domain([0, shelves[shelfIndex].sections.length])
		.range([0,495]);

	svg.transition().selectAll(selector)
		.duration(500)
		.attr("y", function(d,i) {
			return sectionScale(i) + 5;
		})
		.attr("height", function(d,i) {
			return 495/shelves[shelfIndex].sections.length - 5;
		});

	// Add new sections
	svg.selectAll(selector).data(shelves[shelfIndex].sections).enter().append("rect")
		.attr("x", function () {
			if( isOdd(shelfIndex) ){
				return scale(shelfIndex) + 30;
			} else {
				return scale(shelfIndex+1) - 20;
			}
		})
		.attr("y", function(d,i) {
			return sectionScale(i) + 5;
		})
		.attr("width", 40)
		.attr("height", function(d,i) {
			return 495/shelves[shelfIndex].sections.length - 5;
		})
		.attr("rx", 5)
		.attr("ry", 5)
		.attr("fill", "#2E6E9E")
		.attr("class", "section shelf" + shelfIndex)
		.attr("id", function (d,i) {
			return "shelf" + shelfIndex +"sect" + i;
		})
		// Display Tooltip
		.on("mouseover", function (d) {
			div.transition()
				.duration(200)
				.style("opacity", .9);
			if( d.displayID == undefined ){
				div.html("Configure this section</br>on the 'Create Layout' page!")
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
			} else {
			div.html(d.displayID)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
			}
		})
		.on("mouseout", function(d) {
			div.transition()
				.duration(500)
				.style("opacity", 0)
		})
		.on("mousemove", function() {
			div
				.style("left", (d3.event.pageX) + "px")     
				.style("top", (d3.event.pageY - 28) + "px");
		})
		// Fade in
		.attr("opacity", 0)
		.transition()
		.delay(delay)
		.attr("opacity", 1)
		.duration(500);
}

function drawExisting(shelves, scale, svg, type){
	if( isOdd(shelves.length) ){
		domainSize = shelves.length / 2 + 1;
	} else {
		domainSize = ( shelves.length + 1 ) / 2 + 1;
	}
	
	scale = d3.scale.linear()
		.domain([0,domainSize])
		.rangeRound([0,storeW/2]);

	svg.selectAll(".shelf").data(shelves).enter().append("rect")
		.attr("x", storeW+100) // initialize out of frame, then slide in
		.attr("y", strokePadding)
		.attr("rx", 5)
		.attr("ry", 5)
		.attr("width", 50)
		.attr("height", 500)
		.attr("fill", "#E1EFF5")
		.attr("stroke",  "#2E6E9E")
		.attr("stroke-width", strokePadding)
		.attr("class", "shelf")
		.attr("id", function (d,i) {
			return "shelf" + i;
		})
		.transition()
		.duration(500)
		.attr("x", function(d,i) {
			if( isOdd(i) ){
				return scale(i) + 25;
			} else {
				return scale(i+1) - 25;
			}
		});

	for(var index = 0; index < shelves.length; index++){
		drawSections(index, shelves, scale, 500, svg);
		addHeat(index, shelves, scale, svg);
		if( type == "hist"){
			addStockNumber(index, shelves, scale, svg);
		}
	}
}

function addHeat( shelfInd, shelves, scale, svg ) {
	var sectionScale = d3.scale.linear()
		.domain([0, shelves[shelfInd].sections.length])
		.range([0,495]);

	var heatWidth = (scale(1) - scale(0)) * 2 - 2 * 50;
	var heatHeight = 495/shelves[shelfInd].sections.length - 5;

	svg.selectAll(".heat" + shelfInd).data(shelves[shelfInd].sections).enter().append("rect")
		.attr("x", function () {
			if( isOdd(shelfInd) ){
				return scale(shelfInd) + 75;
			} else {
				return scale(shelfInd + 1) - 25 - heatWidth;
			}
		})
		.attr("y", function(d,i) {
			return sectionScale(i) + 5;
		})
		.attr("rx", 5)
		.attr("ry", 5)
		.attr("width", heatWidth)
		.attr("height", function(d,i) {
			return 495/shelves[shelfInd].sections.length - 5;
		})
		.attr("fill", "#FF9900")
		.attr("stroke-width", strokePadding)
		.attr("class", function (d,i) {
			return "heat" + shelfInd;
		})
		.attr("id", function (d,i) {
			return "heats" + shelfInd + "s" + i;
		})
		.attr("opacity", 0);
}

function addStockNumber( shelfInd, shelves, scale, svg ) {
	var sectionScale = d3.scale.linear()
		.domain([0, shelves[shelfInd].sections.length])
		.range([0,495]);

	var heatWidth = (scale(1) - scale(0)) * 2 - 2 * 50;
	var heatHeight = 495/shelves[shelfInd].sections.length - 5;

	var elem = svg.selectAll(".stockNs" + shelfInd).data(shelves[shelfInd].sections);

	var elemEnter = elem.enter()
	    .append("g");
 
    /* Create the text for each block */
    elemEnter.append("text")
    	.attr("x", function () {
			if( isOdd(shelfInd) ){
				return scale(shelfInd) + 50;
			} else {
				return scale(shelfInd + 1);
			}
		})
		.attr("y", function(d,i) {
			return sectionScale(i) + heatHeight/2 + 6;
		})
	    .text(" ")
		.attr("class", "stockLabel")
		.attr("id", function (d,i) {
			return "stockNs" + shelfInd + "s" + i;
		})
		.attr("fill", "#FFFFFF")
		.attr("text-anchor", "middle")
		.style("font-weight", "bold")
		.attr("font-size", 18);
}

/**
* Store viewer - Display Observations -----------------------------------------
*/

// Change the color of a section depending on the state of it's stock sensor
function displayStock(shelfInd, sectionInd, shelves, state){
	var selector = "#shelf" + shelfInd + "sect" + sectionInd;
	
	if( state == 1){
		storeRealSVG.transition().selectAll(selector)
			.transition()
			.attr("fill", "#991C3D")
			.attr("value", 1)
			.duration(500);
	} else {
		storeRealSVG.transition().selectAll(selector)
			.transition()
			.attr("fill", "#2E6E9E")
			.attr("value", 0)
			.duration(500);
	}
}

// Refresh the heat map of an area if the motion sensor detects motion
function displayMotion(shelfInd, sectionInd, shelves){
	var selector = "#heats" + shelfInd + "s" + sectionInd;

	storeRealSVG.selectAll(selector)
		.transition().duration(300)
		.attr("opacity", 0.5);

	storeRealSVG.selectAll(selector)
		.transition().delay(300).duration(12000)
		.attr("opacity", 0);
}

/*
* Traffic Viewer --------------------------------------------------------------
*/

// Create an empty shell of a chart that bars can be added to
function displayStackedChart(chartId) {
	// create an SVG element inside the div that fills 100% of the div
	var trafficSVG = d3.select("#" + chartId).append("svg")
		.attr("width", "100%")
		.attr("height", "100%")
	// transform down to simulate making the origin bottom-left instead of top-left
	// Y values should be negative
	.append("g").attr("class","barChart").attr("transform", "translate(0, " + trafficH + ")"); 
}

function getActiveSections( obsType ) {
	var propertyNames = [];
	for ( var i = 0; i < shelves.length; i++){
			for( var j=0; j < shelves[i].sections.length; j++){
				if( shelves[i].sections[j] !== undefined ){
					if( obsType == "motion"){
						if( shelves[i].sections[j].pirURL != null && shelves[i].sections[j].pirURL != ""){
							propertyNames.push("s" + i + "s" + j);
						}
					} else {
						if( shelves[i].sections[j].pintURL != null && shelves[i].sections[j].pintURL != ""){
							propertyNames.push("s" + i + "s" + j);
						}
					}
				}
			}
	}
	return propertyNames;
}

// Add a bar of data
function addData(chartId, data) {
	var barDimensions = updateBarWidthsAndPlacement(chartId);

	// select the chart and add the new bar
	var barGroup = d3.select("#" + chartId).selectAll("g.barChart")
		.append("g")
			.attr("class", "bar")
			.attr("id", chartId + "_" + data.id);

	// now add each data point to the stack of this bar
	for(index in trafficPropertyNames) {
		barGroup.append("rect")
			.attr("class", trafficPropertyNames[index])
			.attr("width", (barDimensions.barWidth-1)) 
			.attr("x", function () { return (barDimensions.numBars-1) * barDimensions.barWidth;})
			.attr("y", barY(data, trafficPropertyNames[index])) 
			.attr("height", barHeight(data, trafficPropertyNames[index]))
			.attr("fill", "#555555")
			.attr("value", data[trafficPropertyNames[index]] );
	}
}

// Remove a bar of data in the given chart (UNUSED ATM)
function removeData(chartId, barId) {
	var existingBarNode = document.querySelectorAll("#" + chartId + "_" + barId);
	if(existingBarNode.length > 0) {
		// bar exists so we'll remove it
		var barGroup = d3.select(existingBarNode.item());
		barGroup
			.transition().duration(200)
			.remove();
	}
}

/* Update the bar widths and x positions based on the number of bars.
   returns {barWidth: X, numBars:Y} */
function updateBarWidthsAndPlacement(chartId) {
	// find nBars to calculate x-axis placement of bar to be removed
	var numBars = document.querySelectorAll("#" + chartId + " g.bar").length + 1;

	// determine what the width of all bars should be
	var barWidth = trafficW/numBars;
	if(barWidth > 50) {
		barWidth=50;
	}

	// reset the width and x position of each bar to fit
	var barNodes = document.querySelectorAll(("#" + chartId + " g.barChart g.bar"));
	for(var i=0; i < barNodes.length; i++) {
		d3.select(barNodes.item(i)).selectAll("rect")
			.attr("x", i * barWidth)
			.attr("width", (barWidth-1));
	}

	return {"barWidth":barWidth, "numBars":numBars};
}

/* TODO rescale the graph based on the max number of observations in a time period
function updateBarHeights(chartId, data) {
	var newHeight = 0;
	for(index in propertyNames){
		newHeight = newHeight + data[index];
	}
	if( newHeight > ceiling ){
		ceiling = newHeight;
		y.domain([0, ceiling]);

		var barNodes = document.querySelectorAll(("#" + chartId + " g.barChart g.bar"));
		for(var i=0; i < barNodes.length; i++) {
			d3.select(barNodes.item(i)).selectAll("rect")
				//.transition().duration(10) // animation makes the display choppy, so leaving it out
				.attr("y", barY(barNodes.item(i).value)
				.attr("height", );
		}
	}
}
*/

// Function to calculate the Y position of a bar
function barY(data, propertyOfDataToDisplay) {
	// Determing the y coordinate to stack the newest bar onto
	var baseline = 0;
	for(var j=0; j < index; j++) {
		baseline = baseline + data[trafficPropertyNames[j]];
	}
	// make the y value negative 'height' instead of 0 due to origin moved to bottom-left
	var returnValue;
	if(data[propertyOfDataToDisplay] == undefined){
		returnValue = -1;
	} else {
		returnValue = -y(baseline + data[propertyOfDataToDisplay]);
	}
	return returnValue;
}

// Function to calculate height of a bar
function barHeight(data, propertyOfDataToDisplay) {
	var returnValue;
	if(data[propertyOfDataToDisplay] == undefined){
		returnValue = 1;
	} else {
		returnValue = y(data[propertyOfDataToDisplay]);
	}
	return returnValue;
}

/*
* Stock Viewer --------------------------------------------------------------
*/

// Check overall level of stock and do a call to arcTween
function updateStockLevel() {
	var allSections = 0;
	var	fullSections = 0;
	for( var i = 0; i < shelves.length; i++ )	{
		for( var j = 0; j < shelves[i].sections.length; j++){
			if (shelves[i].sections[j].pintURL !== undefined ){ 
				if( shelves[i].sections[j].filled == true){
					fullSections = fullSections + 1;
				}
				allSections = allSections + 1;
			}
		}
	}
	
	foreground.transition()
		.duration(750)
		.call(arcTween, fullSections / allSections * tau);
}

// Creates a tween on the specified transition's "d" attribute, transitioning
// any selected arcs from their current angle to the specified new angle.
function arcTween(transition, newAngle) {
  transition.attrTween("d", function(d) {
    var interpolate = d3.interpolate(d.endAngle, newAngle);
    return function(t) {
      d.endAngle = interpolate(t);
      return arc(d);
    };
  });
}

// Tooltip

var div = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);


}); // End Document Ready