const {
  calculateDensity,
  classifyDensity,
  detectAnomaly,
} = require('../src/services/analyzerService');
const SignalOptimizer = require('../src/services/signalOptimizer');
const { DENSITY_LEVELS } = require('../src/config/constants');

describe('Phase 4 & 5: Traffic Telemetry & Adaptive Signal Engine Tests', () => {
  describe('Mathematical Traffic Density Calculation', () => {
    it('should accurately calculate (Vehicles / Capacity) * 100', () => {
      // 250 vehicles on a 1000 capacity road = 25.00%
      const density = calculateDensity(250, 1000);
      expect(density).toBe(25);
    });

    it('should clamp values between 0% and 100%', () => {
      expect(calculateDensity(-50, 500)).toBe(0);
      expect(calculateDensity(1500, 500)).toBe(100);
    });

    it('should handle zero road capacity safely without division-by-zero errors', () => {
      expect(calculateDensity(100, 0)).toBe(0);
    });
  });

  describe('Traffic Density Classification', () => {
    it('should categorize 0–30% as Low', () => {
      expect(classifyDensity(0)).toBe(DENSITY_LEVELS.LOW);
      expect(classifyDensity(29.5)).toBe(DENSITY_LEVELS.LOW);
      expect(classifyDensity(30)).toBe(DENSITY_LEVELS.LOW);
    });

    it('should categorize 31–60% as Medium', () => {
      expect(classifyDensity(31)).toBe(DENSITY_LEVELS.MEDIUM);
      expect(classifyDensity(55)).toBe(DENSITY_LEVELS.MEDIUM);
      expect(classifyDensity(60)).toBe(DENSITY_LEVELS.MEDIUM);
    });

    it('should categorize 61–80% as High', () => {
      expect(classifyDensity(61)).toBe(DENSITY_LEVELS.HIGH);
      expect(classifyDensity(75)).toBe(DENSITY_LEVELS.HIGH);
      expect(classifyDensity(80)).toBe(DENSITY_LEVELS.HIGH);
    });

    it('should categorize 81–100% as Severe', () => {
      expect(classifyDensity(81)).toBe(DENSITY_LEVELS.SEVERE);
      expect(classifyDensity(98)).toBe(DENSITY_LEVELS.SEVERE);
      expect(classifyDensity(100)).toBe(DENSITY_LEVELS.SEVERE);
    });
  });

  describe('Anomaly & Standstill Detection', () => {
    it('should flag anomaly when speed drops below 8 km/h while density >= 75%', () => {
      expect(detectAnomaly(5, 85)).toBe(true);
      expect(detectAnomaly(40, 85)).toBe(false); // fast flow
      expect(detectAnomaly(4, 20)).toBe(false);  // slow but empty road
    });
  });

  describe('Adaptive Signal Timing Optimization', () => {
    it('should allocate higher green time to directional arms with higher density', async () => {
      const mockSignal = {
        _id: 'signal_123',
        locationId: 'loc_123',
        intersectionName: 'Ring Road Junction',
        cycleDuration: 120,
        arms: [
          { direction: 'North', greenDuration: 30, yellowDuration: 4, redDuration: 86, densityScore: 80 },
          { direction: 'South', greenDuration: 30, yellowDuration: 4, redDuration: 86, densityScore: 20 },
          { direction: 'East', greenDuration: 25, yellowDuration: 4, redDuration: 91, densityScore: 10 },
          { direction: 'West', greenDuration: 25, yellowDuration: 4, redDuration: 91, densityScore: 10 },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      const directionalDensities = {
        North: 85, // Congested
        South: 25,
        East: 15,
        West: 15,
      };

      const SignalPlan = require('../src/models/SignalPlan');
      SignalPlan.create = jest.fn().mockResolvedValue({ _id: 'plan_123' });

      const result = await SignalOptimizer.optimizeIntersection(
        mockSignal,
        directionalDensities,
        'test_optimization'
      );

      expect(result.success).toBe(true);
      const northAllocation = result.allocations.find((a) => a.direction === 'North');
      const eastAllocation = result.allocations.find((a) => a.direction === 'East');

      // North has 85% density vs East with 15% -> North must have significantly more green time
      expect(northAllocation.greenDuration).toBeGreaterThan(eastAllocation.greenDuration);
      expect(northAllocation.greenDuration).toBeGreaterThanOrEqual(40);
      expect(eastAllocation.greenDuration).toBeGreaterThanOrEqual(15); // Preserves minimum safety green
    });
  });
});
