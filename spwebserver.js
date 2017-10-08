var fs = require('fs');
var net = require('net');
var util = require('util');
var sleep = require('sleep');
var express = require('express');
var program = require('commander');     //Command line parsing module
var scribe = require('scribe-js')();
var waitSync = require('wait-sync');
var bodyParser = require('body-parser');

program
    .version('0.0.1')
    .option('-p, --port [portNum]','Sets the port for the webserver to listen on. [Default: 7100]',7100)
    .option('-w, --web-server-ip [webServerIp]','Binds the webserver to a specific IP Address','localhost')
    .parse(process.argv);

var webApp = express();

webApp.use(bodyParser.urlencoded({
   extended:false
} ) );

webApp.use(bodyParser.json({
   strict:true
} ) );

console.log("port = " + program.port);
console.log("ipaddy = " + program.webServerIp);

webApp.get("/", function(req, res) {
   console.log("Root hit!");

   var page =" <!DOCTYPE html>\n<html>\n<body>\n<h1>Senior Project - Webserver</h1>\n<p>This webserver serves two URL - 'submit' and '/'.</p><p>Submit accepts a simple HTTP POST command with associated JSON data. The data is then written to a flat file for some future analysis.</p>\n</body>\n</html>"; 



   res.type('html');
   res.send(page);
});

webApp.post("/submit", function(req, res) {
   console.log("submit hit!");
	console.log(util.inspect( req.body));


   res.type('json');
   res.send(req.body);

});





var server = webApp.listen(program.port, program.webServerIp);
//var server = webApp.listen(7100, program.webServerIp);
