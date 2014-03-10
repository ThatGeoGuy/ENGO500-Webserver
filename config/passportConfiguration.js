/*
 * ENGO 500 Webserver Application
 * File: passportConfiguration.js
 * Author: Jeremy Steward
 * Date: 2014-02-23 @ 18:44:20
 * Description: Provides helper functions for setting up passport with specified strategies.
 */

var mongoose = require('mongoose'),
	LocalStrategy = require('passport-local').Strategy,
	User = mongoose.model('User');

module.exports = function(passport, config) { 
	passport.serializeUser(function(user, done) { 
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) { 
		User.findOne({ _id: id }, function(err, user) { 
			done(err, user);
		});
	});

	passport.use(new LocalStrategy({ 
		usernameField: 'username',
		passwordField: 'password'
	}, 
	function(username, password, done) { 
		User.isValidUserPassword(username, password, done);
	}));
}
