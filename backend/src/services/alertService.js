const Alert = require('../models/Alert');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { ALERT_TYPES, ALERT_SEVERITY, ALERT_STATUS, ROLES } = require('../config/constants');

/**
 * Alert & Notification Dispatch Service
 */
class AlertService {
  /**
   * Create a new traffic or incident alert and notify relevant stakeholders
   */
  static async createAlert({
    title,
    message,
    type = ALERT_TYPES.CONGESTION,
    severity = ALERT_SEVERITY.WARNING,
    locationId = null,
    incidentId = null,
    targetRoles = ['police', 'citizen', 'admin'],
  }) {
    try {
      // Check for duplicate active alert to prevent alert fatigue
      const existingAlert = await Alert.findOne({
        locationId,
        type,
        status: ALERT_STATUS.NEW,
      });

      if (existingAlert) {
        return existingAlert; // Active alert already exists
      }

      const alert = await Alert.create({
        title,
        message,
        type,
        severity,
        locationId,
        incidentId,
        targetRoles,
        status: ALERT_STATUS.NEW,
      });

      // Dispatch notifications to online police and admins
      const targetUsers = await User.find({
        role: { $in: targetRoles },
        isActive: true,
      }).select('_id');

      if (targetUsers.length > 0) {
        const notifications = targetUsers.map((u) => ({
          userId: u._id,
          alertId: alert._id,
          title: `[ALERT] ${title}`,
          message,
          type: 'alert',
        }));
        await Notification.insertMany(notifications);
      }

      return alert;
    } catch (error) {
      console.error('[AlertService Error]', error);
      throw error;
    }
  }

  /**
   * Acknowledge an active alert
   */
  static async acknowledgeAlert(alertId, officerUser) {
    const alert = await Alert.findById(alertId);
    if (!alert) throw new Error('Alert not found');

    alert.status = ALERT_STATUS.ACKNOWLEDGED;
    alert.acknowledgedBy = officerUser._id;
    alert.acknowledgedAt = new Date();
    await alert.save();

    return alert;
  }

  /**
   * Resolve an alert
   */
  static async resolveAlert(alertId, officerUser) {
    const alert = await Alert.findById(alertId);
    if (!alert) throw new Error('Alert not found');

    alert.status = ALERT_STATUS.RESOLVED;
    alert.resolvedBy = officerUser._id;
    alert.resolvedAt = new Date();
    await alert.save();

    return alert;
  }
}

module.exports = AlertService;
