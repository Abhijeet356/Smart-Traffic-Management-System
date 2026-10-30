const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../config/constants');

// All user management routes require Admin authorization
router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.put('/:id/status', toggleUserStatus);

module.exports = router;
