/**
 * System-wide Constants and Configuration Defaults
 */
module.exports = {
  ROLES: {
    ADMIN: 'admin',
    POLICE: 'police',
    CITIZEN: 'citizen',
  },

  DENSITY_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    SEVERE: 'severe',
  },

  DEFAULT_THRESHOLDS: {
    LOW_MAX: 30,
    MEDIUM_MAX: 60,
    HIGH_MAX: 80,
  },

  SIGNAL_MODES: {
    ADAPTIVE: 'adaptive',
    MANUAL: 'manual',
    FIXED: 'fixed',
  },

  SIGNAL_PHASES: {
    RED: 'red',
    YELLOW: 'yellow',
    GREEN: 'green',
  },

  INCIDENT_TYPES: {
    ACCIDENT: 'accident',
    OBSTRUCTION: 'obstruction',
    VIOLATION: 'violation',
    SEVERE_CONGESTION: 'congestion',
    OTHER: 'other',
  },

  INCIDENT_SEVERITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  },

  INCIDENT_STATUS: {
    REPORTED: 'reported',
    VERIFIED: 'verified',
    DISPATCHED: 'dispatch_sent',
    RESOLVED: 'resolved',
  },

  ALERT_TYPES: {
    CONGESTION: 'congestion',
    INCIDENT: 'incident',
    SIGNAL_ANOMALY: 'signal_anomaly',
    EMERGENCY: 'emergency_corridor',
  },

  ALERT_SEVERITY: {
    INFO: 'info',
    WARNING: 'warning',
    DANGER: 'danger',
  },

  ALERT_STATUS: {
    NEW: 'new',
    ACKNOWLEDGED: 'acknowledged',
    RESOLVED: 'resolved',
  },
};
