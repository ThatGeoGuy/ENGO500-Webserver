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
	function countObs() { 
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
								dsArray[datastream['ID'] - 1] = 1; 
							} else {
								dsArray[datastream['ID'] - 1] += 1; 
							}
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
									"size": 700 * dsArray[el['ID'] - 1],
									"description": el["Description"],
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
				root.children = [];

				things['Things'].forEach(function(el, i, array) {
					if(thingArray[el['ID'] - 1] !== undefined) {
						var child = { 
							"name": "Thing(" + el['ID'] + ")",
							"children": thingArray[el['ID'] - 1],
							"description": el['Description'],
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

	var force = d3.layout.force()
		.size([1000, 600])
		.on("tick", tick);

	var svg = d3.select("body").append("svg")
		.attr("width", 1000)
		.attr("height", 600);

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
		  .attr("r", function(d) { return Math.sqrt(d.size) / 10 || 4.5; })
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
	  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
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

	countObs();
	organizeDatastreams();
	createGraph();
});
