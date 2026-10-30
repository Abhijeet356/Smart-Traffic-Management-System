const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Location code is required (e.g., INT-101)'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
    },
    roadCapacity: {
      type: Number,
      required: [true, 'Road capacity is required (vehicles/hr)'],
      min: [50, 'Road capacity must be at least 50'],
      default: 500,
    },
    speedLimit: {
      type: Number,
      required: [true, 'Speed limit is required (km/h)'],
      default: 50,
    },
    roadType: {
      type: String,
      enum: ['intersection', 'arterial_road', 'expressway', 'roundabout'],
      default: 'intersection',
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'inactive'],
      default: 'active',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

locationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

module.exports = mongoose.model('Location', locationSchema);
