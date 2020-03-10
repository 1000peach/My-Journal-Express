var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var sessionParser = require('express-session');
var bodyParser = require('body-parser');

var routes = require('./server/routes/index');
var users = require('./server/routes/users');
var file = require('./server/routes/file');
var m_routes = require('./server/routes/m_index');
var m_users = require('./server/routes/m_users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionParser({
    secret: 'sid',
    resave: true,
    saveUninitialized: true
}));

app.use('/', routes);
app.use('/users', users);
app.use('/file', file);
app.use('/mobile', m_routes);
app.use('/mobile/auth', m_users);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
