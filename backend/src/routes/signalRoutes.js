const express = require('express');
const router = express.Router();

const {
  getSignals,
  getSignalById,
  optimizeSignal,
  overrideSignal,
} = require('../controllers/signalController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../config/constants');

// Public signal status
router.get('/', getSignals);
router.get('/:id', getSignalById);

// Staff-controlled optimization and manual preemption
router.post('/:id/optimize', protect, authorize(ROLES.ADMIN, ROLES.POLICE), optimizeSignal);
router.put('/:id/override', protect, authorize(ROLES.ADMIN, ROLES.POLICE), overrideSignal);

module.exports = router;
