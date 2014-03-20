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

	app.post('/set-user-data', function(req, res) { 
		if(req.isAuthenticated()) { 
			//User.findByIdAndUpdate(req.user.id, { userData: JSON.stringify(req.body) });
			User.findById(req.user.id, function(err, doc) { 
				console.log(doc.userData);
				if(err) { 
					req.send(500);
				} else { 
					doc.userData = JSON.stringify(req.body);
					doc.markModified('userData');
					doc.save();

					console.log(doc.username);
					console.log(doc.userData);
					res.send(200);
				}
			});
		} else { 
			res.send(403); 
		}
	});
}
