/*
 * ENGO 500 Webserver Application
 * File: userSchema.js
 * Author: Jeremy Steward
 * Date: 2014-02-23 @ 18:26:40
 * Description: Defines the database schema and User object for user authentication with our system
 */

var mongoose = require('mongoose'),
	hash     = require('pwd').hash;

UserSchema = mongoose.Schema({
	username:  String,
	salt:      String,
	hash:      String
});

UserSchema.statics.signup = function(username, password, done) {
	var User= this; 
	hash(password, function(err, salt, hash) { 
		if(err) {
			throw err;
			//return done(err);
		}
		
		var newUser = { 
			username:  username,
			salt:      salt,
			hash:      hash
		};

		User.create(newUser, function(err, user) { 
			if(err) { 
				throw err;
				//return done(err);
			}
			done(null, user);
		});
	});
}

UserSchema.statics.isValidUserPassword = function(username, password, done) { 
	this.findOne({ username: username }, function(err, user) { 
		if(err) { 
			return done(err);
		}
		if(!user) { 
			return done(null, false, { message: 'Incorrect username.' });
		}
		hash(password, user.salt, function(err, hash) { 
			if(err) {
				return done(err);
			}
			if(hash === user.hash) { 
				return done(null, user); 
			} 
			done(null, false, { message: 'Incorrect password' });
		});
	});
}

var User = mongoose.model("User", UserSchema);
module.exports = User;
