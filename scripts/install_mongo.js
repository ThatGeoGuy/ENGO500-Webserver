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
} else if(architecture === "ia32" || architecture === "x86") { 
	if(systemPlatform === 'linux') { 
		architecture = "i686";
	} else if (systemPlatform === 'win32') {
		architecture === "i386";
	}
}

var mongoLinks = {
	"win32": { 
		"ext"     : ".zip",
		"i386"    : "http://fastdl.mongodb.org/win32/mongodb-win32-i386-" + mongoVersion + ".zip",
		"x86_x64" : "http://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-" + mongoVersion + ".zip"
	},
	"linux":         {
		"ext"     : ".tgz",
		"i686"    : "http://fastdl.mongodb.org/linux/mongodb-linux-i686-" + mongoVersion + ".tgz",
		"x86_x64" : "http://fastdl.mongodb.org/linux/mongodb-linux-x86_64-" + mongoVersion + ".tgz"
	}
}

// Download the file
var zipName = "mongodb-" + 
			systemPlatform + 
			"-" +
			architecture + 
			"-" + 
			mongoVersion + 
			mongoLinks[systemPlatform]["ext"];
var pathToZip = path.join(__dirname, zipName);

		 
var req = request(mongoLinks[systemPlatform][architecture]).pipe(fs.createWriteStream(pathToZip));

req.on('close', function() {
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
		var unZipFile = new zip(pathToZip);
		unZipFile.extractAllTo("C:/" + zipName, true);
		var child = exec(path.join(__dirname,"install.bat"), sysHandler); 
	} else if(systemPlatform === "linux") { 
		var child = exec(path.join(__dirname, "install.sh"), sysHandler); 
	}
});
