var shelves = [];
var svg;
var scale;

var oldObs = {"Observations" : []};
var newObs = {"Observations" : []};
var checkN = 0;

var w = 808;
var h = w*2/3;
var strokePadding = 1;
var domainSize = 1;

var cached = false; // will need to be array later
var lastMod;

var heatRamp = ["#FFFF00", "#FFDD00", "#FFBB00", "#FF9900",
				"#FF7700", "#FF5500", "#FF3300", "#FF1100"];

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
});

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