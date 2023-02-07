const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: '{PATH} is required!',
    },
    filename: {
      type: String,
      required: '{PATH} is required!',
    },
    path: {
      type: String,
      required: '{PATH} is required!',
    },
    // file size in bytes
    size: {
      type: Number,
    },
    mimetype: {
      type: String,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: false,
    toJSON: { virtuals: true },
  }
)

schema.virtual('fullpath').get(function () {
  return this.path
})

module.exports = mongoose.model('Media', schema)
