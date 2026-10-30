const Location = require('../models/Location');
const TrafficData = require('../models/TrafficData');
const TrafficSignal = require('../models/TrafficSignal');
const SystemSettings = require('../models/SystemSettings');
const { calculateDensity, classifyDensity, detectAnomaly } = require('../services/analyzerService');
const TrafficSimulator = require('../services/simulatorService');
const AlertService = require('../services/alertService');
const { ALERT_TYPES, ALERT_SEVERITY } = require('../config/constants');

/**
 * @desc    Get live traffic condition across all monitored locations
 * @route   GET /api/traffic/live
 * @access  Public
 */
const getLiveTraffic = async (req, res) => {
  try {
    const locations = await Location.find({ status: 'active' });
    const liveData = [];

    for (const loc of locations) {
      // Find latest telemetry reading for this location
      const latestReading = await TrafficData.findOne({ locationId: loc._id })
        .sort({ timestamp: -1 });

      const signal = await TrafficSignal.findOne({ locationId: loc._id })
        .select('mode currentLight activeArmIndex arms');

      liveData.push({
        location: loc,
        telemetry: latestReading || {
          vehicleCount: 0,
          averageSpeed: loc.speedLimit,
          densityPercentage: 0,
          congestionLevel: 'low',
          timestamp: new Date(),
        },
        signal: signal || null,
      });
    }

    res.status(200).json({
      success: true,
      count: liveData.length,
      data: liveData,
    });
  } catch (error) {
    console.error('[Get Live Traffic Error]', error);
    res.status(500).json({ success: false, message: 'Server error retrieving live traffic' });
  }
};

/**
 * @desc    Get historical time-series traffic data for an intersection
 * @route   GET /api/traffic/history/:locationId
 * @access  Public
 */
const getTrafficHistory = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { limit = 50 } = req.query;

    const history = await TrafficData.find({ locationId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: history.length,
      history: history.reverse(), // Ascending chronological order for charting
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving traffic history' });
  }
};

/**
 * @desc    Manual or hardware sensor ingestion endpoint
 * @route   POST /api/traffic/telemetry
 * @access  Private (Staff / Sensor Gateway)
 */
const ingestTelemetry = async (req, res) => {
  try {
    const { locationId, vehicleCount, averageSpeed, source } = req.body;

    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    const settings = await SystemSettings.findOne();
    const densityPercentage = calculateDensity(vehicleCount, location.roadCapacity);
    const congestionLevel = classifyDensity(densityPercentage, settings);

    const record = await TrafficData.create({
      locationId,
      vehicleCount,
      averageSpeed,
      densityPercentage,
      congestionLevel,
      source: source || 'manual',
      timestamp: new Date(),
    });

    if (congestionLevel === 'severe' || detectAnomaly(averageSpeed, densityPercentage)) {
      await AlertService.createAlert({
        title: `Congestion Alert: ${location.name}`,
        message: `High density (${densityPercentage}%) recorded via ${source || 'sensor'}.`,
        type: ALERT_TYPES.CONGESTION,
        severity: ALERT_SEVERITY.WARNING,
        locationId: location._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Telemetry ingested successfully',
      data: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error ingesting telemetry', error: error.message });
  }
};

/**
 * @desc    Trigger a manual simulation pulse across all active locations
 * @route   POST /api/traffic/simulate-tick
 * @access  Private (Admin / Police)
 */
const triggerSimulationTick = async (req, res) => {
  try {
    const result = await TrafficSimulator.simulateTick();
    res.status(200).json({
      success: true,
      message: 'Simulation pulse processed successfully',
      result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Simulation pulse failed', error: error.message });
  }
};

module.exports = {
  getLiveTraffic,
  getTrafficHistory,
  ingestTelemetry,
  triggerSimulationTick,
};
