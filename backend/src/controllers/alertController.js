const Alert = require('../models/Alert');
const Notification = require('../models/Notification');
const AlertService = require('../services/alertService');

/**
 * @desc    Get active traffic & incident alerts
 * @route   GET /api/alerts
 * @access  Public
 */
const getAlerts = async (req, res) => {
  try {
    const { status, severity, limit = 30 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (severity) query.severity = severity;

    const alerts = await Alert.find(query)
      .populate('locationId', 'name code coordinates')
      .populate('incidentId', 'type severity description status')
      .populate('acknowledgedBy', 'name badgeNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error('[Get Alerts Error]', error);
    res.status(500).json({ success: false, message: 'Server error retrieving alerts' });
  }
};

/**
 * @desc    Acknowledge an alert (Police / Admin)
 * @route   PUT /api/alerts/:id/ack
 * @access  Private (Police / Admin)
 */
const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await AlertService.acknowledgeAlert(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Alert acknowledged',
      alert,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to acknowledge alert', error: error.message });
  }
};

/**
 * @desc    Resolve an alert (Police / Admin)
 * @route   PUT /api/alerts/:id/resolve
 * @access  Private (Police / Admin)
 */
const resolveAlert = async (req, res) => {
  try {
    const alert = await AlertService.resolveAlert(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Alert marked as resolved',
      alert,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to resolve alert', error: error.message });
  }
};

/**
 * @desc    Get current user's notifications
 * @route   GET /api/alerts/notifications
 * @access  Private
 */
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving notifications' });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/alerts/notifications/:id/read
 * @access  Private
 */
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error marking notification as read' });
  }
};

module.exports = {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
  getUserNotifications,
  markNotificationRead,
};
