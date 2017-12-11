var fs = require('fs');
var os = require("os");
var net = require('net');
var util = require('util');
var sleep = require('sleep');
var express = require('express');
var gnuplot = require('gnuplot');
var program = require('commander');     //Command line parsing module
var scribe = require('scribe-js')();
var waitSync = require('wait-sync');
var bodyParser = require('body-parser');
var LineByLineReader = require("line-by-line");

/**
 * History
 * 0.0.1 - Initial Import and basic web functionality (didn't really do anything, though)
 * 0.7.0 - Added multiple features
 *          - Append HTTP submission data to a file
 *          - GNUPlot support
 *          - Submit functionality complete
 *          - Reporting functionality installed
 *          - Dynamic point file generation
 *          - Delete old submission data @ startup
 *          - URL 'report' displays list of submitted data
 * 0.7.1 - Added multiple features
 *          - Added support to serve images
 *          - Changed the image size to be smaller
 *          - Added a page title (for tabbed browsing)
 *          - GNUPlot now exports to images folder
 * 
 */

/**
 * Command line options
 */
program
    .version('0.7.1')
    .option('-p, --port [portNum]','Sets the port for the webserver to listen on. [Default: 7100]',7100)
    .option('-w, --web-server-ip [webServerIp]','Binds the webserver to a specific IP Address','localhost')
    .parse(process.argv);

/**
 * Config the web server
 */
var webApp = express();

webApp.use(express.static('./images'));

webApp.use(bodyParser.urlencoded({
   extended:false
} ) );

webApp.use(bodyParser.json({
   strict:true
} ) );

var count = 0;

/**
 *i Remove Previous submissions
 */
fs.exists("./submissions.p", function(exists) {
   if(exists) {
      console.log("Deleting previous submissions...");
      fs.unlink("./submissions.p");
      waitSync(0.5);
      fs.writeFile("./submissions.p", "# Entry(1), Value(2)\n", function(err) {
         if(err) {
            return console.log(err);
         }
      });
   }
});

/**
 * Remove historical record
 */
fs.exists("./jsonreport.txt", function(exists) {
   if(exists) {
      console.log("Deleting historical record...");
      fs.unlink("./jsonreport.txt");
      waitSync(0.5);
   }
});

//Is this a duplicate (from the above)? Required? FIXME!
fs.writeFile("./submissions.p", "# Entry(1), Value(2)\n", function(err) {
   if(err) {
      return console.log(err);
   }
   waitSync(0.5);
});

webApp.get("/", function(req, res) {
   console.log("Root hit!");

  var page ="<!DOCTYPE html>\n<html>\n<body>\n<h1>Senior Project - Webserver</h1>\n<p>This webserver serves two URL - 'submit' and '/'.</p><p>Submit accepts a simple HTTP POST command with associated JSON data. The data is then written to a flat file for some future analysis.</p>\n</body>\n</html>"; 

   res.type('html');
   res.send(page);
});

/**
 * This URI allows a user to submit a JSON string
 */
webApp.post("/submit", function(req, res) {
   console.log("Entering submission!");

   var input = req.body; 

   console.log(util.inspect(input));
   var date = input.date;
   var level = input.level;
   var name = input.sensor;
   input.date = date.replace(/\s+/g,'');
   console.log("date = " + date);

   //Append new input dat
   fs.appendFile('./jsonreport.txt', util.inspect(input) + os.EOL, (err) => {
   if(err)
      throw error;
      console.log('json report updated');
   });

   //Append to point file
   fs.appendFile('./submissions.p', (++count) + " " + level + os.EOL, (err) => {
   if(err)
      throw error;
      console.log('gnuplot point file updated');
   });

   res.type('json');
   res.send(req.body);

});


/**
 * This method invokes GnuPlot and creates a new image based on the contents of the 'submissions.p' file.
 */
function createGraph() {

   console.log("Creating Graph");
   gnuplot()
      .set('term png small size 640,480')
      .set('output "./images/gnuplot.png"')
      .set('title "sensor over time"')
      .set('xlabel "Entry #"')
      .set('xtics 1')
      .set('ylabel "sensor level"')
      .set('xrange []')
      .set('yrange []')
      .set('grid')
      .set('mytics 5')
      .set('style data linespoints')
      .plot('"./submissions.p" lt 1 title "Sensor over time"')
      .end();
}

/**
 * This URI generates a report and returns HTML for a web browser to consume
 */
webApp.get("/report", function(req,res) {

   console.log("Generating Report!");

   createGraph();

   var page ="\n\n<!DOCTYPE html>\n<html>\n<title>Sensor Data Graph</title><body>\n<h1>Senior Project - Sensor Over Time Report</h1>\n";
   var graph = '\n\t\t<img src="./gnuplot.png" alt="Sensor Data over time" height="480" width="640">\n'; 
   var tail = "\n</body>\n</html>\n";

   page = page + graph;

   fs.exists("./jsonreport.txt", function(exists) {
      if(exists) {

         lr = new LineByLineReader('./jsonreport.txt');

         lr.on('line', function(line) { 
            var newline = "\n<p>" + line + "</p>";
            page = page + newline;
         });

         lr.on('end',function () {
            page = page + tail;
         });
  
      } else {
         page = "\n\n<!DOCTYPE html>\n<html>\n<body>\n<h1>Senior Project - Sensor Over Time Report</h1>\n<p>No submissions at this time to address.</p></body>\n</html>\n";
      }
   });

   waitSync(1.0);
   res.type('html');
   res.send(page);
});

/**
 * This URI allows the user to download the graph dicrectly.
 */
webApp.get("/getGraph", function(req,res) {
   console.log("getGraph entered");

   createGraph();

   waitSync(1.0);

   var file = "./images/gnuplot.png";
   res.download(file);
});


/**
 * start the server
 */
var server = webApp.listen(program.port);

