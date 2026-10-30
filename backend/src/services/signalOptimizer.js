const SignalPlan = require('../models/SignalPlan');
const TrafficSignal = require('../models/TrafficSignal');

/**
 * Adaptive Traffic Signal Optimization Engine
 * Allocates dynamic green splits proportionally to real-time directional density.
 */
class SignalOptimizer {
  /**
   * Optimize directional green time allocations for an intersection
   * @param {string|object} signalOrId 
   * @param {object} directionalDensities Map of densities per arm: { North: 65, South: 40, East: 20, West: 15 }
   * @param {string} triggerReason 
   * @param {object} authorizedUser 
   * @returns {Promise<object>} Generated SignalPlan
   */
  static async optimizeIntersection(signalOrId, directionalDensities = {}, triggerReason = 'periodic_optimization', authorizedUser = null) {
    let signal = signalOrId;
    if (typeof signalOrId === 'string' || signalOrId instanceof String) {
      signal = await TrafficSignal.findById(signalOrId);
    }

    if (!signal) {
      throw new Error('Traffic signal not found for optimization');
    }

    const cycleDuration = signal.cycleDuration || 120;
    const armsCount = signal.arms.length || 4;
    const yellowDuration = 4; // seconds per phase
    const totalYellowTime = armsCount * yellowDuration;
    const totalAvailableGreen = cycleDuration - totalYellowTime; // e.g. 120 - 16 = 104s

    const minGreen = 15; // Minimum green duration to prevent lane starvation
    const maxGreen = 55; // Maximum green duration to prevent excessive cross-traffic wait

    // Calculate sum of densities
    let sumDensity = 0;
    const armDensities = signal.arms.map((arm) => {
      const density = directionalDensities[arm.direction] !== undefined
        ? Number(directionalDensities[arm.direction])
        : (arm.densityScore || 20);
      sumDensity += Math.max(5, density);
      return { direction: arm.direction, density: Math.max(5, density) };
    });

    // Proportional green allocation
    let allocatedGreens = armDensities.map((item) => {
      const rawShare = (item.density / sumDensity) * totalAvailableGreen;
      const clamped = Math.max(minGreen, Math.min(maxGreen, Math.round(rawShare)));
      return { direction: item.direction, green: clamped, density: item.density };
    });

    // Reconcile rounding discrepancies to exactly match totalAvailableGreen
    const currentAllocatedSum = allocatedGreens.reduce((acc, curr) => acc + curr.green, 0);
    const difference = totalAvailableGreen - currentAllocatedSum;

    if (difference !== 0) {
      // Add/subtract difference from the arm with highest density (if within max bounds)
      const targetArm = allocatedGreens.reduce((prev, curr) => (curr.density > prev.density ? curr : prev), allocatedGreens[0]);
      targetArm.green += difference;
    }

    // Build plan allocations with corresponding red & yellow durations
    const planAllocations = signal.arms.map((arm) => {
      const match = allocatedGreens.find((g) => g.direction === arm.direction);
      const allocatedGreen = match ? match.green : minGreen;
      const redDuration = cycleDuration - (allocatedGreen + yellowDuration);

      // Update in-memory arm values
      arm.greenDuration = allocatedGreen;
      arm.yellowDuration = yellowDuration;
      arm.redDuration = redDuration;
      arm.densityScore = match ? match.density : arm.densityScore;

      return {
        direction: arm.direction,
        greenDuration: allocatedGreen,
        yellowDuration,
        redDuration,
      };
    });

    signal.lastOptimizedAt = new Date();
    await signal.save();

    // Create SignalPlan audit history
    const densityMap = new Map();
    armDensities.forEach((d) => densityMap.set(d.direction, d.density));

    const signalPlan = await SignalPlan.create({
      signalId: signal._id,
      locationId: signal.locationId,
      triggerReason,
      allocations: planAllocations,
      cycleDuration,
      densitySnapshot: densityMap,
      status: 'active',
      authorizedBy: authorizedUser ? authorizedUser._id : null,
    });

    return {
      success: true,
      signalId: signal._id,
      intersectionName: signal.intersectionName,
      cycleDuration,
      signalPlan,
      allocations: planAllocations,
    };
  }
}

module.exports = SignalOptimizer;
