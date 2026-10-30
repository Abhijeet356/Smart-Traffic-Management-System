const mongoose = require('mongoose');
const { SIGNAL_MODES, SIGNAL_PHASES } = require('../config/constants');

const armSchema = new mongoose.Schema({
  direction: {
    type: String,
    enum: ['North', 'South', 'East', 'West'],
    required: true,
  },
  greenDuration: {
    type: Number,
    required: true,
    default: 30, // seconds
    min: 10,
    max: 120,
  },
  yellowDuration: {
    type: Number,
    required: true,
    default: 4, // seconds
  },
  redDuration: {
    type: Number,
    required: true,
    default: 86, // seconds
  },
  currentLight: {
    type: String,
    enum: Object.values(SIGNAL_PHASES),
    default: SIGNAL_PHASES.RED,
  },
  densityScore: {
    type: Number,
    default: 0,
  },
});

const trafficSignalSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
      unique: true,
    },
    intersectionName: {
      type: String,
      required: true,
      trim: true,
    },
    arms: [armSchema],
    cycleDuration: {
      type: Number,
      default: 120, // Total cycle seconds
    },
    mode: {
      type: String,
      enum: Object.values(SIGNAL_MODES),
      default: SIGNAL_MODES.ADAPTIVE,
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'maintenance'],
      default: 'online',
    },
    activeArmIndex: {
      type: Number,
      default: 0,
    },
    lastOptimizedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TrafficSignal', trafficSignalSchema);
