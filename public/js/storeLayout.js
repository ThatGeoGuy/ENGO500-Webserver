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

$(document).ready(function () {
  $parentAccordion = $("#parentAccordion");
  $parentAccordion.accordion(shelfConfig);
  $accordionTemplate = $(".accordion").children();

  $addSection = $("#addSection");
  $addShelf = $("#addShelf");

  $addSection.hide();

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

    drawShelves( shelves, scale );

    manageSectionButton();
    currentShelfNumber++;
  });

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

      drawSections(activeShelfNumber, shelves, scale);
  });

});

function shelf() {
  this.shelfName = "Default shelf name";
  this.notes = "Some notes about the shelf";
  this.rpUUID = "#######";
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
      $accordionContent.append($("<li>").append("Notes: " + shelvesArray[shelfIndex].notes));
      $accordionContent.append($("<li>").append("RasPi UUID: " + shelvesArray[shelfIndex].rpUUID));
    }else {
      var sectionIndex = shelvesArray[shelfIndex].sections.length - 1;
      $accordionContent.append($("<li>").append("ID: " + shelvesArray[shelfIndex].sections[sectionIndex].displayId));
      $accordionContent.append($("<li>").append("Color: " + shelvesArray[shelfIndex].sections[sectionIndex].displayColor));
      $accordionContent.append($("<li>").append("Motion sensor: " + shelvesArray[shelfIndex].sections[sectionIndex].pirURL));
      $accordionContent.append($("<li>").append("Stock sensor: " + shelvesArray[shelfIndex].sections[sectionIndex].pintURL));
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
        $addSection.show();
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
var w = 1000;
var h = w*2/3;
var strokePadding = 1;

/* Scale needs its domain to size the current of shelves + blank aisles, so update
the scale domain anytime a shelf is added */
var scale = d3.scale.linear()
  .domain([0,2])
  .rangeRound([0,w]);

$(document).ready( function() {
  svg = d3.select('#d3').append("svg")
    .attr("width", w)
    .attr("height", h);
});

function drawShelves(shelves, scale){
  // Move exisiting shelves and sections
  svg.transition().selectAll(".shelf")
      .duration(500)
      .attr("x", function(d,i) {
        return scale(i+1) - 25;
      });
  svg.transition().selectAll(".section")
      .duration(500)
      .attr("x", function(d,i) {
        return scale(i+1) - 20;
      });

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

  //drawSections(shelves.length - 1, shelves, scale);
  // update domain of scale... use +1 to offset 0 index, and +1 to add one
  scale.domain([0,shelves.length + 1 + 1]);
  // if size of all elements is bigger than w, scale w
}

function drawSections(shelfIndex, shelves, scale){

  var sectionScale = d3.scale.linear()
    .domain([0, shelves[shelfIndex].sections.length + 1])
    .range([0,500]);

  svg.transition().selectAll(".section")
    .duration(500)
    .attr("height", function(d,i) {
      return sectionScale(i+1);
    });

  // Add new sections
  svg.selectAll(".section").data(shelves[shelfIndex].sections).enter().append("rect")
    .attr("x", function() {
      return scale(shelfIndex+1) + 5;
    })
    .attr("y", function(d,i) {
      return sectionScale(i) + 5;
    })
    .attr("width", 40) //probably need to change the sizes
    .attr("height", function() {
      return 500/shelves[shelfIndex].sections.length - 10;
    })
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "#2E6E9E")
    .attr("class", "section")
    .attr("opacity", 0)
    .transition()
    .attr("opacity", 1)
    .duration(500);
  }

/* Starting at 0, every entry 1,4,7,10 (+3) needs to be blank
make a function that maps a blank aisle if the index requires it
function drawAisleSpace() {
  var rect = svg.selectAll("rect").enter().append("rect")
  .attr(
}
*/