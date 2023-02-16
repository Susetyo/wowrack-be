const mongoose = require('mongoose')
const mongooseSlug = require('mongoose-slug-updater')
const employeeStatus = require('../../constant/employee-status')
const { generateHash } = require('../../lib/helpers')

const schema = new mongoose.Schema(
  {
    employeeID: {
      type: String,
      unique: true,
      required: '{PATH} is required!',
    },
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
      default: null,
    },
    birthplace: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      maxlength: 255,
      unique: true,
      sparse: true,
      trim: true,
    },
    position: {
      type: mongoose.Types.ObjectId,
      ref: 'Position',
      required: true,
    },
    division: {
      type: mongoose.Types.ObjectId,
      ref: 'Division',
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(employeeStatus),
      required: '{PATH} is required!',
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
