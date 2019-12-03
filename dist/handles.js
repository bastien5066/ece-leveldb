"use strict";
var serverHandle = function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World - Exported from module "handles.js"\n');
};
module.exports = serverHandle;
