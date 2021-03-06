const { excludedProperties } = require('juice')
const mongoose = require('mongoose')
const { response } = require('../app')
// //imported in app.js
const Store = mongoose.model('Store')

//Multer is a middleware for handling multipart/form-data, used for uploading files.
const multer = require('multer')

//middleware to resize photo
const jimp = require('jimp')

//makes uploaded names unique
const uuid = require('uuid')

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/')
    if (isPhoto) {
      //if you pass null to next usually means that it worked and pass the second argument (true)    if you pass something else is error
      next(null, true)
    } else {
      next({ message: 'That file type is not allowed' }, false)
    }
  },
}

exports.upload = multer(multerOptions).single('photo')
exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next() // skip to the next middleware
    return
  }
  const extension = req.file.mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${extension}`
  // now we resize
  const photo = await jimp.read(req.file.buffer)
  await photo.resize(800, jimp.AUTO)
  await photo.write(`./public/uploads/${req.body.photo}`)
  // once we have written the photo to our filesystem, keep going!
  next()
}

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
  // 1. Find the store given the ID
  const store = await Store.findOne({ _id: req.params.id })
  // 2. confirm they are the owner of the store
  // TODO
  // 3. Render out the edit form so the user can update their store
  res.render('editStore', { title: `Edit ${store.name}`, store })
}

exports.updateStore = async (req, res) => {
  // set the location data to be a point
  req.body.location.type = 'Point'
  // find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true,
  }).exec()
  req.flash(
    'success',
    `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store â†’</a>`,
  )
  res.redirect(`/stores/${store._id}/edit`)
  // Redriect them the store and tell them it worked
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug })
  if (!store) return next()
  res.render('store', { store, title: store.name })
}

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag
  const tagQuery = tag || { $exists: true, $ne: [] }

  const tagsPromise = Store.getTagsList()
  const storesPromise = Store.find({ tags: tagQuery })
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise])

  res.render('tag', { tags, title: 'Tags', tag, stores })
}
// exports.editStore = async (req, res) => {
//   //1.find  store id
//   //or findbyid

//   const store = await Store.findOne({ _id: req.params.id })
//   // console.log(req.body.location.type)
//   //confirm is owner of 🏪

//   //render store

//   res.render('editStore', { title: `Edit ${store.name}`, store: store })
// }

// exports.updateStore = async (req, res) => {
//   // req.body.location.type = 'Point'
//   //findOneAndUpdate method in mongo . takes 3 params: query data options
//   const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
//     new: true, // return new store instead of the old one
//     runValidators: true, //validates the required validators
//   }).exec()

//   req.flash(
//     'success',
//     `Successfully updated <strong> ${store.name}</strong>. <a href="/stores/${store.slug}">View Store </a> `,
//   )

//   res.redirect(`/stores/${store._id}/edit`)
//   //find 🏪
//   //redirect to store and say it work
// }
