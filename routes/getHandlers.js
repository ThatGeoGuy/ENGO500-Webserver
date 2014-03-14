/*
 * ENGO 500 Webserver Application
 * File: getHandlers.js
 * Author: Jeremy Steward
 * Date: 2014-02-23 @ 19:31:51
 * Description: Defines all the functions where the server will handle an HTTP GET request.
 */

authors = [ 
	"Ben Trodd",
	"Jeremy Steward",
	"Kathleen Ang"
];

module.exports = function(app, passport) { 
	app.get('/', function(req, res) { 
		var templateParameters = {
			// Metadata options
			"title"       : "Home",
			"authors"     : authors,
			"description" : "A location aware shelf system to find out what your customers want!",
			// Navbar options
			"navStatic" : true,
			"index"     : true,
		};
		res.render('index.html', templateParameters);
	});

	app.get('/home', function(req, res) { 
		if(req.isAuthenticated()) { 
			var templateParameters = { 
				// Metadata options
				"title"       : "Home",
				"authors"     : authors,
				"description" : false,
				"user"        : req.user.username,
			};
			res.render('home.html', templateParameters);
		} else { 
			res.redirect('/login');
		}
	});

	app.get('/layout', function(req, res) { 
		if(req.isAuthenticated()) {
			var templateParameters = { 
				"title": "Store Layout Editor",
				"authors": ["Ben Trodd", "Jeremy Steward"],
				"description": "Edit and create a virtual layout of your store!",
				// Navbar options
				"navStatic" : true,
				"layout"    : true,
			}
			res.render('layoutConfig.html', templateParameters);
		} else { 
			res.redirect('/login');
		}
	});

	app.get('/login', function(req, res) { 
		if(req.isAuthenticated()) { 
			res.redirect('/home'); 
		} else { 
			var templateParameters = { 
				// Metadata options
				"title"       : "Login",
				"authors"     : authors,
				"description" : false,
			};
			res.render('login.html', templateParameters);
		}
	});

	app.get('/logout', function(req, res) { 
		req.logout();
		res.redirect('/');
	});
	
	app.get('/signup', function(req, res) { 
		if(req.isAuthenticated()) { 
			res.redirect('/home');
		} else { 
			var templateParameters = {
				// Metadata options
				"title"       : "Register",
				"authors"     : authors,
				"description" : false,
			};
			res.render('register.html', templateParameters);
		}
	});

	app.get('/view-store', function(req, res) { 
		if(req.isAuthenticated()) { 
			var templateParameters = { 
				"title"       : "Store Viewer",
				"authors"     : authors,
				"description" : "Edit and create a virtual layout of your store!",
				// Navbar options
				"navStatic" : true,
				"viewstore" : true,
			}
			res.render('viewStore.html', templateParameters);
		} else { 
			res.redirect('/login');
		}
	});
}
