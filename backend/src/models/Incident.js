const mongoose = require('mongoose');
const { INCIDENT_TYPES, INCIDENT_SEVERITY, INCIDENT_STATUS } = require('../config/constants');

const incidentSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Location reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(INCIDENT_TYPES),
      required: true,
      default: INCIDENT_TYPES.OTHER,
    },
    severity: {
      type: String,
      enum: Object.values(INCIDENT_SEVERITY),
      required: true,
      default: INCIDENT_SEVERITY.MEDIUM,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Incident description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(INCIDENT_STATUS),
      default: INCIDENT_STATUS.REPORTED,
      index: true,
    },
    detectedVia: {
      type: String,
      enum: ['sensor_anomaly', 'citizen_report', 'police_flag'],
      default: 'citizen_report',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

incidentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Incident', incidentSchema);
