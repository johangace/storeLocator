"use strict";

var express = require('express');

var session = require('express-session');

var mongoose = require('mongoose');

var MongoStore = require('connect-mongo')(session);

var path = require('path');

var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');

var passport = require('passport');

var promisify = require('es6-promisify');

var flash = require('connect-flash');

var expressValidator = require('express-validator');

var routes = require('./routes/index');

var helpers = require('./helpers');

var errorHandlers = require('./handlers/errorHandlers');

require('./handlers/passport'); // create our Express app


var app = express(); // view engine setup

app.set('views', path.join(__dirname, 'views')); // this is the folder where we keep our pug files

app.set('view engine', 'pug'); // we use the engine pug, mustache or EJS work great too
// serves up static files from the public folder. Anything in public/ will just be served up as the file it is

app.use(express["static"](path.join(__dirname, 'public'))); // Takes the raw requests and turns them into usable properties on req.body

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); // Exposes a bunch of methods for validating data. Used heavily on userController.validateRegister

app.use(expressValidator()); // populates req.cookies with any cookies that came along with the request

app.use(cookieParser()); // Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages

app.use(session({
  secret: process.env.SECRET,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
})); // // Passport JS is what we use to handle our logins

app.use(passport.initialize());
app.use(passport.session()); // // The flash middleware let's us use req.flash('error', 'Shit!'), which will then pass that message to the next page the user requests

app.use(flash()); // pass variables to our templates + all requests from
//helpers.js

app.use(function (req, res, next) {
  //variables available to template
  res.locals.h = helpers;
  res.locals.flashes = req.flash(); //user from passport

  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
}); // promisify some callback based APIs

app.use(function (req, res, next) {
  req.login = promisify(req.login, req);
  next();
}); // After allllll that above middleware, handle our own routes!

app.use('/', routes); // If that above routes didnt work, we 404 them and forward to error handler

app.use(errorHandlers.notFound); // One of our error handlers will see if these errors are just validation errors

app.use(errorHandlers.flashValidationErrors); // Otherwise this was a really bad error we didn't expect! Shoot eh

if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
} // production error handler


app.use(errorHandlers.productionErrors); // done! we export it so we can start the site in start.js

module.exports = app;