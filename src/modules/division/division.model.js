const mongoose = require('mongoose')
const mongooseSlug = require('mongoose-slug-updater')

const schema = new mongoose.Schema(
  {
    divisionID: {
      type: String,
      unique: true,
      required: '{PATH} is required!',
    },
    title: {
      type: String,
      required: '{PATH} is required!',
    },
    slug: {
      type: String,
      slug: 'title',
      unique: true,
      slugPaddingSize: 3,
      index: true,
    },
    employees: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Employee',
      },
    ],
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: false,
    toJSON: { virtuals: true },
  }
)

// AUTO INSERT SLUG
schema.plugin(mongooseSlug)

module.exports = mongoose.model('Division', schema)
