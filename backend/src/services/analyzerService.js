const { DENSITY_LEVELS, DEFAULT_THRESHOLDS } = require('../config/constants');

/**
 * Traffic Density & Velocity Analysis Engine
 */

/**
 * Calculate Traffic Density Percentage
 * Formula: (Number of Vehicles / Road Capacity) * 100
 * @param {number} vehicleCount 
 * @param {number} roadCapacity 
 * @returns {number} density percentage (0 - 100, rounded to 2 decimals)
 */
const calculateDensity = (vehicleCount, roadCapacity) => {
  if (!roadCapacity || roadCapacity <= 0) return 0;
  if (!vehicleCount || vehicleCount < 0) return 0;

  const rawDensity = (vehicleCount / roadCapacity) * 100;
  const clamped = Math.min(100, Math.max(0, rawDensity));
  return Math.round(clamped * 100) / 100;
};

/**
 * Classify density percentage into standardized traffic categories
 * @param {number} densityPercentage 
 * @param {object} customThresholds Optional override from SystemSettings
 * @returns {string} 'low' | 'medium' | 'high' | 'severe'
 */
const classifyDensity = (densityPercentage, customThresholds = null) => {
  const lowMax = customThresholds?.lowDensityMax || DEFAULT_THRESHOLDS.LOW_MAX;
  const medMax = customThresholds?.mediumDensityMax || DEFAULT_THRESHOLDS.MEDIUM_MAX;
  const highMax = customThresholds?.highDensityMax || DEFAULT_THRESHOLDS.HIGH_MAX;

  if (densityPercentage <= lowMax) {
    return DENSITY_LEVELS.LOW;
  } else if (densityPercentage <= medMax) {
    return DENSITY_LEVELS.MEDIUM;
  } else if (densityPercentage <= highMax) {
    return DENSITY_LEVELS.HIGH;
  } else {
    return DENSITY_LEVELS.SEVERE;
  }
};

/**
 * Check if telemetry indicates a potential anomaly or incident
 * Heuristic: Average speed < 5 km/h while density > 80% (indicates complete standstill / accident)
 * @param {number} averageSpeed 
 * @param {number} densityPercentage 
 * @returns {boolean}
 */
const detectAnomaly = (averageSpeed, densityPercentage) => {
  return averageSpeed <= 8 && densityPercentage >= 75;
};

module.exports = {
  calculateDensity,
  classifyDensity,
  detectAnomaly,
};
