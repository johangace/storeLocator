//mongoose to interface with mongodb
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
//url friendly
const slug = require('slugs')

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store Name',
  },

  slug: String,
  description: {
    type: String,
    trim: true,
  },
  tags: [String],
})

//before schema saves
storeSchema.pre('save', function (next) {
  //when name change
  if (!this.isModified('name')) {
    next()
    return
  }
  this.slug = slug(this.name)
  //move along
  next()
})
module.exports = mongoose.model('Store', storeSchema)
