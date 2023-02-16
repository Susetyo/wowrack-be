const mongoose = require('mongoose')
const kpiType = require('@/constant/kpi-type')
const kpiStatus = require('@/constant/kpi-status')

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: '{PATH} is required!',
    },
    dateFrom: {
      type: String,
      required: '{PATH} is required!',
    },
    dateTo: {
      type: String,
      required: '{PATH} is required!',
    },
    type: {
      type: String,
      enum: Object.values(kpiType),
      required: '{PATH} is required!',
    },
    document: {
      type: mongoose.Types.ObjectId,
      ref: 'Media',
    },
    division: {
      type: mongoose.Types.ObjectId,
      ref: 'Division',
      default: null,
    },

    // will be handled by back-end
    employees: {
      type: [mongoose.Types.ObjectId],
      ref: 'User',
    },
    status: {
      type: String,
      enum: Object.values(kpiStatus),
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

module.exports = mongoose.model('KPI', schema)
