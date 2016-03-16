var express = require('express');
var http = require("http");
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

var admin = require('./controllers/admin');
var routeEvents = require('./controllers/events');
var roteRoles = require('./controllers/roles');
var routeUsers = require('./controllers/users');
var routeComms = require('./controllers/comms');
var routeAlerts = require('./controllers/alerts');
var routeTimers = require('./controllers/timers');
var api = require('./controllers/api');

app.use('/', admin);
app.use('/admin/events', routeEvents);
app.use('/admin/roles', roteRoles);
app.use('/admin/users', routeUsers);
app.use('/admin/comms', routeComms);
app.use('/admin/alerts', routeAlerts);
app.use('/admin/timers', routeTimers);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Page Not Found!');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
//if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
//}

// production error handler
// no stacktraces leaked to user
//app.use(function (err, req, res, next) {
//    res.status(err.status || 500);
//    res.render('error', {
//        message: err.message,
//        error: {}
//    });
//});

module.exports = app;
