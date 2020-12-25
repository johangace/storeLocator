"use strict";

var passport = require('passport');

var crypto = require('crypto');

var mongoose = require('mongoose');

var User = mongoose.model('User');

var promisify = require('es6-promisify'); //local or fb , google etc


exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  faliureFlash: 'Failed Login',
  successRedirect: '/',
  successFlash: 'You are now logged in'
});

exports.logout = function (req, res) {
  req.logout();
  req.flash('success', 'You are logged out 👋');
  res.redirect('/');
};

exports.isLoggedIn = function (req, res, next) {
  //authenticated from passport
  if (req.isAuthenticated()) {
    next();
    return;
  }

  req.flash('error', 'Ops, you must be logged in to do that');
  res.redirect('/login');
};

exports.forgot = function _callee(req, res) {
  var user, resetURL;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.body.email
          }));

        case 2:
          user = _context.sent;

          if (user) {
            _context.next = 6;
            break;
          }

          req.flash('error', 'No account with that email exists');
          return _context.abrupt("return", res.redirect('/login'));

        case 6:
          //reset tokens and expiry
          user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hr from now

          _context.next = 10;
          return regeneratorRuntime.awrap(user.save());

        case 10:
          //send them email with token
          resetURL = "http://".concat(req.headers.host, "/account/reset/").concat(user.resetPasswordToken);
          req.flash('success', "You have been emailed a reset password link. ".concat(resetURL));
          res.redirect('/login'); //redirect

        case 13:
        case "end":
          return _context.stop();
      }
    }
  });
};

exports.reset = function _callee2(req, res) {
  var user;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(User.findOne({
            resetPasswordToken: req.params.token,
            //gt ->  greater mongo db; more than 1 hr
            resetPasswordExpires: {
              $gt: Date.now()
            }
          }));

        case 2:
          user = _context2.sent;

          if (user) {
            _context2.next = 6;
            break;
          }

          req.flash('error', ' Password reset has expired or invalid');
          return _context2.abrupt("return", res.redirect('/login'));

        case 6:
          // if theres user show pass reset form
          res.render('reset', {
            title: 'Reset pass'
          });

        case 7:
        case "end":
          return _context2.stop();
      }
    }
  });
};

exports.confirmedPasswords = function (req, res) {
  if (req.body.password === req.body['password-confirm']) {
    next();
    return req.flash('error', 'Passwords do not match');
  }
};

exports.update = function _callee3(req, res) {
  var user, setPassword, updatedUser;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
              $gt: Date.now()
            }
          }));

        case 2:
          user = _context3.sent;

          if (user) {
            _context3.next = 6;
            break;
          }

          req.flash('error', ' Password reset has expired or invalid');
          return _context3.abrupt("return", res.redirect('/login'));

        case 6:
          //from plugin in User
          setPassword = promisify(user.setPassword, user);
          _context3.next = 9;
          return regeneratorRuntime.awrap(setPassword(req.body.password));

        case 9:
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          _context3.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          updatedUser = _context3.sent;
          _context3.next = 16;
          return regeneratorRuntime.awrap(req.login(updatedUser));

        case 16:
          req.flash('sucess', 'Cool, your password has been reset');
          res.redirect('/');

        case 18:
        case "end":
          return _context3.stop();
      }
    }
  });
};