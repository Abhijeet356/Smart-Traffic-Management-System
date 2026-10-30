const Location = require('../models/Location');
const TrafficSignal = require('../models/TrafficSignal');
const { SIGNAL_MODES, SIGNAL_PHASES } = require('../config/constants');

/**
 * @desc    Get all monitored traffic locations
 * @route   GET /api/locations
 * @access  Public
 */
const getLocations = async (req, res) => {
  try {
    const { status, roadType } = req.query;
    const query = {};

    if (status) query.status = status;
    if (roadType) query.roadType = roadType;

    const locations = await Location.find(query).sort({ code: 1 });

    res.status(200).json({
      success: true,
      count: locations.length,
      locations,
    });
  } catch (error) {
    console.error('[Get Locations Error]', error);
    res.status(500).json({ success: false, message: 'Server error retrieving locations' });
  }
};

/**
 * @desc    Get single location by ID with associated signal configuration
 * @route   GET /api/locations/:id
 * @access  Public
 */
const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    const signal = await TrafficSignal.findOne({ locationId: location._id });

    res.status(200).json({
      success: true,
      location,
      signal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving location details' });
  }
};

/**
 * @desc    Register a new monitored traffic location & initialize its signal controller
 * @route   POST /api/locations
 * @access  Private (Admin only)
 */
const createLocation = async (req, res) => {
  try {
    const { name, code, coordinates, roadCapacity, speedLimit, roadType, description } = req.body;

    const existingCode = await Location.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: `An intersection with code [${code.toUpperCase()}] already exists.`,
      });
    }

    const location = await Location.create({
      name,
      code: code.toUpperCase(),
      coordinates,
      roadCapacity: roadCapacity || 500,
      speedLimit: speedLimit || 50,
      roadType: roadType || 'intersection',
      description: description || '',
    });

    // Automatically initialize associated 4-phase Traffic Signal Controller
    const signal = await TrafficSignal.create({
      locationId: location._id,
      intersectionName: location.name,
      cycleDuration: 120,
      mode: SIGNAL_MODES.ADAPTIVE,
      status: 'online',
      activeArmIndex: 0,
      arms: [
        { direction: 'North', greenDuration: 30, yellowDuration: 4, redDuration: 86, currentLight: SIGNAL_PHASES.GREEN },
        { direction: 'South', greenDuration: 30, yellowDuration: 4, redDuration: 86, currentLight: SIGNAL_PHASES.RED },
        { direction: 'East', greenDuration: 25, yellowDuration: 4, redDuration: 91, currentLight: SIGNAL_PHASES.RED },
        { direction: 'West', greenDuration: 25, yellowDuration: 4, redDuration: 91, currentLight: SIGNAL_PHASES.RED },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Location and traffic signal controller created successfully',
      location,
      signal,
    });
  } catch (error) {
    console.error('[Create Location Error]', error);
    res.status(500).json({ success: false, message: 'Server error creating location', error: error.message });
  }
};

/**
 * @desc    Update an existing location's settings
 * @route   PUT /api/locations/:id
 * @access  Private (Admin only)
 */
const updateLocation = async (req, res) => {
  try {
    const { name, coordinates, roadCapacity, speedLimit, roadType, status, description } = req.body;

    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    if (name) location.name = name;
    if (coordinates) location.coordinates = coordinates;
    if (roadCapacity) location.roadCapacity = roadCapacity;
    if (speedLimit) location.speedLimit = speedLimit;
    if (roadType) location.roadType = roadType;
    if (status) location.status = status;
    if (description !== undefined) location.description = description;

    await location.save();

    // If name changed, synchronize intersectionName in TrafficSignal
    if (name) {
      await TrafficSignal.findOneAndUpdate(
        { locationId: location._id },
        { intersectionName: name }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      location,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating location', error: error.message });
  }
};

/**
 * @desc    Delete a location and associated signal controller
 * @route   DELETE /api/locations/:id
 * @access  Private (Admin only)
 */
const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    // Cascade delete associated signal
    await TrafficSignal.deleteMany({ locationId: location._id });
    await location.deleteOne();

    res.status(200).json({
      success: true,
      message: `Location [${location.name}] and associated signal controller deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting location' });
  }
};

module.exports = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
};
