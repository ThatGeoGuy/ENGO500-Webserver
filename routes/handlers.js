/* 
 * ENGO 500 Webserver Application
 * File        : routes/handlers.js
 * Author      : Jeremy Steward
 * Date        : 2014-01-21 @ 14:00:24
 * Description : Implements the request handlers for each page on the server
 */

module.exports = { 
	// Index function for root of site
	index : function(req, res) {
		res.render('index', { "title": "THIS IS A TITLE", });
	},
	layout : function(req, res) { 
		res.render('storeLayout', {});
	},
}
