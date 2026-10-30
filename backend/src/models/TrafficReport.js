const mongoose = require('mongoose');

const trafficReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null, // null indicates system-wide aggregated report
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    metrics: {
      avgDensity: { type: Number, default: 0 },
      peakDensity: { type: Number, default: 0 },
      totalVehicles: { type: Number, default: 0 },
      avgSpeed: { type: Number, default: 0 },
      totalIncidents: { type: Number, default: 0 },
      congestionFrequency: { type: Number, default: 0 }, // count of High/Severe events
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    format: {
      type: String,
      enum: ['summary', 'detailed'],
      default: 'summary',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TrafficReport', trafficReportSchema);
