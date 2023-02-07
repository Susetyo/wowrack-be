const mongoose = require('mongoose')
const employeeStatus = require('@/constant/employee-status')
const position = require('@/constant/position')

const schema = new mongoose.Schema(
  {
    employeeID: {
      type: String,
      unique: true,
      required: '{PATH} is required!',
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    division: {
      type: mongoose.Types.ObjectId,
      ref: 'Division',
      default: null,
    },
    position: {
      type: String,
      enum: Object.values(position),
      required: '{PATH} is required!',
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

module.exports = mongoose.model('Employee', schema)
