ENGO500-Webserver
=================

Implementation of a webserver using Express (with [Nunjucks](http://jlongster.github.io/nunjucks/templating.html) templating) in Node.js for the ENGO500 repository. This is a very basic webserver, providing simple templating using Nunjucks templating. No database connectivity has been implemented yet, but ideally database access will be added in the future. 

## Usage

First and foremost, clone the repository and change directories into it:

`$ git clone https://github.com/ThatGeoGuy/ENGO500-Webserver.git`

`$ cd ENGO500-Webserver/`

To use this server, you need Node.js version 0.10 or newer installed. You should be able to re-produce or install the remaining dependencies locally using `npm install`. To start the server, just run: 

`node server.js`

in a new terminal window or pane. The server will then run on port 8000, so visit [localhost:8000](http://localhost:8000/) to see the site rendered. 

## Files

Files should be divided as follows: 

* Templates: structured as <template-name>.html and placed in the views/ folder.
* Static files: put in their respective folders in the public/ folder. For example, stylesheets can be found in public/css/. Keep in mind that these would be called by pages rendered on the server without the public/ prefix. E.g. `<link type='stylesheet' href='/css/demo.css' />` 

For reference on static files, there are several demo files added to this project. 

## Acknowledgements

* Developers of [Node.js](http://nodejs.org/)
* Developers of [Express.js](http://expressjs.com/)
* Developers of [Nunjucks](http://jlongster.github.io/nunjucks/)
* Developers of [Bootstrap](http://getbootstrap.com)
* Developers of [jQuery](http://jquery.com)
