const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getTrafficAnalytics,
} = require('../controllers/reportController');

// Summary dashboard metrics
router.get('/dashboard-stats', getDashboardStats);

// Analytics, trends, and charts
router.get('/analytics', getTrafficAnalytics);

module.exports = router;
