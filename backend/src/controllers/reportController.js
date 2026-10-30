const Location = require('../models/Location');
const TrafficData = require('../models/TrafficData');
const Incident = require('../models/Incident');
const Alert = require('../models/Alert');
const TrafficSignal = require('../models/TrafficSignal');
const User = require('../models/User');

/**
 * @desc    Get high-level summary counters for dashboard stat cards
 * @route   GET /api/reports/dashboard-stats
 * @access  Public
 */
const getDashboardStats = async (req, res) => {
  try {
    const totalLocations = await Location.countDocuments({ status: 'active' });
    const totalSignals = await TrafficSignal.countDocuments({ status: 'online' });
    const activeIncidents = await Incident.countDocuments({ status: { $ne: 'resolved' } });
    const activeAlerts = await Alert.countDocuments({ status: { $in: ['new', 'acknowledged'] } });
    const totalUsers = await User.countDocuments({ isActive: true });

    // Aggregate total vehicles recorded in the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const telemetryAgg = await TrafficData.aggregate([
      { $match: { timestamp: { $gte: yesterday } } },
      {
        $group: {
          _id: null,
          totalVehicles: { $sum: '$vehicleCount' },
          avgDensity: { $avg: '$densityPercentage' },
          avgSpeed: { $avg: '$averageSpeed' },
        },
      },
    ]);

    // Count congested locations right now
    const locations = await Location.find({ status: 'active' });
    let congestedLocationsCount = 0;
    for (const loc of locations) {
      const latest = await TrafficData.findOne({ locationId: loc._id }).sort({ timestamp: -1 });
      if (latest && (latest.congestionLevel === 'high' || latest.congestionLevel === 'severe')) {
        congestedLocationsCount++;
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        totalLocations,
        totalSignals,
        activeIncidents,
        activeAlerts,
        totalUsers,
        congestedLocationsCount,
        totalVehicles24h: telemetryAgg[0]?.totalVehicles || 0,
        avgDensity24h: Math.round((telemetryAgg[0]?.avgDensity || 0) * 10) / 10,
        avgSpeed24h: Math.round((telemetryAgg[0]?.avgSpeed || 0) * 10) / 10,
      },
    });
  } catch (error) {
    console.error('[Get Dashboard Stats Error]', error);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard stats' });
  }
};

/**
 * @desc    Get detailed traffic analytics, hourly breakdown, and congestion heat data
 * @route   GET /api/reports/analytics
 * @access  Public
 */
const getTrafficAnalytics = async (req, res) => {
  try {
    const { locationId, days = 7 } = req.query;
    const sinceDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const matchQuery = { timestamp: { $gte: sinceDate } };
    if (locationId) {
      matchQuery.locationId = locationId;
    }

    // Density breakdown by category
    const categoryBreakdown = await TrafficData.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$congestionLevel', count: { $sum: 1 } } },
    ]);

    // Hourly aggregation for peak-hour chart
    const hourlyTrends = await TrafficData.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          avgDensity: { $avg: '$densityPercentage' },
          avgSpeed: { $avg: '$averageSpeed' },
          totalVehicles: { $sum: '$vehicleCount' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Incident type breakdown
    const incidentBreakdown = await Incident.aggregate([
      { $match: { createdAt: { $gte: sinceDate } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        categoryBreakdown,
        hourlyTrends: hourlyTrends.map((h) => ({
          hour: `${h._id}:00`,
          avgDensity: Math.round(h.avgDensity),
          avgSpeed: Math.round(h.avgSpeed),
          totalVehicles: h.totalVehicles,
        })),
        incidentBreakdown,
      },
    });
  } catch (error) {
    console.error('[Get Analytics Error]', error);
    res.status(500).json({ success: false, message: 'Server error calculating analytics' });
  }
};

module.exports = {
  getDashboardStats,
  getTrafficAnalytics,
};
