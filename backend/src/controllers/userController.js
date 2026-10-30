const User = require('../models/User');
const { ROLES } = require('../config/constants');

/**
 * @desc    Get all registered users with optional role filtering and search
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && Object.values(ROLES).includes(role)) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { badgeNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      users,
    });
  } catch (error) {
    console.error('[Get Users Error]', error);
    res.status(500).json({ success: false, message: 'Server error retrieving users' });
  }
};

/**
 * @desc    Get single user details
 * @route   GET /api/users/:id
 * @access  Private (Admin only)
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving user' });
  }
};

/**
 * @desc    Update a user role (Admin only)
 * @route   PUT /api/users/:id/role
 * @access  Private (Admin only)
 */
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`,
      });
    }

    // Prevent admin from removing their own admin status
    if (req.user._id.toString() === req.params.id && role !== ROLES.ADMIN) {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote your own administrator account.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User role successfully updated to [${role}]`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating user role' });
  }
};

/**
 * @desc    Toggle user active/inactive status (Admin only)
 * @route   PUT /api/users/:id/status
 * @access  Private (Admin only)
 */
const toggleUserStatus = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own administrator account.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error toggling user status' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
};
