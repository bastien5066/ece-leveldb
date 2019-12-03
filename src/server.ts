import express = require('express')
import { Metric, MetricsHandler } from './metrics'
const favicon = require('express-favicon');
const path = require('path');
const app = express()
const port: string = process.env.PORT || '3000'
const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')

var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../views')));
app.use(favicon(path.join(__dirname, '../public/favicon.svg')));

app.get('/home', (req, res) => {
  res.render('home.ejs');
})

app.get('/hello/:name', (req, res) => {
  res.render('hello.ejs', { name: req.params.name });
})

app.post('/hello', (req, res) => {
  if (req.body.name != '') {
    res.redirect('/hello/' + req.body.name);
  } else {
    res.redirect('/home');
  }
})

app.post('/metrics/set', (req, res) => {
  dbMet.setFilter(req.body.idfilter, (err: Error | null, result: string | null) => {
    if (err) throw err
    res.status(200)
  })
})

app.get('/metrics/getAll/:id', (req: any, res: any) => {
  dbMet.getAll(req.params.id, (err: Error | null, result: Metric[] | null) => {
    if (err) throw err;
    res.status(200).send(result)
  })
})

app.post('/metrics/delete', (req: any, res: any) => {
  if (req.body.idfilter != '') {
    dbMet.delete(req.body.idfilter, req.body.name, (err: Error | null, result: string | null) => {
      if (result === null) {
        res.status(200);
      } else {
        res.redirect('/hello/' + req.body.name)
      }
    })
  }
})

app.post('/metrics/save/:id', (req: any, res: any) => {
  dbMet.save(req.params.id, req.body, (err: Error | null) => {
    if (err) throw err
    res.status(200).send('saved')
  })
})

app.get('*', function (req, res) {
  res.redirect('/home');
});

app.listen(port, (err: Error) => {
  if (err) {
    throw err
  }
  console.log(`Server is listening on port ${port}`)
})
