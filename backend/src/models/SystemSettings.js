const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    lowDensityMax: {
      type: Number,
      default: 30,
      min: 10,
      max: 50,
    },
    mediumDensityMax: {
      type: Number,
      default: 60,
      min: 31,
      max: 75,
    },
    highDensityMax: {
      type: Number,
      default: 80,
      min: 61,
      max: 90,
    },
    simulationIntervalMs: {
      type: Number,
      default: 10000, // 10 seconds
      min: 3000,
      max: 60000,
    },
    autoSimulation: {
      type: Boolean,
      default: true,
    },
    autoOptimization: {
      type: Boolean,
      default: true,
    },
    emergencyPreemption: {
      type: Boolean,
      default: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
