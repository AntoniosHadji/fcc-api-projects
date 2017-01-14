var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// add this line to register partial directory in handlebars
require('hbs').registerPartials(path.join(__dirname, 'views', 'partial'));

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
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


// Get port from environment and store in Express.
app.set('port', (process.env.PORT || '3000'));

/**
 * Create HTTP server.
 */
var debug = require('debug')('http');
var http = require('http');
var server = http.createServer(app);
/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(app.get('port'));
server.on('listening', onListen);
server.on('error', onError);

function onError(error) {
  console.error(error);
}

function onListen() {
  debug('listening on ' + app.get('port'));
}

module.exports = app;
