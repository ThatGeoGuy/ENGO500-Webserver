/*
 * ENGO 500 Webserver Application
 * File:         install_mongo.js
 * Author:       Jeremy Steward
 * Date:         2014-03-04 @ 20:01:10
 * Description:  Downloads and installs MongoDB and adds it to your $PATH variable
 */

var exec    = require("child_process").exec,
	fs      = require("fs"),
	request = require("request"),
	os      = require("os"),
	path    = require("path"),
	sys     = require("sys"),
	zip     = require("adm-zip");

var mongoVersion   = "2.4.9";
var systemPlatform = os.platform();
var architecture   = os.arch();

if(architecture === "x64") { 
	architecture = "x86_x64";
}

var mongoLinks = {
	"win32": { 
		"ext"     : ".zip",
		"ia32"    : "http://fastdl.mongodb.org/win32/mongodb-win32-i386-" + mongoVersion + ".zip",
		"x86"     : "http://fastdl.mongodb.org/win32/mongodb-win32-i386-" + mongoVersion + ".zip",
		"x86_x64" : "http://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-" + mongoVersion + ".zip"
	},
	"linux":         {
		"ext"     : ".tgz",
		"ia32"    : "http://fastdl.mongodb.org/linux/mongodb-linux-i686-" + mongoVersion + ".tgz",
		"x86"     : "http://fastdl.mongodb.org/linux/mongodb-linux-i686-" + mongoVersion + ".tgz",
		"x86_x64" : "http://fastdl.mongodb.org/linux/mongodb-linux-x86_64-" + mongoVersion + ".tgz"
	}
}

// Download the file
var pathToZip = path.join(__dirname, 
			"mongodb-" + 
			systemPlatform + 
			"-" +
			architecture + 
			"-" + 
			mongoVersion + 
			mongoLinks[systemPlatform]["ext"]);
		 
var req = request(mongoLinks[systemPlatform][architecture]).pipe(fs.createWriteStream(pathToZip));

req.on('end', function() {
	// Call command line install script
	// First, a function to handle stdout and stderr
	var sysHandler = function(err, stdout, stderr) {
		sys.print('stdout: ' + stdout);
		sys.print('stderr: ' + stderr);
		if(err !== null) { 
			console.log('exec error: ' + err);
		}
	};

	if(systemPlatform === "win32") { 
		var unzipFile = new zip(pathToZip);
		unzip.extractAllTo("C:/mongodb/", true);
		var child = exec(path.join(__dirname,"install.bat"), sysHandler); 
	} else if(systemPlatform === "linux") { 
		var child = exec("install.sh", sysHandler); 
	}
});
