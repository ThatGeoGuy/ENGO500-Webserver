/*
 * ENGO 500 Webserver Application
 * File: postHandlers.js
 * Author: Jeremy Steward 
 * Date: 2014-02-23 @ 19:49:07
 * Description: A file which specifies request handlers for HTTP POST requests to the server. 
 */ 

var User = require('../models/userSchema'),
	Auth = require('../config/auth');

module.exports = function(app, passport) { 
	app.post('/login', passport.authenticate('local', { 
		successRedirect : '/home',
		failureRedirect : '/login'
	}));

	app.post('/signup', Auth.userExists, function(req, res, next) { 
		User.signup(req.body.username, req.body.password, function(err, user) { 
			if(err) { 
				throw err; 
			} 
			req.login(user, function(err){ 
				if(err) { 
					return next(err); 
				}
				return res.redirect('/home');
			});
		});
	});
}
