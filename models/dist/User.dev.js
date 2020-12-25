"use strict";

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
mongoose.Promise = global.Promise; //for hashing

var md5 = require('md5');

var validator = require('validator');

var mongodbErrorHandler = require('mongoose-mongodb-errors'); //adds additional fields for authentication


var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    // validator: first argument how to validate , second is message
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please Supply an email address'
  },
  name: {
    type: String,
    required: 'Please supply a name',
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}); //avatar cool practice

userSchema.virtual('gravatar').get(function () {
  // hashed to not expose email
  var hash = md5(this.email);
  return "https://gravatar.com/avatar/".concat(hash, "?s=200");
});
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email'
});
userSchema.plugin(mongodbErrorHandler);
module.exports = mongoose.model('User', userSchema);