/* --------------- JQUERY --------------- */
var shelfConfig;
var shelfSectionConfig;

var currentShelfNumber = 0;
var currentShelfSectionNumber = 0;
var shelves = [];

var $control;
var $accordionTemplate;

var $addSection;
var $addShelf;

$(document).ready(function () {
  shelfConfig = {
      collapsible: true, 
      autoHeight: false, 
      animated: "swing",
      heightStyle: "content"
  }

  shelfSectionConfig = {
      active:false,
      collapsible: true, 
      autoHeight: false,
      animated: "swing"
  }


  $control = $("#control");
  $accordionTemplate = $(".template").children();

  $addSection = $("#addSection");
  $addShelf = $("#addShelf");

  $addSection.hide();

  $addShelf.on("click", function(e) {
    e.preventDefault();

    var newShelfNumber = currentShelfNumber + 1;
    addShelfToArray( newShelfNumber, shelves );
    var $shelfElement = generateAccordion( newShelfNumber, "shelf", shelves );

    currentShelfNumber = newShelfNumber;

    $control.append( $shelfElement );

    manageSectionButton();

    var activeShelf = currentShelfNumber - 1
    var $shelfSectionElement = generateAccordion( activeShelf, "section", shelves );
    var $activeShelfElement = $control.children().last().find(".accordion-content");
    $activeShelfElement.append( $shelfSectionElement );

    // Call D3 draw function
    drawShelves(shelves, scale);
  });

  $addSection.on("click", function(e) {
    e.preventDefault();

    var activeShelf = $('.accordion').accordion( "option", "active"); // +1 for 0 index
    shelves[activeShelf].sections.push( new sections() );
    var $shelfSectionElement = generateAccordion( activeShelf, "section", shelves );
    var $activeShelfElement = $control.children().last().find(".accordion-content");
    //var $activeShelfElement = $('.accordion').accordion( "option", "active").find(".accordion-content");
    $activeShelfElement.append( $shelfSectionElement );

    // Call D3 draw function
    drawSections(activeShelf, shelves, scale);
  });

});

function shelf() {
  this.shelfName = "Default shelf name";
  this.notes = "Some notes about the shelf";
  this.rpUUID = "#######";
  this.sections = [];
  this.sections.push( new sections());
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

function generateAccordion( number, accordionType, shelvesArray ) {
    var $accordion = getAccordionTemplate();
    var accordionTitle;
    var $accordionContent;

    if ( accordionType == "shelf" ) {
        accordionTitle = "Shelf " + number;
        //$accordionContent = generateAccordionContent( number, "shelf", shelvesArray );
    } else {
        accordionTitle = "Shelf Section";
        //$accordionContent = generateAccordionContent( number, "section", shelvesArray );
    }

    $accordion.find("h3").text( accordionTitle );
    $accordion.find("div").append( $accordionContent );

    var $accordionWithEvents = attachAccordionEvents( $accordion, accordionType );

    return $accordionWithEvents;
}

function generateAccordionContent( number, accordionType, shelvesArray ) {
    var $accordionContent = document.createElement("ul");
    var shelfIndex = number - 1;
    var sectionIndex = shelvesArray[shelfIndex].sections.length - 1;

    if ( accordionType == "shelf" ) {
      $accordionContent.append("<li>").text("Notes: " + shelvesArray[shelfIndex].notes);
      $accordionContent.append("<li>").text("RasPi UUID: " + shelvesArray[shelfIndex].rpUUID);
    } else {
      $accordionContent.append("<li>").text("ID: " + shelvesArray[shelfIndex].sections[sectionIndex].displayId);
      $accordionContent.append("<li>").text("ID: " + shelvesArray[shelfIndex].sections[sectionIndex].displayColor);
      $accordionContent.append("<li>").text("ID: " + shelvesArray[shelfIndex].sections[sectionIndex].pirURL);
      $accordionContent.append("<li>").text("ID: " + shelvesArray[shelfIndex].sections[sectionIndex].pintURL);
    }

    return $accordionContent;
}

function attachAccordionEvents( $accordionElement, accordionType ) {
    if ( accordionType == "shelf" ) {
        $accordionElement.accordion( shelfConfig );
    } else {
        $accordionElement.accordion( shelfSectionConfig );    
    }

    return $accordionElement;
}

function manageSectionButton() {
    if ( $control.children().length > 0 ) {
        $addSection.show();
    } else {
        $addSection.hide();
    }
}

function addShelfToArray( number, shelvesArray) {
  var shelfIndex = number - 1;

  shelvesArray.push( new shelf );
  shelvesArray[shelfIndex].sections[0].nSections++;
  return;
}

// --- Old code for reference -- 

/// var activeShelf = 0;
/* Code to add new shelves and sections */
/// var shelves = [];
/// var shelfIndex = 0;
//var sectionIndex = 0;
///var testing;

///$(document).ready(function() {
  /* Add a shelf to the accordion */
/*  $('#addShelf').click(function () {
    addShelf(shelves);
    createShelf(shelves, shelfIndex);
    addShelfContent(shelves, shelfIndex);
    var sectionIndex = 0;
    createSection(shelves, shelfIndex, sectionIndex);
    addSectionContent(shelves, shelfIndex, sectionIndex);
    $('.accordion').accordion("refresh");
    //$('.child-accordion').accordion("refresh");
    shelfIndex++;
    drawShelves(shelves, scale);
  });

  $('#addSection').click(function () {
    activeShelf = $('.accordion').accordion( "option", "active");
    activeShelf = activeShelf - 1; // Because the example section is still there, subtract 1 to get array index
    shelves[activeShelf].sections.push(new sections());
    createSection(shelves, activeShelf, shelves[activeShelf].sections.length - 1);
    addSectionContent(shelves, activeShelf, shelves[activeShelf].sections.length - 1);
    drawSections(activeShelf, shelves, scale);
  });
});
*/

/*
function addShelf(shelvesArray) {
  shelvesArray.push(new shelf);
  shelvesArray[shelfIndex].sections[0].nSections++;
  return;
}

function createShelf(shelvesArray, shelfIndex) {
  $('.accordion')
    .append("<h3 id=\"shelf" + shelfIndex + "\">" + shelves[shelfIndex].shelfName + "<\/h3>")
    .append("<div id=\"shelf" + shelfIndex + "sections\" class=\"child-accordion\"><\/div>")
  return;
}

function addShelfContent(shelvesArray, shelfIndex) {
  $('#shelf' + shelfIndex + 'sections')
    .append("<h3>Attributes</h3>")
    .append("<div id=\"shelf" + shelfIndex + "attr\"></div>")
    .append("<img class=\"editPencil\" src=\"img/icons/pen.png\" onclick=editShelf()><\/img>");
  
  $('#shelf' + shelfIndex + 'attr')
    .append("<ul><li>Notes: " + shelves[shelfIndex].notes + "<\/li>" +
            "<li>Raspberry Pi UUID: " + shelves[shelfIndex].rpUUID + "<\/li><\/ul>");
    return;
}

function createSection(shelvesArray, shelfIndex, sectionIndex) {
  $('#shelf' + shelfIndex + 'sections')
    .append("<h3>" + shelves[shelfIndex].sections[sectionIndex].sectionName + "<\/h3>")
    .append("<div id=\"shelf" + shelfIndex + "section" + sectionIndex + "\">Section div<\/div>");
  return;
}

function addSectionContent(shelvesArray, shelfIndex, sectionIndex) {
  $('#shelf' + shelfIndex + 'section' + sectionIndex)
    .append("<ul><li>Display name: " + shelves[shelfIndex].sections[sectionIndex].displayId + "<\/li>" + 
            "<li>Display Color: " + shelves[shelfIndex].sections[sectionIndex].displayColor + "<\/li>" + 
            "<li>PIR URL: " + shelves[shelfIndex].sections[sectionIndex].pirURL + "<\/li>" + 
            "<li>Photo interrupter URL: " + shelves[shelfIndex].sections[sectionIndex].pintURL + "<\/li><\/ul>")
    .append("<img class=\"editPencil\" src=\"img/icons/pen.png\" onclick=editShelf()><\/img>");
    return;
}

function editShelf() {
  console.log("hi");
}
*/


/* --------------- D3 --------------- */
var svg;
//var w = $('#d3').context.activeElement.clientWidth;
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

  drawSections(shelves.length - 1, shelves, scale);
  // update domain of scale... use +1 to offset 0 index, and +1 to add one
  scale.domain([0,shelves.length + 1 + 1]);
  // if size of all elements is bigger than w, scale w
}

function drawSections(shelfIndex, shelves, scale){
  var sectionScale = d3.scale.linear()
    .domain([0, shelves[shelfIndex].sections.length + 2])
    .range([0,500]);

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
    .transition().delay(500)
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