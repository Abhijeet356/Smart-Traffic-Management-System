const express = require('express');
const router = express.Router();

const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateRequest');
const { registerValidator, loginValidator } = require('../validators/authValidator');

// Public endpoints
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);

// Protected profile endpoint
router.get('/me', protect, getMe);

module.exports = router;
