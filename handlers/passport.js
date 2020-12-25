const mongoose = require('mongoose')
const User = mongoose.model('User')
const promisify = require('es6-promisify')
const passport = require('passport')

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())

passport.deserializeUser(User.deserializeUser())
