/*
 * ENGO 500 Webserver Application
 * File        : server.js
 * Author      : Jeremy Steward
 * Date        : 2014-01-21 @ 12:35:37
 * Description : Implements the webserver for the ENGO500 project website
 */
var express = require('express'),
	handlers = require('./routes/handlers'),
	mustacheExpress = require('mustache-express'),
	http = require('http'),
	path = require('path');

var app = express();
app.engine('html', mustacheExpress());

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('some garbage'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only (DISABLE IN PRODUCTION)
app.use(express.errorHandler());

// error pages
app.use(function(req, res) { 
	res.send('404: Page not Found', 404);
});
app.use(function(error, req, res, next) {
	res.send('500: Internal Server Error', 500);
});

// index of site / registration of urls
app.get('/', handlers.index);

// start server
http.createServer(app).listen(app.get('port'), function(){
	console.log('Listening on port 8000. Go to http://127.0.0.1:8000/');
});
