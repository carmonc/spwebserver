# spwebserver
The webserver for my senior project

This webserver simply accepts a HTTP Post command with accompanying JSON data. Once received the JSON data will be written to a flat file for later analysis. 

The webserver will accept two URLs.

'submit' and 'review'.
## SUBMIT

The 'submit' URL services HTTP POST commands with an accompanying JSON payload. This URL method will write the JSON data to a flat file for later analysis.

## REVIEW

The 'review' URL services HTTP GET commands. This URL method will simplay display the content of the flat file for analysis.
