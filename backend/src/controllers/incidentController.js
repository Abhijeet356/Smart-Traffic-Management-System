const Incident = require('../models/Incident');
const IncidentService = require('../services/incidentService');
const { ROLES } = require('../config/constants');

/**
 * @desc    Get all logged incidents with filtering
 * @route   GET /api/incidents
 * @access  Public
 */
const getIncidents = async (req, res) => {
  try {
    const { status, severity, locationId, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (locationId) query.locationId = locationId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Incident.countDocuments(query);
    const incidents = await Incident.find(query)
      .populate('locationId', 'name code coordinates')
      .populate('reportedBy', 'name email role')
      .populate('verifiedBy', 'name badgeNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: incidents.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      incidents,
    });
  } catch (error) {
    console.error('[Get Incidents Error]', error);
    res.status(500).json({ success: false, message: 'Server error retrieving incidents' });
  }
};

/**
 * @desc    Submit an incident report (Citizen or Police)
 * @route   POST /api/incidents
 * @access  Private (Authenticated users)
 */
const reportIncident = async (req, res) => {
  try {
    const { locationId, type, severity, description } = req.body;

    const detectedVia = req.user.role === ROLES.POLICE ? 'police_flag' : 'citizen_report';

    const incident = await IncidentService.reportIncident({
      locationId,
      type,
      severity,
      description,
      detectedVia,
      reportedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully and alert dispatched',
      incident,
    });
  } catch (error) {
    console.error('[Report Incident Error]', error);
    res.status(500).json({ success: false, message: 'Failed to report incident', error: error.message });
  }
};

/**
 * @desc    Update incident lifecycle status (Verify or Resolve)
 * @route   PUT /api/incidents/:id/status
 * @access  Private (Police / Admin)
 */
const updateIncidentStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;

    const incident = await IncidentService.updateStatus(
      req.params.id,
      status,
      req.user,
      resolutionNotes
    );

    res.status(200).json({
      success: true,
      message: `Incident status updated to [${status}]`,
      incident,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update incident status', error: error.message });
  }
};

module.exports = {
  getIncidents,
  reportIncident,
  updateIncidentStatus,
};
