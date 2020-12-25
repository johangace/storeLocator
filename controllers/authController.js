const passport = require('passport')
const crypto = require('crypto')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const promisify = require('es6-promisify')
//local or fb , google etc
exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  faliureFlash: 'Failed Login',
  successRedirect: '/',
  successFlash: 'You are now logged in',
})

exports.logout = (req, res) => {
  req.logout()
  req.flash('success', 'You are logged out 👋')
  res.redirect('/')
}

exports.isLoggedIn = (req, res, next) => {
  //authenticated from passport
  if (req.isAuthenticated()) {
    next()
    return
  }

  req.flash('error', 'Ops, you must be logged in to do that')
  res.redirect('/login')
}

exports.forgot = async (req, res) => {
  //check if user exists\
  const user = await User.findOne({
    email: req.body.email,
  })

  if (!user) {
    req.flash('error', 'No account with that email exists')
    return res.redirect('/login')
  }
  //reset tokens and expiry

  user.resetPasswordToken = crypto.randomBytes(20).toString('hex')
  user.resetPasswordExpires = Date.now() + 3600000 // 1 hr from now
  await user.save()

  //send them email with token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`

  req.flash(
    'success',
    `You have been emailed a reset password link. ${resetURL}`,
  )

  res.redirect('/login')
  //redirect
}
exports.reset = async (req, res) => {
  //   res.json(req.params)

  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    //gt ->  greater mongo db; more than 1 hr
    resetPasswordExpires: { $gt: Date.now() },
  })

  if (!user) {
    req.flash('error', ' Password reset has expired or invalid')
    return res.redirect('/login')
  }
  // if theres user show pass reset form

  res.render('reset', { title: 'Reset pass' })
}
exports.confirmedPasswords = (req, res) => {
  if (req.body.password === req.body['password-confirm']) {
    next()
    return req.flash('error', 'Passwords do not match')
  }
}

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  })

  if (!user) {
    req.flash('error', ' Password reset has expired or invalid')
    return res.redirect('/login')
  }

  //from plugin in User
  const setPassword = promisify(user.setPassword, user)
  await setPassword(req.body.password)
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined

  const updatedUser = await user.save()

  //pasport
  await req.login(updatedUser)

  req.flash('sucess', 'Cool, your password has been reset')
  res.redirect('/')
}
