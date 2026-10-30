const express = require('express');
const router = express.Router();

const {
  getIncidents,
  reportIncident,
  updateIncidentStatus,
} = require('../controllers/incidentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../config/constants');

// Public read access to active incidents
router.get('/', getIncidents);

// Any authenticated citizen or police officer can report an incident
router.post('/', protect, reportIncident);

// Police & Admin can update incident status (Verified / Resolved)
router.put('/:id/status', protect, authorize(ROLES.ADMIN, ROLES.POLICE), updateIncidentStatus);

module.exports = router;
