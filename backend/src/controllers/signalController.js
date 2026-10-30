const TrafficSignal = require('../models/TrafficSignal');
const SignalPlan = require('../models/SignalPlan');
const SignalOptimizer = require('../services/signalOptimizer');
const { SIGNAL_MODES, SIGNAL_PHASES } = require('../config/constants');

/**
 * @desc    Get all traffic signals with current phase configurations
 * @route   GET /api/signals
 * @access  Public
 */
const getSignals = async (req, res) => {
  try {
    const signals = await TrafficSignal.find().populate('locationId', 'name code roadCapacity status coordinates');
    res.status(200).json({
      success: true,
      count: signals.length,
      signals,
    });
  } catch (error) {
    console.error('[Get Signals Error]', error);
    res.status(500).json({ success: false, message: 'Server error retrieving traffic signals' });
  }
};

/**
 * @desc    Get single traffic signal details and recent plans
 * @route   GET /api/signals/:id
 * @access  Public
 */
const getSignalById = async (req, res) => {
  try {
    const signal = await TrafficSignal.findById(req.params.id).populate('locationId');
    if (!signal) {
      return res.status(404).json({ success: false, message: 'Traffic signal not found' });
    }

    const recentPlans = await SignalPlan.find({ signalId: signal._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      signal,
      recentPlans,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving signal details' });
  }
};

/**
 * @desc    Trigger adaptive optimization for a traffic signal
 * @route   POST /api/signals/:id/optimize
 * @access  Private (Police / Admin)
 */
const optimizeSignal = async (req, res) => {
  try {
    const { directionalDensities } = req.body;
    const signal = await TrafficSignal.findById(req.params.id);

    if (!signal) {
      return res.status(404).json({ success: false, message: 'Traffic signal not found' });
    }

    const result = await SignalOptimizer.optimizeIntersection(
      signal,
      directionalDensities || {},
      'manual_optimization_trigger',
      req.user
    );

    res.status(200).json({
      success: true,
      message: `Adaptive signal timing successfully calculated for ${signal.intersectionName}`,
      result,
    });
  } catch (error) {
    console.error('[Optimize Signal Error]', error);
    res.status(500).json({ success: false, message: 'Optimization calculation failed', error: error.message });
  }
};

/**
 * @desc    Manual override of signal timing or emergency corridor preemption
 * @route   PUT /api/signals/:id/override
 * @access  Private (Police / Admin)
 */
const overrideSignal = async (req, res) => {
  try {
    const { greenDirection, greenDuration = 60, mode } = req.body;
    const signal = await TrafficSignal.findById(req.params.id);

    if (!signal) {
      return res.status(404).json({ success: false, message: 'Traffic signal not found' });
    }

    if (mode && Object.values(SIGNAL_MODES).includes(mode)) {
      signal.mode = mode;
    }

    if (greenDirection) {
      signal.arms.forEach((arm) => {
        if (arm.direction.toLowerCase() === greenDirection.toLowerCase()) {
          arm.currentLight = SIGNAL_PHASES.GREEN;
          arm.greenDuration = greenDuration;
        } else {
          arm.currentLight = SIGNAL_PHASES.RED;
        }
      });
    }

    signal.lastOptimizedAt = new Date();
    await signal.save();

    // Log manual override in SignalPlan
    await SignalPlan.create({
      signalId: signal._id,
      locationId: signal.locationId,
      triggerReason: 'manual_override',
      allocations: signal.arms.map((a) => ({
        direction: a.direction,
        greenDuration: a.greenDuration,
        yellowDuration: a.yellowDuration,
        redDuration: a.redDuration,
      })),
      cycleDuration: signal.cycleDuration,
      status: 'overridden',
      authorizedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: `Signal manual override active: Priority green granted to [${greenDirection}]`,
      signal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Manual override failed', error: error.message });
  }
};

module.exports = {
  getSignals,
  getSignalById,
  optimizeSignal,
  overrideSignal,
};
