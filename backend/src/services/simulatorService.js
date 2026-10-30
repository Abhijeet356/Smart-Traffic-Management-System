const Location = require('../models/Location');
const TrafficData = require('../models/TrafficData');
const TrafficSignal = require('../models/TrafficSignal');
const SystemSettings = require('../models/SystemSettings');
const { calculateDensity, classifyDensity, detectAnomaly } = require('./analyzerService');
const SignalOptimizer = require('./signalOptimizer');
const AlertService = require('./alertService');
const { DENSITY_LEVELS, ALERT_TYPES, ALERT_SEVERITY, SIGNAL_MODES } = require('../config/constants');

let simulationIntervalTimer = null;

class TrafficSimulator {
  /**
   * Run a single simulation step across all registered locations
   */
  static async simulateTick() {
    try {
      const locations = await Location.find({ status: 'active' });
      if (!locations || locations.length === 0) return { count: 0 };

      const settings = await SystemSettings.findOne();
      const results = [];

      for (const loc of locations) {
        // Base vehicle count based on capacity with natural stochastic variance
        // Time of day fluctuation factor (8-10 AM or 5-8 PM peak)
        const hour = new Date().getHours();
        const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
        const baselineRatio = isRushHour ? 0.70 : 0.40;
        const randomFactor = (Math.random() * 0.40) - 0.20; // -20% to +20%
        const targetRatio = Math.max(0.15, Math.min(0.95, baselineRatio + randomFactor));

        const vehicleCount = Math.round(loc.roadCapacity * targetRatio);
        const densityPercentage = calculateDensity(vehicleCount, loc.roadCapacity);
        const congestionLevel = classifyDensity(densityPercentage, settings);

        // Velocity inverse relationship with density
        // Free flow speed: speedLimit * 0.95
        // Congested flow: down to 5-15 km/h
        const speedRatio = Math.max(0.1, 1 - (densityPercentage / 110));
        const averageSpeed = Math.round(loc.speedLimit * speedRatio);

        // Record telemetry data
        const trafficRecord = await TrafficData.create({
          locationId: loc._id,
          vehicleCount,
          averageSpeed,
          densityPercentage,
          congestionLevel,
          source: 'sensor_sim',
          timestamp: new Date(),
        });

        // Check for severe congestion or anomaly
        if (congestionLevel === DENSITY_LEVELS.SEVERE || detectAnomaly(averageSpeed, densityPercentage)) {
          await AlertService.createAlert({
            title: `Severe Congestion Alert: ${loc.name}`,
            message: `Traffic density reached ${densityPercentage}% with average velocity dropping to ${averageSpeed} km/h.`,
            type: ALERT_TYPES.CONGESTION,
            severity: ALERT_SEVERITY.DANGER,
            locationId: loc._id,
            targetRoles: ['police', 'citizen', 'admin'],
          });
        }

        // Advance Signal state & optimize if adaptive
        const signal = await TrafficSignal.findOne({ locationId: loc._id });
        if (signal && signal.mode === SIGNAL_MODES.ADAPTIVE && settings?.autoOptimization) {
          // Simulate directional densities for N, S, E, W
          const directionalDensities = {
            North: Math.round(densityPercentage * (0.8 + Math.random() * 0.4)),
            South: Math.round(densityPercentage * (0.8 + Math.random() * 0.4)),
            East: Math.round(densityPercentage * (0.6 + Math.random() * 0.5)),
            West: Math.round(densityPercentage * (0.6 + Math.random() * 0.5)),
          };

          await SignalOptimizer.optimizeIntersection(
            signal,
            directionalDensities,
            'periodic_optimization'
          );
        }

        results.push(trafficRecord);
      }

      return {
        success: true,
        timestamp: new Date(),
        processedLocations: results.length,
        records: results,
      };
    } catch (error) {
      console.error('[Simulator Tick Error]', error);
      throw error;
    }
  }

  /**
   * Start periodic simulation background worker
   */
  static startSimulator(intervalMs = 10000) {
    if (simulationIntervalTimer) {
      clearInterval(simulationIntervalTimer);
    }
    console.log(`[Simulator] Starting automated traffic sensor telemetry generator (Interval: ${intervalMs}ms)`);
    simulationIntervalTimer = setInterval(async () => {
      try {
        await TrafficSimulator.simulateTick();
      } catch (err) {
        console.error('[Simulator Worker Error]', err.message);
      }
    }, intervalMs);
  }

  /**
   * Stop simulation background worker
   */
  static stopSimulator() {
    if (simulationIntervalTimer) {
      clearInterval(simulationIntervalTimer);
      simulationIntervalTimer = null;
      console.log('[Simulator] Traffic simulator worker stopped.');
    }
  }
}

module.exports = TrafficSimulator;
