const mongoose = require('mongoose');

const signalPlanSchema = new mongoose.Schema(
  {
    signalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrafficSignal',
      required: true,
      index: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
      index: true,
    },
    triggerReason: {
      type: String,
      enum: ['density_spike', 'periodic_optimization', 'manual_override', 'emergency_corridor'],
      default: 'periodic_optimization',
    },
    allocations: [
      {
        direction: { type: String, required: true },
        greenDuration: { type: Number, required: true },
        yellowDuration: { type: Number, required: true },
        redDuration: { type: Number, required: true },
      },
    ],
    cycleDuration: {
      type: Number,
      required: true,
    },
    densitySnapshot: {
      type: Map,
      of: Number,
      default: {},
    },
    status: {
      type: String,
      enum: ['active', 'overridden', 'archived'],
      default: 'active',
    },
    authorizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null if algorithmically generated
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SignalPlan', signalPlanSchema);
