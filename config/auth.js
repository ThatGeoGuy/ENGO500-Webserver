/*
 * ENGO 500 Webserver Application
 * File: auth.js
 * Author: Jeremy Steward
 * Date: 2014-02-23 @ 19:33:02
 * Description: Defines methods to determine if a user exists and / or is authenticated in a session.
 */

var User = require('../models/userSchema');

module.exports = { 
	isAuthenticated : function(req, res, next) { 
		if(req.isAuthenticated()) { 
			next();
		} else { 
			res.redirect('/login');
		}
	}, 

	userExists : function(req, res, next) { 
		User.count({ 
			username: req.body.username
		},
		function(err, count) { 
			if(count === 0) { 
				next();
			} else { 
				res.redirect('/signup');
			}
		});
	}
}
