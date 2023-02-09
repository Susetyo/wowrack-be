const mongoose = require('mongoose')
const kpiType = require('@/constant/kpi-type')
const kpiStatus = require('@/constant/kpi-status')

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: '{PATH} is required!',
    },
    dateFrom: {
      type: Date,
      required: '{PATH} is required!',
    },
    dateTo: {
      type: Date,
      required: '{PATH} is required!',
    },
    type: {
      type: String,
      enum: Object.values(kpiType),
      required: '{PATH} is required!',
    },
    documents: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'KPIDocument',
      },
    ],
    division: {
      type: mongoose.Types.ObjectId,
      ref: 'Division',
      default: null,
    },
    employees: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Employee',
      },
    ],
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
