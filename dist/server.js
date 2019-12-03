"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var metrics_1 = require("./metrics");
var favicon = require('express-favicon');
var path = require('path');
var app = express();
var port = process.env.PORT || '3000';
var dbMet = new metrics_1.MetricsHandler('./db/metrics');
var met = [
    new metrics_1.Metric("" + new Date('2013-11-04 14:00 UTC').getTime(), 12),
    new metrics_1.Metric("" + new Date('2013-11-04 14:15 UTC').getTime(), 10),
    new metrics_1.Metric("" + new Date('2013-11-04 14:30 UTC').getTime(), 8)
];
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../views')));
app.use(favicon(path.join(__dirname, '../public/favicon.svg')));
app.get('/home', function (req, res) {
    res.render('home.ejs');
});
app.get('/hello/:name', function (req, res) {
    res.render('hello.ejs', { name: req.params.name });
});
app.post('/hello', function (req, res) {
    if (req.body.name != '') {
        res.redirect('/hello/' + req.body.name);
    }
    else {
        res.redirect('/home');
    }
});
app.get('*', function (req, res) {
    res.redirect('/home');
});
app.post('/metrics/:id', function (req, res) {
    dbMet.save(req.params.id, req.body, function (err) {
        if (err)
            throw err;
        res.status(202).send("nodejs");
    });
});
app.listen(port, function (err) {
    if (err) {
        throw err;
    }
    console.log("Server is listening on port " + port);
});
