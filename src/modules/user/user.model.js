const mongoose = require('mongoose')
const mongooseSlug = require('mongoose-slug-updater')
const { generateHash } = require('../../lib/helpers')
const position = require('../../constant/position')

const schema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: '{PATH} is required!',
    },
    slug: {
      type: String,
      slug: 'fullname',
      unique: true,
      slugPaddingSize: 3,
      index: true,
    },
    email: {
      type: String,
      required: '{PATH} is required!',
      unique: true,
    },
    password: {
      type: String,
      required: '{PATH} is required!',
    },
    avatar: {
      type: mongoose.Types.ObjectId,
      ref: 'Media',
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    birthdate: {
      type: String,
      required: '{PATH} is required!',
      default: null,
    },
    birthplace: {
      type: String,
      required: '{PATH} is required!',
      default: null,
    },
    phone: {
      type: String,
      maxlength: 255,
      unique: true,
      sparse: true,
      trim: true,
      required: '{PATH} is required!',
    },
    position: {
      type: String,
      enum: Object.values(position),
      required: true,
    },
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

// HOOK EVENT
schema.pre('save', async function (next) {
  // only hash the password if it has been modified (or is new)
  if (this.isModified('password')) {
    if (this.password !== null) {
      this.password = await generateHash(this.password)
    }
  }

  next()
})

module.exports = mongoose.model('User', schema)
