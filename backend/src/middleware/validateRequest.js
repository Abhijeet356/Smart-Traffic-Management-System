const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results from express-validator
 * Returns formatted 400 Bad Request error if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed on submitted payload',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = { validate };
