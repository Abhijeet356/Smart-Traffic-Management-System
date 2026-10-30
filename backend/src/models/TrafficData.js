const mongoose = require('mongoose');
const { DENSITY_LEVELS } = require('../config/constants');

const trafficDataSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Location reference is required'],
      index: true,
    },
    vehicleCount: {
      type: Number,
      required: [true, 'Vehicle count is required'],
      min: [0, 'Vehicle count cannot be negative'],
    },
    averageSpeed: {
      type: Number,
      required: [true, 'Average speed is required (km/h)'],
      min: [0, 'Speed cannot be negative'],
    },
    densityPercentage: {
      type: Number,
      required: [true, 'Density percentage is required'],
      min: 0,
      max: 100,
    },
    congestionLevel: {
      type: String,
      enum: Object.values(DENSITY_LEVELS),
      required: true,
      default: DENSITY_LEVELS.LOW,
      index: true,
    },
    source: {
      type: String,
      enum: ['sensor_sim', 'camera_sim', 'manual'],
      default: 'sensor_sim',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

trafficDataSchema.index({ locationId: 1, timestamp: -1 });

module.exports = mongoose.model('TrafficData', trafficDataSchema);
