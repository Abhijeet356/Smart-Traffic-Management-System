require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Location = require('../models/Location');
const TrafficSignal = require('../models/TrafficSignal');
const SystemSettings = require('../models/SystemSettings');
const { ROLES, SIGNAL_MODES, SIGNAL_PHASES } = require('../config/constants');

const seedDatabase = async (shouldDisconnect = false) => {
  try {
    const existingCount = await User.countDocuments();
    if (existingCount > 0 && !shouldDisconnect) {
      console.log('[Seed] Database already contains data. Skipping auto-seed.');
      return;
    }

    console.log('[Seed] Populating initial collections...');
    await User.deleteMany({});
    await Location.deleteMany({});
    await TrafficSignal.deleteMany({});
    await SystemSettings.deleteMany({});

    // 1. Seed Default System Settings
    await SystemSettings.create({
      lowDensityMax: 30,
      mediumDensityMax: 60,
      highDensityMax: 80,
      simulationIntervalMs: 10000,
      autoSimulation: true,
      autoOptimization: true,
      emergencyPreemption: true,
    });

    // 2. Seed Users
    await User.create({
      name: 'System Administrator',
      email: 'admin@traffic.gov',
      password: 'Password123!',
      role: ROLES.ADMIN,
      contactNumber: '+91 98765 43210',
    });

    await User.create({
      name: 'Inspector Rajesh Sharma',
      email: 'officer.sharma@traffic.gov',
      password: 'Password123!',
      role: ROLES.POLICE,
      badgeNumber: 'TP-POLICE-101',
      contactNumber: '+91 98111 22334',
    });

    await User.create({
      name: 'Ananya Verma',
      email: 'ananya.citizen@gmail.com',
      password: 'Password123!',
      role: ROLES.CITIZEN,
      contactNumber: '+91 99887 76655',
    });

    await User.create({
      name: 'Public Citizen',
      email: 'citizen@traffic.gov',
      password: 'Password123!',
      role: ROLES.CITIZEN,
      contactNumber: '+91 99887 00000',
    });

    // 3. Seed Realistic Monitored Intersections (Patna & Delhi Urban Grids)
    const locationsData = [
      // --- Patna, Bihar ---
      {
        name: 'Dak Bungalow Chowk',
        code: 'PAT-101',
        coordinates: { latitude: 25.6080, longitude: 85.1376 },
        roadCapacity: 850,
        speedLimit: 45,
        roadType: 'intersection',
        description: 'Central commercial intersection connecting Fraser Road & Bailey Road',
      },
      {
        name: 'Gandhi Maidan Roundabout',
        code: 'PAT-102',
        coordinates: { latitude: 25.6186, longitude: 85.1458 },
        roadCapacity: 950,
        speedLimit: 50,
        roadType: 'roundabout',
        description: 'Major central transit roundabout and administrative corridor',
      },
      {
        name: 'Boring Road Crossing',
        code: 'PAT-103',
        coordinates: { latitude: 25.6152, longitude: 85.1165 },
        roadCapacity: 750,
        speedLimit: 40,
        roadType: 'intersection',
        description: 'High student and commercial density intersection near Boring Canal Road',
      },
      {
        name: 'Bailey Road Flyover Junction',
        code: 'PAT-104',
        coordinates: { latitude: 25.6120, longitude: 85.0850 },
        roadCapacity: 1100,
        speedLimit: 60,
        roadType: 'expressway',
        description: 'Major arterial corridor connecting Western Patna & Danapur',
      },
      {
        name: 'Ashok Rajpath / NIT Patna Junction',
        code: 'PAT-105',
        coordinates: { latitude: 25.6207, longitude: 85.1728 },
        roadCapacity: 700,
        speedLimit: 40,
        roadType: 'intersection',
        description: 'Institutional transit gateway outside NIT Patna campus',
      },

      // --- Delhi NCR ---
      {
        name: 'Connaught Place Radial Junction',
        code: 'DEL-101',
        coordinates: { latitude: 28.6315, longitude: 77.2167 },
        roadCapacity: 800,
        speedLimit: 50,
        roadType: 'roundabout',
        description: 'Primary commercial and transit hub with 8 radial spokes',
      },
      {
        name: 'AIIMS Ring Road Intersection',
        code: 'DEL-102',
        coordinates: { latitude: 28.5672, longitude: 77.2100 },
        roadCapacity: 1000,
        speedLimit: 60,
        roadType: 'intersection',
        description: 'Crucial emergency corridor serving major hospital facilities',
      },
      {
        name: 'Nehru Place Outer Ring Flyover',
        code: 'DEL-103',
        coordinates: { latitude: 28.5494, longitude: 77.2526 },
        roadCapacity: 900,
        speedLimit: 50,
        roadType: 'intersection',
        description: 'High commercial density electronic hub crossing',
      },
      {
        name: 'Cyber City Expressway Junction',
        code: 'DEL-104',
        coordinates: { latitude: 28.4950, longitude: 77.0895 },
        roadCapacity: 1200,
        speedLimit: 70,
        roadType: 'expressway',
        description: 'Major arterial corridor connecting tech parks and corporate hubs',
      },
      {
        name: 'India Gate C-Hexagon Corridor',
        code: 'DEL-105',
        coordinates: { latitude: 28.6129, longitude: 77.2295 },
        roadCapacity: 750,
        speedLimit: 50,
        roadType: 'roundabout',
        description: 'High visibility central boulevard and tourist intersection',
      },
    ];

    const insertedLocations = await Location.insertMany(locationsData);

    // 4. Seed Traffic Signals for each location
    const signalPromises = insertedLocations.map((loc) => {
      return TrafficSignal.create({
        locationId: loc._id,
        intersectionName: loc.name,
        cycleDuration: 120,
        mode: SIGNAL_MODES.ADAPTIVE,
        status: 'online',
        activeArmIndex: 0,
        arms: [
          {
            direction: 'North',
            greenDuration: 30,
            yellowDuration: 4,
            redDuration: 86,
            currentLight: SIGNAL_PHASES.GREEN,
            densityScore: 25,
          },
          {
            direction: 'South',
            greenDuration: 30,
            yellowDuration: 4,
            redDuration: 86,
            currentLight: SIGNAL_PHASES.RED,
            densityScore: 20,
          },
          {
            direction: 'East',
            greenDuration: 25,
            yellowDuration: 4,
            redDuration: 91,
            currentLight: SIGNAL_PHASES.RED,
            densityScore: 15,
          },
          {
            direction: 'West',
            greenDuration: 25,
            yellowDuration: 4,
            redDuration: 91,
            currentLight: SIGNAL_PHASES.RED,
            densityScore: 18,
          },
        ],
      });
    });

    await Promise.all(signalPromises);

    console.log('====================================================');
    console.log('✅ Demo Database Seed Completed Successfully!');
    console.log('👑 Admin:   admin@traffic.gov          / Password123!');
    console.log('👮 Police:  officer.sharma@traffic.gov / Password123!');
    console.log('🚗 Citizen: ananya.citizen@gmail.com   / Password123!');
    console.log('====================================================');

    if (shouldDisconnect) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('Seed Error:', error);
    if (shouldDisconnect) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  connectDB().then(() => seedDatabase(true));
}

module.exports = { seedDatabase };
