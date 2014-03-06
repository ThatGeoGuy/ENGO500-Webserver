/* 
 * ENGO 500 Webserver Application
 * File        : routes/handlers.js
 * Author      : Jeremy Steward
 * Date        : 2014-01-21 @ 14:00:24
 * Description : Implements the request handlers for each page on the server
 */

authors = [ 
	"Ben Trodd",
	"Jeremy Steward"
];

module.exports = { 
	// Index function for root of site
	index : function(req, res) {
		var templateParameters = {
			// Metadata options
			"title"       : "LASS - Home",
			"authors"     : authors,
			"description" : "LASS - A location aware shelf system to find out what your customers want!",
			// Navbar options
			"navFixed" : true,
			"index"    : true,
		};
		res.render('index.html', templateParameters);
	},

	layout : function(req, res) { 
		var templateParameters = { 
			// Metadata options
			"title"       : "LASS - Store Layout Editor",
			"authors"     : authors,
			"description" : "Create and edit a virtual layout of your store!",
			// Navbar options
			"navStatic" : true,
		};
		res.render('layoutConfig.html', templateParameters);
	},

	login : function(req, res) {
		var templateParameters = { 
			// Metadata options
			"title" : "LASS - Login",
			"authors" : authors,
			"description" : false,
		};
		res.render('login.html', templateParameters);
	}, 

	register : function(req, res) { 
		var templateParameters = {
			// Metadata options
			"title" : "LASS - Register",
			"authors" : authors,
			"description" : false,
		};
		res.render('register.html', templateParameters);
	},
}
