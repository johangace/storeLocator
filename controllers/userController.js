const mongoose = require('mongoose')
const User = mongoose.model('User')
const promisify = require('es6-promisify')

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' })
}

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' })
}

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name')
  req.checkBody('name', 'You must supply a name!').notEmpty()
  req.checkBody('email', 'That Email is not valid!').isEmail()
  req.sanitizeBody('email').normalizeEmail({
    gmail_remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  })

  //field-name; message
  req.checkBody('password', 'Password Cannot be Blank!').notEmpty()
  req
    .checkBody('password-confirm', 'Confirmed Password cannot be blank!')
    .notEmpty()
  req
    .checkBody('password-confirm', 'Oops! Your passwords do not match')
    .equals(req.body.password)

  const errors = req.validationErrors()
  if (errors) {
    req.flash(
      'error',
      errors.map((err) => err.msg),
    )
    res.render('register', {
      title: 'Register',
      body: req.body,
      flashes: req.flash(),
    })
    return // stop the fn from running
  }
  next() // there were no errors!
}
exports.register = async (req, res, next) => {
  const user = new User({
    //from user signup form
    email: req.body.email,
    name: req.body.name,
  })

  //register exposed by passport plugin in user Model
  // User.register(user, req.body.password, function (err, user) {})

  // /promisify library
  const register = promisify(User.register, User)

  //register exposed by passport plugin in user Model
  await register(user, req.body.password)

  // res.send('You Signed Up!')
  next()
}

exports.account = (req, res) => {
  res.render('account', { title: 'Edit Account' })
}
exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email,
  }

  const user = await User.findByIdAndUpdate(
    //query
    { _id: req.user._id },
    //update
    { $set: updates },
    //options
    { new: true, runValidators: true, context: 'query' },
  )
  req.flash('success', 'Updated the profile')
  //the url that they came from => back
  res.redirect('back')
}
