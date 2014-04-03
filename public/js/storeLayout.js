/* --------------- JQUERY --------------- */
var shelfConfig = {
			active: false,
			collapsible: true, 
			autoHeight: false, 
			animated: "swing",
			heightStyle: "content"
	};
var shelfSectionConfig = {
			active: false,
			collapsible: true, 
			autoHeight: false,
			animated: "swing"
	};

var currentShelfNumber = 0;
var currentShelfSectionNumber = 0;
var shelves = [];
var svg;
var scale;

var $parentAccordion;
var $accordionTemplate;

var $addSection;
var $addShelf;
var $deleteButton;
var $saveButton;
var $deleteAll;

var w = 800;
var h = 510;
var strokePadding = 1;
var domainSize = 1;

$(document).ready(function () {

	$parentAccordion = $("#parentAccordion");
	$parentAccordion.accordion(shelfConfig);
	$accordionTemplate = $(".accordion").children();

	$addSection = $("#addSection");
	$addShelf = $("#addShelf");
	$deleteButton = $('#deleteButton');
	$saveButton = $('#saveButton');
	$deleteAll = $('#deleteAll');

	$addSection.hide();
	$deleteButton.hide();

	svg = d3.select('#d3').append("svg")
		.attr("width", w)
		.attr("height", h);

	// Load previous config
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
			drawExisting(shelves, scale);
			for( var i = 0; i < shelves.length; i++){
				makeAccordion( shelves, i, 0, "shelf");
				for( var j = 0; j < shelves[i].sections.length; j++){
					makeAccordion( shelves, i, j + 1, "section");
				}
			}
			manageSectionButton();
			currentShelfNumber = shelves.length;
		}
	});

	// Add Shelf Button
	$addShelf.on("click", function (e) {
		e.preventDefault();

		// Create a shelf and append it to the parent accordion
		addShelfToArray( shelves );
		makeAccordion( shelves, currentShelfNumber, 0, "shelf" )
		drawShelves( shelves, scale );
		manageSectionButton();
		currentShelfNumber++;
	});

	// Add section button
	$addSection.on("click", function (e) {
		e.preventDefault();

		var activeShelfNumber = $parentAccordion.accordion("option", "active");
		shelves[activeShelfNumber].sections.push( new sections() );
		var newSectionNumber = shelves[activeShelfNumber].sections.length;
		makeAccordion( shelves, activeShelfNumber, newSectionNumber, "section");
		drawSections( activeShelfNumber, shelves, scale, 0 );
	});

	// Delete button
	$deleteButton.on("click", function(e) {
		e.preventDefault();

		var activeShelfNumber = $parentAccordion.accordion("option", "active");
		var activePanel = "#ui-accordion-parentAccordion-panel-" + activeShelfNumber;
		var activeSectionNumber = $(activePanel).accordion("option", "active");
		
		if(activeShelfNumber !== false){
			if(activeSectionNumber !== false){
				// Delete section
				if( activeSectionNumber == 0){
					console.log("Shelf attributes section cannot be removed");
				} else {
					// Remove section from array
					shelves[activeShelfNumber].sections.splice(activeSectionNumber - 1, 1);

					// Remove accordion element
					var header = "ui-accordion-ui-accordion-parentAccordion-panel-" + activeShelfNumber + "-header-";
					var panel = "ui-accordion-ui-accordion-parentAccordion-panel-" + activeShelfNumber + "-panel-";
					$("#" + panel + activeSectionNumber).remove();
					$("#" + header + activeSectionNumber).remove();

					// Rename remaning element #IDs					
					$(activePanel + " h3").each(function (i) {
						$(this).attr("id", header + i);
						if( i !=0 ){
							$(this).text("Section " + i);
						}
					});
					$(activePanel + " div").each(function (i) {
						$(this).attr("id", panel + i);
					});
				}
			} else {
				// Delete shelf
				shelves.splice(activeShelfNumber, 1);

				// Remove accordion element
				var header = "ui-accordion-parentAccordion-header-";
				var panel = "ui-accordion-parentAccordion-panel-";
				$("#" + panel + activeShelfNumber).remove();
				$("#" + header + activeShelfNumber).remove();
				currentShelfNumber--;

				// Rename remaining element #IDs
				$("#parentAccordion > h3").each(function (i) {
					$(this).attr("id", header + i);
					var n = i + 1;
					$(this).text("Shelf " + n);
				});
				$("#parentAccordion > div").each(function (i) {
					$(this).attr("id", panel + i);
				});
				// Rename children of remaning elements to reflect parent #ID change
				for( var i = 0; i < shelves.length; i++){
					var panelSelect = "#ui-accordion-parentAccordion-panel-" + i;
					var childHeader = "ui-accordion-ui-accordion-parentAccordion-panel-" + i + "-header-";
					var childPanel = "ui-accordion-ui-accordion-parentAccordion-panel-" + i + "-panel-";
					$(panelSelect + " h3").each(function (j) {
						$(this).attr("id", childHeader + j);
					});
					$(panelSelect + " div").each(function (k) {
						$(this).attr("id", childPanel + k);
					});
				}
			}
		}
		// Remove svg
		eraseShelves(shelves, scale);
		$parentAccordion.accordion("refresh");
	});

	// Save button
	$saveButton.on("click", function(e) {
		e.preventDefault();

		$.ajax({
			type:			"post",
			url:			"/set-user-data",
			contentType:	"application/json",
			data:			JSON.stringify( shelves )
		});
	});

	// Delete all
	$deleteAll.on("click", function(e) {
		e.preventDefault();

		$.ajax({
			type:			"post",
			url:			"/set-user-data",
			contentType:	"application/json",
			data:			[],

			success: function() {
				window.location.reload(true);
			}
		});

	});

});

function makeAccordion( shelves, shelfNumber, sectionNumber, accordionType ) {
	if (accordionType == "shelf"){
		var $shelfElement = generateAccordion( shelfNumber, "shelf" );
		$parentAccordion.append($shelfElement);
		$parentAccordion.accordion("refresh");

		// Apply name to shelf
		var header = "#ui-accordion-parentAccordion-header-" + shelfNumber;
		var shelfDisplayNumber = shelfNumber + 1;
		$(header).text("Shelf " + shelfDisplayNumber);

		// Create an accordion element to hold shelf attributes
		var $attributesElement = generateAccordion(shelfNumber + 1, "section");
		var panel = "#ui-accordion-parentAccordion-panel-" + shelfNumber;
		$(panel).append($attributesElement);
		$(panel).accordion("refresh");

		// Apply content to shelf attribute accordion element
		var $attributesContent = generateAccordionContent(shelfNumber, "shelf");
		var attrHeader = "#ui-accordion-ui-accordion-parentAccordion-panel-" + shelfNumber + "-header-0";
		$(attrHeader).text("Shelf attributes");
		var attrContent = "#ui-accordion-ui-accordion-parentAccordion-panel-" + shelfNumber + "-panel-0";
		$(attrContent).append($attributesContent);

		addEditable( shelves, "shelf", shelfNumber, 0 );
	} else {
		// Create a section and append it to a shelf
		var $shelfSectionElement = generateAccordion(shelfNumber + 1, "section");
		var panel = "#ui-accordion-parentAccordion-panel-" + shelfNumber;
		$(panel).append($shelfSectionElement);
		$(panel).accordion("refresh");

		// Apply a name to the section
		var innerHeader = "#ui-accordion-ui-accordion-parentAccordion-panel-" + shelfNumber + "-header-" + sectionNumber;
		$(innerHeader).text("Section " + sectionNumber);

		// Apply content to the section
		var $contents = generateAccordionContent( shelfNumber, "section", shelves );
		var innerPanel = "#ui-accordion-ui-accordion-parentAccordion-panel-" + shelfNumber + "-panel-" + sectionNumber;
		$(innerPanel).append($contents);

		addEditable( shelves, "section", shelfNumber, sectionNumber );
	}
}

function addEditable( shelves, type, shelfNumber, sectionNumber ) {
	if( type == "shelf" ){

		$(".notes").not(".editable").editable({
			defaultValue : shelves[shelfNumber].notes,
			success	: function(response, newValue){
				shelves[shelfNumber].notes = newValue;
			},
			display: function(value){
				if ( shelves[shelfNumber].notes == undefined ){
					$(this).text("Click to edit");
				} else {
					$(this).text(shelves[shelfNumber].notes);
				}
			}
		});

		$(".uuid").not(".editable").editable({
			defaultValue : shelves[shelfNumber].uuid,
			success	: function(response, newValue){
				shelves[shelfNumber].uuid = newValue;
			},
			display: function(value){
				if ( shelves[shelfNumber].uuid == undefined ){
					$(this).text("Click to edit");
				} else {
					$(this).text(shelves[shelfNumber].uuid);
				}
			}
		});

	} else {

		$(".id").not(".editable").editable({
			defaultValue : shelves[shelfNumber].sections[sectionNumber - 1].displayID,
			success	: function(response, newValue){
				shelves[shelfNumber].sections[sectionNumber - 1].displayID = newValue;
			},
			display: function(value){
				if ( shelves[shelfNumber].sections[sectionNumber - 1].displayID == undefined ){
					$(this).text("Click to edit");
				} else {
					$(this).text(shelves[shelfNumber].sections[sectionNumber - 1].displayID);
				}
			}
		});

		$(".motion").not(".editable").editable({
			defaultValue : shelves[shelfNumber].sections[sectionNumber - 1].pirURL,
			success	: function(response, newValue){
				shelves[shelfNumber].sections[sectionNumber - 1].pirURL = newValue;
			},
			display: function(value){
				if ( shelves[shelfNumber].sections[sectionNumber - 1].pirURL == undefined ){
					$(this).text("Click to edit");
				} else {
					$(this).text(shelves[shelfNumber].sections[sectionNumber - 1].pirURL);
				}
			}
		});

		$(".stock").not(".editable").editable({
			defaultValue : shelves[shelfNumber].sections[sectionNumber - 1].pintURL,
			success	: function(response, newValue){
				shelves[shelfNumber].sections[sectionNumber - 1].pintURL = newValue;
			},
			display: function(value){
				if ( shelves[shelfNumber].sections[sectionNumber - 1].pintURL == undefined ){
					$(this).text("Click to edit");
				} else {
					$(this).text(shelves[shelfNumber].sections[sectionNumber - 1].pintURL);
				}
			}
		});

	}
}

function shelf() {
	this.notes;
	this.rpUUID;
	this.sections = [];
	return;
}

function sections() {
	this.displayId;
	this.pirURL;
	this.pintURL;
	this.filled;
	return;
}

function getAccordionTemplate() {
		 return $accordionTemplate.clone();   
}

function generateAccordion( number, accordionType ) {
		var $accordion = getAccordionTemplate();
		var $accordionWithEvents = attachAccordionEvents( $accordion, accordionType );
		return $accordionWithEvents;
}

function generateAccordionContent( shelfIndex, accordionType) {
		var $accordionContent = $(document.createElement("ul"));
		$accordionContent.addClass("attributeUl");
		if ( accordionType == "shelf" ) {
			$accordionContent.append($("<li>").append("Notes: <span class=\"input notes\"></span>"));
			$accordionContent.append($("<li>").append("RasPi UUID: <span class=\"input uuid\"></span>"));
		}else {
			$accordionContent.append($("<li>").append("ID: <span class=\"input id\"></span>"));
			$accordionContent.append($("<li>").append("Motion sensor: <span class=\"input motion\"></span>"));
			$accordionContent.append($("<li>").append("Stock sensor: <span class=\"input stock\"></span>"));
		}
		
		return $accordionContent;
}

function attachAccordionEvents( $accordionElement, accordionType ) {
		if (accordionType == "shelf") {
				$accordionElement.accordion(shelfConfig);
		} else {
				$accordionElement.accordion(shelfSectionConfig);
		}
		return $accordionElement;
}

// change 
function manageSectionButton() {
		if ( $parentAccordion.children().length > 0 ) {
				$addSection.fadeIn("slow");
				$deleteButton.fadeIn("slow");
		} else {
				$addSection.hide();
		}
}

function addShelfToArray( shelvesArray ) {
	shelvesArray.push( new shelf );
	return;
}

/* --------------- D3 --------------- */
// look at viewbox example here: http://jsfiddle.net/NKRPe/60/

/* Scale needs its domain to size the current of shelves + blank aisles, so update
the scale domain anytime a shelf is added */
scale = d3.scale.linear()
	.domain([0,domainSize])
	.rangeRound([0,w/2]);

function isOdd(num) { 
	return (num % 2) == 1;
}

function drawShelves(shelves, scale){
	// If nShelves is odd, a new scale needs to be calculated to add space for two new shelves
	if( isOdd(shelves.length) ){
		domainSize++;
	}
	scale.domain([0,domainSize])
	
	// Move exisiting shelves and sections
	svg.transition().selectAll(".shelf")
			.duration(500)
			.attr("x", function(d,i) {
				if( isOdd(i) ){
					return scale(i) + 25;
				} else {
					return scale(i+1) - 25;
				}
			});
	if( isOdd(shelves.length)){
		for(var i=0; i<shelves.length; i++){
			var selector = ".shelf" + i;
			svg.transition().selectAll(selector)
			.duration(500)
			.attr("x", function() {
				if( isOdd(i) ){
					return scale(i) + 30;
				} else {
					return scale(i+1) - 20;
				}
			});
		}
	}

	// Add the newest shelf
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
}

function drawSections(shelfIndex, shelves, scale, delay){

	var selector = ".shelf" + shelfIndex;
	var sectionIDnum = shelves[shelfIndex].sections.length - 1;
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
			return "shelf" + shelfIndex + "sect" + i;
		})
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

function drawExisting(shelves){
	if( isOdd(shelves.length) ){
		domainSize = shelves.length / 2 + 1;
	} else {
		domainSize = ( shelves.length + 1 ) / 2 + 1;
	}
	
	scale = d3.scale.linear()
		.domain([0,domainSize])
		.rangeRound([0,w/2]);

	svg.selectAll(".shelf").data(shelves).enter().append("rect")
		.attr("x", function(d,i) {
			if( isOdd(i) ){
				return scale(i) + 25;
			} else {
				return scale(i+1) - 25;
			}
		})
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
		.attr("opacity", 0)
		.transition()
		.duration(500)
		.attr("opacity", 1);

	for(var index = 0; index < shelves.length; index++){
		drawSections(index, shelves, scale, 100);
	}
}

function eraseShelves(shelves, scale) {
	svg.selectAll(".shelf")
		.remove();

	svg.selectAll(".section")
		.remove();

	drawExisting(shelves, scale);
}