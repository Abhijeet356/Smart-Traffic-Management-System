const express = require('express');
const router = express.Router();

const {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateRequest');
const { createLocationValidator, updateLocationValidator } = require('../validators/locationValidator');
const { ROLES } = require('../config/constants');

// Public endpoints
router.get('/', getLocations);
router.get('/:id', getLocationById);

// Admin-restricted mutation endpoints
router.post('/', protect, authorize(ROLES.ADMIN), createLocationValidator, validate, createLocation);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateLocationValidator, validate, updateLocation);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteLocation);

module.exports = router;
