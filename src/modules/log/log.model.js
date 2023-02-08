const logAction = require('@/constant/log-action')
const logModule = require('@/constant/log-module')
const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: null,
    },
    module: {
      type: String,
      enum: Object.values(logModule),
      default: null,
    },
    action: {
      type: String,
      enum: Object.values(logAction),
      default: null,
    },
    payload: {},
    dataId: {
      type: String,
      default: null,
    },
    data: {},
    description: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: true,
    toJSON: { virtuals: true },
  }
)

module.exports = mongoose.model('Log', schema)
