const mongoose = require('mongoose')
const config = require('@/config')

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
  const STORAGE_PATH = '/storage/uploads/'
  const dir = STORAGE_PATH + this.filename

  return config.IMAGE_MIMETYPES.includes(this.mimetype)
    ? this.path
    : config.URL + dir
})

module.exports = mongoose.model('Media', schema)
