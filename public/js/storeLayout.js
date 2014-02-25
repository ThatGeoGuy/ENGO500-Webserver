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

var $parentAccordion;
var $accordionTemplate;

var $addSection;
var $addShelf;
var $deleteButton;

$(document).ready(function () {

	$parentAccordion = $("#parentAccordion");
	$parentAccordion.accordion(shelfConfig);
	$accordionTemplate = $(".accordion").children();

	$addSection = $("#addSection");
	$addShelf = $("#addShelf");
	$deleteButton = $('#deleteButton');

	$addSection.hide();
	$deleteButton.hide();

	// Add Shelf Button
	$addShelf.on("click", function (e) {
		e.preventDefault();

		// Create a shelf and append it to the parent accordion
		addShelfToArray( shelves );
		var $shelfElement = generateAccordion( currentShelfNumber, "shelf" );
		$parentAccordion.append($shelfElement);
		$parentAccordion.accordion("refresh");

		// Apply name to shelf
		var header = "#ui-accordion-parentAccordion-header-" + currentShelfNumber;
		var shelfDisplayNumber = currentShelfNumber + 1;
		$(header).text("Shelf " + shelfDisplayNumber);

		// Create an accordion element to hold shelf attributes
		var $attributesElement = generateAccordion(currentShelfNumber + 1, "section");
		var panel = "#ui-accordion-parentAccordion-panel-" + currentShelfNumber;
		$(panel).append($attributesElement);
		$(panel).accordion("refresh");

		// Apply content to shelf attribute accordion element
		var $attributesContent = generateAccordionContent(currentShelfNumber, "shelf", shelves);
		var attrHeader = "#ui-accordion-ui-accordion-parentAccordion-panel-" + currentShelfNumber + "-header-0";
		$(attrHeader).text("Shelf attributes");
		var attrContent = "#ui-accordion-ui-accordion-parentAccordion-panel-" + currentShelfNumber + "-panel-0";
		$(attrContent).append($attributesContent);

		addEditable( shelves, "shelf" );
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

			// Create a section and append it to a shelf
			var $shelfSectionElement = generateAccordion(activeShelfNumber + 1, "section");
			var panel = "#ui-accordion-parentAccordion-panel-" + activeShelfNumber;
			$(panel).append($shelfSectionElement);
			$(panel).accordion("refresh");

			// Apply a name to the section
			var innerHeader = "#ui-accordion-ui-accordion-parentAccordion-panel-" + activeShelfNumber + "-header-" + newSectionNumber;
			$(innerHeader).text("Section " + newSectionNumber);

			// Apply content to the section
			var $contents = generateAccordionContent( activeShelfNumber, "section", shelves );
			var innerPanel = "#ui-accordion-ui-accordion-parentAccordion-panel-" + activeShelfNumber + "-panel-" + newSectionNumber;
			$(innerPanel).append($contents);

			addEditable( shelves, "section" );
			drawSections( activeShelfNumber, shelves, scale );
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
					var headerToRemove = "#ui-accordion-ui-accordion-parentAccordion-panel-" + activeShelfNumber + "-header-" + activeSectionNumber;
					var panelToRemove = "#ui-accordion-ui-accordion-parentAccordion-panel-" + activeShelfNumber + "-panel-" + activeSectionNumber;
					$(panelToRemove).remove();
					$(headerToRemove).remove();
				}
			} else {
				// Delete shelf
				shelves.splice(activeShelfNumber, 1);

				// Remove accordion element
				var headerToRemove = "#ui-accordion-parentAccordion-header-" + activeShelfNumber;
				var panelToRemove = "#ui-accordion-parentAccordion-panel-" + activeShelfNumber;
				$(panelToRemove).remove();
				$(headerToRemove).remove();
				currentShelfNumber--;
			}
		}
	});

});

function addEditable( shelves, type ) {
	if( type == "shelf" ){

		$(".notes").editable( function(value, settings) {
			var shelfIndex = $parentAccordion.accordion("option", "active");
			shelves[shelfIndex].notes = value;
			return value;
		});

		$(".uuid").editable( function(value, settings) {
			var shelfIndex = $parentAccordion.accordion("option", "active");
			shelves[shelfIndex].rpUUID = value;
			return value;
		});

	} else {

		$(".id").editable( function(value, settings) {
			var shelfIndex = $parentAccordion.accordion("option", "active");
			var panel = "#ui-accordion-parentAccordion-panel-" + shelfIndex;
			var sectionIndex = $(panel).accordion("option", "active");
			shelves[shelfIndex].sections[sectionIndex - 1].displayID = value;
			return value;
		});

		$(".color").editable( function(value, settings) {
			var shelfIndex = $parentAccordion.accordion("option", "active");
			var panel = "#ui-accordion-parentAccordion-panel-" + shelfIndex;
			var sectionIndex = $(panel).accordion("option", "active");
			shelves[shelfIndex].sections[sectionIndex - 1].displayColor = value;
			return value;
		});

		$(".motion").editable( function(value, settings) {
			var shelfIndex = $parentAccordion.accordion("option", "active");
			var panel = "#ui-accordion-parentAccordion-panel-" + shelfIndex;
			var sectionIndex = $(panel).accordion("option", "active");
			shelves[shelfIndex].sections[sectionIndex - 1].pirURL = value;
			return value;
		});

		$(".stock").editable( function(value, settings) {
			var shelfIndex = $parentAccordion.accordion("option", "active");
			var panel = "#ui-accordion-parentAccordion-panel-" + shelfIndex;
			var sectionIndex = $(panel).accordion("option", "active");
			shelves[shelfIndex].sections[sectionIndex - 1].pintURL = value;
			return value;
		});  

	}
}

function shelf() {
	this.shelfName;
	this.notes;
	this.rpUUID;
	this.sections = [];
	return;
}

function sections() {
	this.sectionName = "Default Section name";
	this.displayId;
	this.displayColor;
	this.pirURL;
	this.pintURL;
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

function generateAccordionContent( shelfIndex, accordionType, shelvesArray ) {
		var $accordionContent = $(document.createElement("ul"));
		if ( accordionType == "shelf" ) {
			$accordionContent.append($("<li>").append("Notes: <span class=\"input notes\"" + shelvesArray[shelfIndex].notes + "</span>"));
			$accordionContent.append($("<li>").append("RasPi UUID: <span class=\"input uuid\"" + shelvesArray[shelfIndex].rpUUID + "</span>"));
		}else {
			var sectionIndex = shelvesArray[shelfIndex].sections.length - 1;
			$accordionContent.append($("<li>").append("ID: <span class=\"input id\"" + shelvesArray[shelfIndex].sections[sectionIndex].displayId + "</span>"));
			$accordionContent.append($("<li>").append("Color: <span class=\"input color\"" + shelvesArray[shelfIndex].sections[sectionIndex].displayColor + "</span>"));
			$accordionContent.append($("<li>").append("Motion sensor: <span class=\"input motion\"" + shelvesArray[shelfIndex].sections[sectionIndex].pirURL + "</span>"));
			$accordionContent.append($("<li>").append("Stock sensor: <span class=\"input stock\"" + shelvesArray[shelfIndex].sections[sectionIndex].pintURL + "</span>"));
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
var svg;
// look at viewbox example here: http://jsfiddle.net/NKRPe/60/
var w = 808;
var h = w*2/3;
var strokePadding = 1;
var domainSize = 1;

/* Scale needs its domain to size the current of shelves + blank aisles, so update
the scale domain anytime a shelf is added */
var scale = d3.scale.linear()
	.domain([0,1])
	.rangeRound([0,w]);

$(document).ready( function() {
	svg = d3.select('#d3').append("svg")
		.attr("width", w)
		.attr("height", h);
});

function drawShelves(shelves, scale){
	domainSize++;
	scale.domain([0,domainSize])
	// Move exisiting shelves and sections
	svg.transition().selectAll(".shelf")
			.duration(500)
			.attr("x", function(d,i) {
				return scale(i+1);
			});
	for(var i=0; i<shelves.length; i++){
		var selector = ".s" + i;
		svg.transition().selectAll(selector)
		.duration(500)
		.attr("x", function() {
			return scale(i+1) + 5;
		});
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
		.transition()
		.duration(500)
		.attr("x", function(d,i) {
			return scale(i+1);
		});
}

function drawSections(shelfIndex, shelves, scale){

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
		.attr("opacity", 1)
		.duration(500);
}