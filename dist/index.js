"use strict";
var http = require('http');
var serverExported = require('./handles');
var server = http.createServer(serverExported);
server.listen(8080);
