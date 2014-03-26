var shelves = [];
var svg;
var scale;

var oldObs = {"Observations" : []};
var newObs = {"Observations" : []};
var checkN = 0;
var traffic = [];

var w = 808;
var h = w*2/3;
var strokePadding = 1;
var domainSize = 1;

var cached = false; // will need to be array later
var lastMod;

var heatRamp = ["#FFFF00", "#FFDD00", "#FFBB00", "#FF9900",
				"#FF7700", "#FF5500", "#FF3300", "#FF1100"];

var format = d3.time.format("%Y-%m-%dT%H:%M:%S%Z");
//var timeQuery = ?$filter= ResultValue eq '1' and Time ge STR_TO_DATE('2014-03-19t12:19:25-0600','%Y-%m-%dt%H:%i:%s') and Time le STR_TO_DATE('2014-03-19t12:19:26-0600','%Y-%m-%dt%H:%i:%s')

var propertyNames = [];

function createTimeQuery ( shelfN, sectionN ){
	var baseURL = shelves[shelfN].sections[sectionN].pirURL;
	var filter1 = "?$filter= ResultValue eq '1' and Time ge STR_TO_DATE('";
	var filter2 = "','%Y-%m-%dt%H:%i:%s') and Time le STR_TO_DATE('";
	var filter3 = "','%Y-%m-%dt%H:%i:%s')";

	var date = new Date();
	var realMonth = date.getMonth() + 1;
	var currentDateString = date.getFullYear() + "-" + realMonth + "-" + date.getDate() + "t" + date.getHours() + ":" + checktime(date.getMinutes()) + ":" + checktime(date.getSeconds()) + "-0600";
	var pastDate = new Date(date.getTime() - 5*60000);
	var pastDateString = pastDate.getFullYear() + "-" + realMonth + "-" + pastDate.getDate() + "t" + pastDate.getHours() + ":" + checktime(pastDate.getMinutes()) + ":" + checktime(pastDate.getSeconds()) + "-0600";

	return baseURL + filter1 + pastDateString + filter2 + currentDateString + filter3;
}

function checktime (time) {
	if (time < 10)
		time = "0" + time;
	return time;
}

var chartHeight;
var chartWidth;
var y;

$(document).ready(function () {
	svg = d3.select('#d3').append("svg")
		.attr("width", w)
		.attr("height", h);

	if( localStorage.getItem("myShelfConfig") != null ){
		var shelfJSON = localStorage.getItem("myShelfConfig");
		shelves = jQuery.parseJSON(shelfJSON);

		// Display existing shelves
		drawExisting(shelves, scale);
	}

	// Make GET requests synchronous
	$.ajaxSetup({
		async: false
	});
	// Monitor datastreams for changes
	// Photo interrupter!
	var tids = setInterval( function() { getObs("stock") }, 5000);
	// PIR Motion sensor!
	var tidm = setInterval( function() { getObs("motion") }, 3000);

	// capture the height/width defined in the div so we only have it defined in one place
	chartHeight = parseInt(document.getElementById('graph').style.height);
	chartWidth = parseInt(document.getElementById('graph').style.width);
	// Traffic graph

	// TODO we need a ceiling value
	var ceiling = 100;
	// Y scale will fit values from 0-10 within pixels 0 - height
	y = d3.scale.linear().domain([0, ceiling]).range([0, chartHeight]);
	
	/* the property names on the data objects that we'll get data from */
	propertyNames = getActiveSections(shelves);
	/* initialize the chart without any data */
	displayStackedChart("graph");



	setInterval(function () {
	var date = new Date();
	var newData = {};
	newData["id"] = "t" + date.getHours() + checktime(date.getMinutes()) + checktime(date.getSeconds());
	propertyNames.forEach(function (entry) {
		var shelfIndices = entry.split("s");
		var url = createTimeQuery( shelfIndices[1], shelfIndices[2] );
		jQuery.get(url, function ( data, textStatus, xhr ) {
			console.log(xhr.status);
			if(xhr.status < 400){
				console.log(data);
				newData[entry] = data.Observations.length;
			} else {
				newData[entry] = 0;
			}
		});
	});
	addData("graph", newData);
	}, 10000);

	//}, 5*60000);
/**
* Create an empty shell of a chart that bars can be added to
*/
function displayStackedChart(chartId) {
	// create an SVG element inside the div that fills 100% of the div
	var vis = d3.select("#" + chartId).append("svg:svg").attr("width", "100%").attr("height", "100%")
	// transform down to simulate making the origin bottom-left instead of top-left
	// we will then need to always make Y values negative
	.append("g").attr("class","barChart").attr("transform", "translate(0, " + chartHeight + ")"); 
}

function getActiveSections( shelves ) {
	var propertyNames = [];
	for ( var i = 0; i < shelves.length; i++){
			for( var j=0; j < shelves.length; j++){
				if( shelves[i].sections[j] !== undefined ){
					if( shelves[i].sections[j].pirURL != null && shelves[i].sections[j].pirURL != ""){
						propertyNames.push("s" + i + "s" + j);
					}
				}
			}
	}
	return propertyNames;
}

/**
* Add or update a bar of data in the given chart
*
* The data object expects to have an 'id' property to identify itself (id == a single bar)
* and have object properties with numerical values for each property in the 'propertyNames' array.
*/
function addData(chartId, data) {
	// it's new data so add a bar
	var barDimensions = updateBarWidthsAndPlacement(chartId);

	// select the chart and add the new bar
	var barGroup = d3.select("#" + chartId).selectAll("g.barChart")
		.append("g")
			.attr("class", "bar")
			.attr("id", chartId + "_" + data.id);
			//.attr("style", "opacity:1.0");

	// now add each data point to the stack of this bar
	for(index in propertyNames) {
		barGroup.append("rect")
			.attr("class", propertyNames[index])
		    .attr("width", (barDimensions.barWidth-1)) 
		    .attr("x", function () { return (barDimensions.numBars-1) * barDimensions.barWidth;})
		    .attr("y", barY(data, propertyNames[index])) 
		    .attr("height", barHeight(data, propertyNames[index]))
		    .attr("fill", "#555555")
		    .attr("value", data[propertyNames[index]] );
	}
}

	/**
	* Remove a bar of data in the given chart
	*
	* The data object expects to have an 'id' property to identify itself (id == a single bar)
	* and have object properties with numerical values for each property in the 'propertyNames' array.
	*/
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

	/**
	* Update the bar widths and x positions based on the number of bars.
	* @returns {barWidth: X, numBars:Y}
	*/
	function updateBarWidthsAndPlacement(chartId) {
		/**
		* Since we dynamically add/remove bars we can't use data indexes but must determine how
		* many bars we have already in the graph to calculate x-axis placement
		*/
		var numBars = document.querySelectorAll("#" + chartId + " g.bar").length + 1;

		// determine what the width of all bars should be
		var barWidth = chartWidth/numBars;
		if(barWidth > 50) {
			barWidth=50;
		}

		// reset the width and x position of each bar to fit
		var barNodes = document.querySelectorAll(("#" + chartId + " g.barChart g.bar"));
		for(var i=0; i < barNodes.length; i++) {
			d3.select(barNodes.item(i)).selectAll("rect")
				//.transition().duration(10) // animation makes the display choppy, so leaving it out
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

	/*
	* Function to calculate the Y position of a bar
	*/
	function barY(data, propertyOfDataToDisplay) {
		/*
		* Determine the baseline by summing the previous values in the data array.
		* There may be a cleaner way of doing this with d3.layout.stack() but it
		* wasn't obvious how to do so while playing with it.
		*/
		
		var baseline = 0;
		for(var j=0; j < index; j++) {
			baseline = baseline + data[propertyNames[j]];
		}
		// make the y value negative 'height' instead of 0 due to origin moved to bottom-left
		return -y(baseline + data[propertyOfDataToDisplay]);
		
		//return -y(0) - 150;
	}


	/*
	* Function to calculate height of a bar
	*/
	function barHeight(data, propertyOfDataToDisplay) {
		return y(data[propertyOfDataToDisplay]);
	}

}); // End DocumentReady

function getObs(obsType) {
	
	// Loop through all shelves and all sections!! Yikes.
	for( var i = 0; i < shelves.length; i++ )	{
		for( var j = 0; j < shelves[i].sections.length; j++){
			if (obsType == "motion"){ // PIR Motion sensor
				var obsURL = shelves[i].sections[j].pirURL;
			}else if (obsType == "stock"){ // Photo interrupter
				var obsURL = shelves[i].sections[j].pintURL;
			}
			if( obsURL != null ){
				/*console.log(i);
				console.log(j);
				console.log(obsType);*/
				jQuery.get(obsURL, function ( data, textStatus, xhr ) {
					console.log(xhr.status);
					if(xhr.status < 400){
						shelves[i].sections[j].obs = data;
						checkObs(data, obsType, i, j);
					}
				});
			}
		}
	}
}

function checkObs (obsJSON, obsType, shelfInd, sectionInd) {
	newObs = obsJSON;
	if( newObs.Observations[newObs.Observations.length - 1].ResultValue == 1 ){
		if( obsType == "stock"){
			displayStock(shelfInd, sectionInd, shelves, 1);
		} else if ( obsType == "motion" ){
			console.log("shelf: " + shelfInd + " section: " + sectionInd);
			displayMotion(shelfInd, sectionInd, shelves);
		}
	} else {
		if( obsType == "stock"){
			displayStock(shelfInd, sectionInd, shelves);
		}
	}
	oldObs = newObs;
}


function displayStock(shelfInd, sectionInd, shelves, state){
	var selector = "#shelf" + shelfInd + "sect" + sectionInd;
	
	if( state == 1){
		svg.transition().selectAll(selector)
			.transition()
			.attr("fill", "#991C3D")
			.duration(500);
	} else {
		svg.transition().selectAll(selector)
			.transition()
			.attr("fill", "#2E6E9E")
			.duration(500);
	}

}

function displayMotion(shelfInd, sectionInd, shelves){
	console.log("About to display motion");
	var selector = "#heats" + shelfInd + "s" + sectionInd;

	svg.selectAll(selector)
		.transition().duration(300)
		.attr("opacity", 0.5);

	svg.selectAll(selector)
		.transition().delay(300).duration(12000)
		.attr("opacity", 0);
}

function isOdd(num) { 
	return (num % 2) == 1;
}

function drawSections(shelfIndex, shelves, scale, delay){

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
		.attr("width", 40) // probably need to change the sizes
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
		.attr("opacity", 0)
		.transition()
		.delay(delay)
		.attr("opacity", 1)
		.duration(500);
}

function drawExisting(shelves, scale){
	if( isOdd(shelves.length) ){
		domainSize = shelves.length / 2 + 1;
	} else {
		domainSize = ( shelves.length + 1 ) / 2 + 1;
	}
	
	scale = d3.scale.linear()
		.domain([0,domainSize])
		.rangeRound([0,w/2]);

	svg.selectAll(".shelf").data(shelves).enter().append("rect")
		.attr("x", w+100) // initialize out of frame, then slide in
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
		drawSections(index, shelves, scale, 500);
		addHeat(index, shelves, scale);
	}
}

function addHeat( shelfInd, shelves, scale ) {
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
		.attr("fill", heatRamp[4])
		.attr("stroke-width", strokePadding)
		.attr("class", function (d,i) {
			return "heat" + shelfInd;
		})
		.attr("id", function (d,i) {
			console.log("Creating " + shelfInd + " " + i);
			return "heats" + shelfInd + "s" + i;
		})
		.attr("opacity", 0);
}