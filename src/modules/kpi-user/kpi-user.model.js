const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    kpi: {
      type: mongoose.Types.ObjectId,
      ref: 'KPI',
      required: '{PATH} is required!',
    },
    division: {
      type: mongoose.Types.ObjectId,
      ref: 'Division',
      required: '{PATH} is required!',
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: '{PATH} is required!',
    },
    biWeeklyData: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    minimize: true,
    toJSON: { virtuals: true },
  }
)

module.exports = mongoose.model('KPIUser', schema)
