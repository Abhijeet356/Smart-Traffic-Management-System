const express = require('express');
const router = express.Router();

const {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
  getUserNotifications,
  markNotificationRead,
} = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../config/constants');

// Public alerts listing
router.get('/', getAlerts);

// In-app notifications for authenticated users
router.get('/notifications', protect, getUserNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

// Police & Admin lifecycle controls
router.put('/:id/ack', protect, authorize(ROLES.ADMIN, ROLES.POLICE), acknowledgeAlert);
router.put('/:id/resolve', protect, authorize(ROLES.ADMIN, ROLES.POLICE), resolveAlert);

module.exports = router;
