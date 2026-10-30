const Incident = require('../models/Incident');
const Location = require('../models/Location');
const AlertService = require('./alertService');
const {
  INCIDENT_STATUS,
  INCIDENT_SEVERITY,
  ALERT_TYPES,
  ALERT_SEVERITY,
} = require('../config/constants');

class IncidentService {
  /**
   * Log an incident and automatically dispatch high-priority alerts
   */
  static async reportIncident({
    locationId,
    type,
    severity = INCIDENT_SEVERITY.MEDIUM,
    description,
    detectedVia = 'citizen_report',
    reportedBy = null,
  }) {
    const location = await Location.findById(locationId);
    if (!location) throw new Error('Location not found');

    const incident = await Incident.create({
      locationId,
      type,
      severity,
      description,
      detectedVia,
      reportedBy,
      status: INCIDENT_STATUS.REPORTED,
    });

    // Determine alert severity mapping
    let alertSeverity = ALERT_SEVERITY.WARNING;
    if (severity === INCIDENT_SEVERITY.CRITICAL || severity === INCIDENT_SEVERITY.HIGH) {
      alertSeverity = ALERT_SEVERITY.DANGER;
    }

    // Auto-generate alert
    await AlertService.createAlert({
      title: `Incident: ${type.toUpperCase()} at ${location.name}`,
      message: `${description} (Severity: ${severity.toUpperCase()})`,
      type: ALERT_TYPES.INCIDENT,
      severity: alertSeverity,
      locationId,
      incidentId: incident._id,
      targetRoles: ['police', 'admin', 'citizen'],
    });

    return incident;
  }

  /**
   * Update incident lifecycle status
   */
  static async updateStatus(incidentId, status, user, resolutionNotes = '') {
    const incident = await Incident.findById(incidentId);
    if (!incident) throw new Error('Incident not found');

    incident.status = status;
    if (status === INCIDENT_STATUS.VERIFIED) {
      incident.verifiedBy = user._id;
    } else if (status === INCIDENT_STATUS.RESOLVED) {
      incident.resolvedAt = new Date();
      incident.resolutionNotes = resolutionNotes;
    }

    await incident.save();
    return incident;
  }
}

module.exports = IncidentService;
