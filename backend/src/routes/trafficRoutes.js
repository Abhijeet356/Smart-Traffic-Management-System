const express = require('express');
const router = express.Router();

const {
  getLiveTraffic,
  getTrafficHistory,
  ingestTelemetry,
  triggerSimulationTick,
} = require('../controllers/trafficController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../config/constants');

// Public live conditions & charts
router.get('/live', getLiveTraffic);
router.get('/history/:locationId', getTrafficHistory);

// Authenticated telemetry ingestion and simulation trigger
router.post('/telemetry', protect, authorize(ROLES.ADMIN, ROLES.POLICE), ingestTelemetry);
router.post('/simulate-tick', protect, authorize(ROLES.ADMIN, ROLES.POLICE), triggerSimulationTick);

module.exports = router;
