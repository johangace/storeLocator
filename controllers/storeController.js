const { excludedProperties } = require('juice')
const mongoose = require('mongoose')
const { response } = require('../app')
// //imported in app.js
const Store = mongoose.model('Store')

exports.homePage = (req, res) => {
  res.render('index')
  req.flash('error', `Something Happened`)
}

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' })
}

exports.createStore = async (req, res) => {
  const store = await new Store(req.body).save()
  console.log('store was added and saved')
  req.flash(
    'success',
    `Successfully Created ${store.name}. Care to leave a review?`,
  )
  res.redirect(`/store/${store.slug}`)
}

exports.getStores = async (req, res) => {
  //querry the database for stores
  const stores = await Store.find()

  res.render('stores', { title: ' Stores', stores: stores })
}

exports.editStore = async (req, res) => {
  //1.find  store id
  //or findbyid
  const store = await Store.findOne({ _id: req.params.id })

  //confirm is owner of 🏪

  //render store

  res.render('editStore', { title: `Edit ${store.name}`, store: store })
}
exports.updateStore = async (req, res) => {
  //findOneAndUpdate method in mongo . takes 3 params: query data options
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return new store instead of the old one
    runValidators: true, //validates the required validators
  }).exec()

  req.flash(
    'success',
    `Successfully updated <strong> ${store.name}</strong>. <a href="/stores/${store.slug}">View Store </a> `,
  )

  res.redirect(`/stores/${store._id}/edit`)
  //find 🏪
  //redirect to store and say it work
}
