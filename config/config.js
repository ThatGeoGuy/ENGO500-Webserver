/* 
 * ENGO 500 Webserver Application 
 * File: config.js
 * Author: Jeremy Steward
 * Date: 2014-02-23 @ 18:17:15
 * Description: Defines our MongoDB configuration (are we in dev mode or production?)
 */

module.exports = { 
	development : { 
		db: 'localhost:29999/LASS',
		app: { 
			name: 'ENGO 500 - Location Aware Shelf System'
		}
	},

	production : {
		db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL,
		app : { 
			name: 'ENGO 500 - Location Aware Shelf System'
		}
	}
}
