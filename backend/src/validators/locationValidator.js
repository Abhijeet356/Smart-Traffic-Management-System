const { check } = require('express-validator');

const createLocationValidator = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Location name is required')
    .isLength({ min: 3, max: 150 })
    .withMessage('Name must be between 3 and 150 characters'),

  check('code')
    .trim()
    .notEmpty()
    .withMessage('Location code is required (e.g., INT-101)')
    .isLength({ min: 2, max: 20 })
    .withMessage('Code must be between 2 and 20 characters'),

  check('coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid coordinate between -90 and 90'),

  check('coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid coordinate between -180 and 180'),

  check('roadCapacity')
    .optional()
    .isInt({ min: 50, max: 10000 })
    .withMessage('Road capacity must be an integer between 50 and 10000'),

  check('speedLimit')
    .optional()
    .isInt({ min: 20, max: 150 })
    .withMessage('Speed limit must be between 20 and 150 km/h'),
];

const updateLocationValidator = [
  check('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Name must be between 3 and 150 characters'),

  check('coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  check('coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  check('roadCapacity')
    .optional()
    .isInt({ min: 50, max: 10000 })
    .withMessage('Road capacity must be between 50 and 10000'),

  check('speedLimit')
    .optional()
    .isInt({ min: 20, max: 150 })
    .withMessage('Speed limit must be between 20 and 150 km/h'),
];

module.exports = {
  createLocationValidator,
  updateLocationValidator,
};
