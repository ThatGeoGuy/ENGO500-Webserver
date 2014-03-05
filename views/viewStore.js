var shelves = [];
var svg;
var scale;

var w = 808;
var h = w*2/3;
var strokePadding = 1;
var domainSize = 1;

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
});

function drawSections(shelfIndex, shelves, scale, delay){

	var selector = ".s" + shelfIndex;

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
		.attr("x", function() {
			return scale(shelfIndex+1) + 5;
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
		.attr("class", "section s" + shelfIndex)
		.attr("opacity", 0)
		// Open accordion associated with this element when clicked
		.attr("cursor", "pointer")
		.on("click", function(d, i) {
			$parentAccordion.accordion('option', 'active', shelfIndex);
			var panel = "#ui-accordion-parentAccordion-panel-" + shelfIndex;
			var sectionIndex = $(panel).accordion("option", "active", i + 1);
		})
		.transition()
		.delay(delay)
		.attr("opacity", 1)
		.duration(500);
}

function drawExisting(shelves, scale){
	scale = d3.scale.linear()
		.domain([0,shelves.length + 1])
		.rangeRound([0,w]);

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
		.transition()
		.duration(500)
		.attr("x", function(d,i) {
			return scale(i+1);
		});

	for(var index = 0; index < shelves.length; index++){
		drawSections(index, shelves, scale, 500);
	}
}