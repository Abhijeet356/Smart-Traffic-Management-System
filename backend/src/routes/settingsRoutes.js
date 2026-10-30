const express = require('express');
const router = express.Router();

const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../config/constants');

// View settings (Authenticated staff / admin)
router.get('/', protect, getSettings);

// Update settings (Admin only)
router.put('/', protect, authorize(ROLES.ADMIN), updateSettings);

module.exports = router;
