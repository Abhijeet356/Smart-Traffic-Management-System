const SystemSettings = require('../models/SystemSettings');

/**
 * @desc    Get system settings & thresholds
 * @route   GET /api/settings
 * @access  Private
 */
const getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();

    if (!settings) {
      settings = await SystemSettings.create({
        lowDensityMax: 30,
        mediumDensityMax: 60,
        highDensityMax: 80,
        simulationIntervalMs: 10000,
        autoSimulation: true,
        autoOptimization: true,
        emergencyPreemption: true,
      });
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('[Get Settings Error]', error);
    res.status(500).json({ success: false, message: 'Server error retrieving system settings' });
  }
};

/**
 * @desc    Update system settings & thresholds (Admin only)
 * @route   PUT /api/settings
 * @access  Private (Admin only)
 */
const updateSettings = async (req, res) => {
  try {
    const {
      lowDensityMax,
      mediumDensityMax,
      highDensityMax,
      simulationIntervalMs,
      autoSimulation,
      autoOptimization,
      emergencyPreemption,
    } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    // Validate hierarchical consistency
    const low = lowDensityMax !== undefined ? lowDensityMax : settings.lowDensityMax;
    const med = mediumDensityMax !== undefined ? mediumDensityMax : settings.mediumDensityMax;
    const high = highDensityMax !== undefined ? highDensityMax : settings.highDensityMax;

    if (low >= med || med >= high || high >= 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid threshold order: Must satisfy 0 < Low < Medium < High < 100%',
      });
    }

    if (lowDensityMax !== undefined) settings.lowDensityMax = lowDensityMax;
    if (mediumDensityMax !== undefined) settings.mediumDensityMax = mediumDensityMax;
    if (highDensityMax !== undefined) settings.highDensityMax = highDensityMax;
    if (simulationIntervalMs !== undefined) settings.simulationIntervalMs = simulationIntervalMs;
    if (autoSimulation !== undefined) settings.autoSimulation = autoSimulation;
    if (autoOptimization !== undefined) settings.autoOptimization = autoOptimization;
    if (emergencyPreemption !== undefined) settings.emergencyPreemption = emergencyPreemption;

    settings.lastUpdatedBy = req.user._id;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      settings,
    });
  } catch (error) {
    console.error('[Update Settings Error]', error);
    res.status(500).json({ success: false, message: 'Server error updating settings', error: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
