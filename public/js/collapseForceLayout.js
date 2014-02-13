/*
 * ENGO 500: Progress Report Data Visualization
 * Jeremy Steward
 * 2014-02-04
 *
 * Displays a force-directed-graph of data from the OGC SensorThings API
 */

var root = {};
var rootURI = 'http://demo.student.geocens.ca:8080/SensorThings_V1.0/';
document.addEventListener('DOMContentLoaded', function() {
	/*
	 * dsArray is an array that counts the amount of observations for each datastream.
	 * ds[0] is the number of observations in datastream 1
	 * ds[1] is the number of observations in datastream 2
	 * and so on... 
	 */
	var dsArray = []; 
	// Count number of observations to determine node size
	function collectObs() { 
		var req = new XMLHttpRequest();
		req.open('GET', rootURI + 'Observations', false);

		req.onload = function() { 
			if(this.status >= 200 && this.status < 400) {
				var obs = JSON.parse(this.response);
				obs['Observations'].forEach(function(el, i, array) {
					var dsURI = el['Datastream']['Navigation-Link'];
					var req = new XMLHttpRequest();
					req.open('GET', rootURI + dsURI, false);
					
					req.onload = function() {
						if(this.status >= 200 && this.status < 400) {
							var datastream = JSON.parse(this.response);
							if(dsArray[datastream['ID'] - 1] === undefined) { 
								dsArray[datastream['ID'] - 1] = []; 
							}
								dsArray[datastream['ID'] - 1].push(el);
						} else { 
							console.log("Server Error: " + this.status);
						}
					}

					req.error = function() { console.log('Unspecified error connecting to server'); }
					req.send();
				});
			} else { 
				console.log("Server Error: " + this.status); 
			}
		}
		
		req.error = function() { console.log('Unspecified error connecting to server'); }
		req.send();
	}

	/* 
	 * For each datastream that has an entry in dsArray, we are going to attach these to 
	 * each 'Thing' and form our tree (name, children) 
	 */
	var thingArray = [];
	// Organizes datastream children objects for each thing
	function organizeDatastreams() {
		var req = new XMLHttpRequest();
		req.open('GET', rootURI + 'Datastreams', false);

		req.onload = function() {
			if(this.status >= 200 && this.status < 400) {
				var datastreams = JSON.parse(this.response);
				datastreams['Datastreams'].forEach(function(el, i, array) { 
					if(dsArray[el['ID'] - 1] !== undefined) { 
						var thingURI = el['Thing']['Navigation-Link'];
						var req = new XMLHttpRequest();
						req.open('GET', rootURI + thingURI, false);

						req.onload = function() { 
							if(this.status >= 200 && this.status < 400) {
								var thing = JSON.parse(this.response);
								var child = {
									"name": "Datastream(" + el['ID'] + ")",
									"type": "datastream",
									"size": 500 * dsArray[el['ID'] - 1].length,
									"description": el["Description"],
									"observations": dsArray[el['ID'] - 1],
									"colour": "#fbb117",
								};
								if(thingArray[thing['ID'] - 1] === undefined) { 
									thingArray[thing['ID'] - 1] = [];
								}
								thingArray[thing['ID'] - 1].push(child);
							} else {
							}
						}

						req.onerror = function() { console.log('Unspecified error with server'); }
						req.send();
					}
				});
			} else { 
			}
		}

		req.onerror = function() { console.log('Unspecified error with server'); }
		req.send();
	}

	/*
	 * Sort the 'things' into the root node and populate the children nodes
	 */
	function createGraph() {
		var req = new XMLHttpRequest();
		req.open('GET', rootURI + 'Things', false);
		
		req.onload = function() {
			if(this.status >= 200 && this.status < 400) { 
				var things = JSON.parse(this.response);
				root.name = 'Root Node';
				root.type = 'root';
				root.children = [];
				root.description = "This is the root node of the graph. Click on any of the other nodes to see information about them here!"; 
				root.colour = "#ff0000";

				things['Things'].forEach(function(el, i, array) {
					if(thingArray[el['ID'] - 1] !== undefined) {
						var child = { 
							"name": "Thing(" + el['ID'] + ")",
							"type": "thing", 
							"children": thingArray[el['ID'] - 1],
							"description": el['Description'],
							"altColour": "#0000a0",
							"colour": "#38acec",
						};
						root.children.push(child);
					}
				});
				update();
			} else {
			}
		}
		
		req.onerror = function() { console.log('Unspecified error with server'); } 
		req.send();
	}

	/*
	 * This function will display the parameters on the right hand of the
	 * slide based on which node you click. 
	 */
	function displayParams(d) {
		var info = d3.select('#node-info'); 
		var htmlString = "";
		info.html(); 

		htmlString += "<h3>" + d.name + "</h3>"; 
		htmlString += "<p class='tiny'><strong>Description:</strong> " + d.description + "</p>";
		if(d.type === "datastream" && d.children !== null) {
			htmlString += "<p class='tiny'><strong>The last five observations are: </strong></p>";
			htmlString += "<ol class='tiny'>";
			
			var obs; 
			for(var i = (d.observations.length -1); i > (d.observations.length - 6); --i) {
				obs = d.observations[i]["ResultValue"]; 
				htmlString += "<li>" + parseFloat(obs).toPrecision(6) + "</li>";
			}
			htmlString += "</ol>"
		} else if(d.type === "thing" && d.children !== null) { 
			htmlString += "<p class='tiny'><strong>The first five datastreams associated with this 'Thing' are: </strong></p>";
			htmlString += "<ul class='tiny'>";

			for(var i = 0; i < 5; ++i) {
				htmlString += "<li><em>" + d.children[i]["name"] + "</em> - "; 
				htmlString += d.children[i]["description"] + "</li>";	
			}
		} 
		info.html(htmlString); 
	}

	var force = d3.layout.force()
		.size([500, 700])
		.on("tick", tick);

	var svg = d3.select("#force-graph").append("svg")
		.attr("width", 500)
		.attr("height", 700);

	var link = svg.selectAll(".link"),
		node = svg.selectAll(".node");

	function update() {
	  var nodes = flatten(root),
		  links = d3.layout.tree().links(nodes);

	  // Restart the force layout.
	  force
		  .nodes(nodes)
		  .links(links)
		  .start();

	  // Update the links…
	  link = link.data(links, function(d) { return d.target.id; });

	  // Exit any old links.
	  link.exit().remove();

	  // Enter any new links.
	  link.enter().insert("line", ".node")
		  .attr("class", "link")
		  .attr("x1", function(d) { return d.source.x; })
		  .attr("y1", function(d) { return d.source.y; })
		  .attr("x2", function(d) { return d.target.x; })
		  .attr("y2", function(d) { return d.target.y; });

	  // Update the nodes…
	  node = node.data(nodes, function(d) { return d.id; }).style("fill", color);

	  // Exit any old nodes.
	  node.exit().remove();

	  // Enter any new nodes.
	  node.enter().append("circle")
		  .attr("class", "node")
		  .attr("cx", function(d) { return d.x; })
		  .attr("cy", function(d) { return d.y; })
		  .attr("r", function(d) { return Math.sqrt(d.size) / 10 || 9.0; })
		  .style("fill", color)
		  .on("click", click)
		  .call(force.drag);
	}

	function tick() {
	  link.attr("x1", function(d) { return d.source.x; })
		  .attr("y1", function(d) { return d.source.y; })
		  .attr("x2", function(d) { return d.target.x; })
		  .attr("y2", function(d) { return d.target.y; });

	  node.attr("cx", function(d) { return d.x; })
		  .attr("cy", function(d) { return d.y; });
	}

	// Color leaf nodes orange, and packages white or blue.
	function color(d) {
	  return d._children ? d.altColour : d.colour;
	}

	// Toggle children on click.
	function click(d) {
		if (!d3.event.defaultPrevented) {
		  if (d.children) {
			d._children = d.children;
			d.children = null;
		  } else {
			d.children = d._children;
			d._children = null;
		  }
		  update();
		}
		displayParams(d);
	}

	// Returns a list of all nodes under the root.
	function flatten(root) {
	  var nodes = [], i = 0;

	  function recurse(node) {
		if (node.children) node.children.forEach(recurse);
		if (!node.id) node.id = ++i;
		nodes.push(node);
	  }

	  recurse(root);
	  return nodes;
	}	

	collectObs();
	organizeDatastreams();
	createGraph();
});
