/* --------------- JQUERY --------------- */

/* Set properties of accordion, add nested functionality */
$(document).ready(function () {
  $(".accordion").accordion({
      collapsible: true, 
      autoHeight: false, 
      animated: 'swing',
      heightStyle: "content",
      changestart: function(event, ui) {
          child.accordion("activate", false);
      }
  });

  var child = $(".child-accordion").accordion({
      active:false,
      collapsible: true, 
      autoHeight: false,
      animated: 'swing'
  });
});

var activeShelf = 0;
/* Code to add new shelves and sections */
var shelves = [];
var shelfIndex = 0;
//var sectionIndex = 0;
var testing;

$(document).ready(function() {
  /* Add a shelf to the accordion */
  $('#addShelf').click(function () {
    addShelf(shelves);
    createShelf(shelves, shelfIndex);
    addShelfContent(shelves, shelfIndex);
    var sectionIndex = 0;
    createSection(shelves, shelfIndex, sectionIndex);
    addSectionContent(shelves, shelfIndex, sectionIndex);
    $('.accordion').accordion("refresh");
    //$('.child-accordion').accordion("refresh");
    shelfIndex++;
    drawShelves(shelves);
  });

  $('#addSection').click(function () {
    activeShelf = $('.accordion').accordion( "option", "active");
    activeShelf = activeShelf - 1; // Because the example section is still there, subtract 1 to get array index
    shelves[activeShelf].sections.push(new sections());
    createSection(shelves, activeShelf, shelves[activeShelf].sections.length - 1)
    addSectionContent(shelves, activeShelf, shelves[activeShelf].sections.length - 1);
  });
});

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

/* --------------- D3 --------------- */

//var w = 
var svg;
var w = $('#d3').context.activeElement.clientWidth;
var h = w*2/3;
var strokePadding = 2;

$(document).ready( function() {
  svg = d3.select('#d3').append("svg")
    .attr("width", w)
    .attr("height", h);
});

function drawShelves(shelves){
var rect = svg.selectAll("rect").data(shelves).enter().append("rect")
    .attr("opacity", 0)
    .attr("x", function(d,i) {
      return i*100;
    })
    .attr("y", strokePadding)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("width", 35)
    .attr("height", 250)
    .attr("fill", "#000000")
    .attr("stroke",  "#66D9EF")
    .attr("stroke-width", strokePadding)
    .attr("class", "shelf")
    .transition()
    .attr("opacity", 1)
    .duration(500);
}

