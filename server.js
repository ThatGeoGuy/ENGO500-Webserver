/*
 * ENGO 500 Webserver Application
 * File        : server.js
 * Author      : Jeremy Steward
 * Date        : 2014-01-21 @ 12:35:37
 * Description : Implements the webserver for the ENGO500 project website
 */
var express  = require('express'),
	mongoose = require('mongoose')
	nunjucks = require('nunjucks'),
	passport = require('passport'),
	path     = require('path');

/*
 * Initialize the application and define common settings (ports, env, views)
 */
var app = express();
app.set('port', process.env.PORT || 8000);
app.set('env', process.env.NODE_ENV || 'development');
app.set('views', path.join(__dirname, 'views'));

/*
 * Connect to database with specified environment
 */
var config = require('./config/config')[app.get('env')];
mongoose.connect(config.db);

// These files just need to be run
require('./models/userSchema');
require('./config/passportConfiguration')(passport, config);

/*
 * Configure templates using Nunjucks.js
 */
nunjucks.configure('views', {
	autoescape : true,
	express    : app,
});

/*
 * Application settings and environments
 */

app.configure(function () {
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'turbo onion cat' }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
	app.use(express.errorHandler());
});

/*
 * Basic error pages
 */
app.use(function(req, res) { 
	res.send('404: Page not Found', 404);
});
app.use(function(error, req, res, next) {
	res.status(err.status || 500);
	res.send('500: Internal Server Error', 500);
});

/* 
 * GET requests to pages
 */
require('./routes/getHandlers')(app,passport);

/*
 * POST requests to pages
 */
require('./routes/postHandlers')(app,passport);

/*
 * Start server
 */
app.listen(app.get('port'), function(){
	console.log('Listening on port ' + app.get('port') + 
		'. Go to http://localhost:' + app.get('port') + '/');
});
