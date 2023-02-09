const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: '{PATH} is required!',
      unique: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: true,
    toJSON: { virtuals: true },
  }
)

module.exports = mongoose.model('EmployeePosition', schema)
