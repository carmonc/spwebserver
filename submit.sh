#!/bin/bash

SUBMISSION_TIME=$(date +"%Y-%m-%dT%H:%M:%S")
NUMBER=$(cat /dev/urandom | tr -dc '0-9' | fold -w 256 | head -n 1 | sed -e 's/^0*//' | head --bytes 2)
curl -X POST -H "Content-Type: application/json" -d '{ "sensor":"GEN","level":"'"$NUMBER"'", "date":"'"$SUBMISSION_TIME"'"}' http://localhost:7100/submit
