'use strict'
if ((process.env.NODE_ENV || 'development') === 'development') {
  require('dotenv').config();
}
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongo = require('mongodb').MongoClient

const app = express();

// Get port from environment and store in Express.
app.set('port', (process.env.PORT || 3000));
// set database uri
app.set('dburi', process.env.MONGODB_URI);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// add this line to register partial directory in handlebars
require('hbs').registerPartials(path.join(__dirname, 'views', 'partial'));

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongo.connect(app.get('dburi'), (dberr, database) => {

  if (dberr) {
    console.error(dberr);
  } else {
    console.log('Database connected');
  }

  app.use(function(req, res, next) {
    req.db = database;
    next();
  });

  app.use('/', require('./routes/index.js'));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  const debug = require('debug')('app');

  app.listen(app.get('port'));
  app.on('listening', onListen);
  app.on('error', onError);

  function onError(error) {
    console.error(error);
  }

  function onListen() {
    debug('listening on ' + app.get('port'));
  }

});
module.exports = app;
