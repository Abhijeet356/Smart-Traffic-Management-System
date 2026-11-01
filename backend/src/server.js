require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const { seedDatabase } = require('./seeds/seed');
const TrafficSimulator = require('./services/simulatorService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed initial data if database is brand new (e.g., In-Memory or fresh Atlas cluster)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Auto-Seed] Empty database detected. Auto-populating demo users and intersections...');
      await seedDatabase(false);
    } else {
      console.log(`[Database] Found ${userCount} existing users. Ready.`);
    }

    // Auto-start sensor simulator if enabled
    if (process.env.AUTO_SIMULATION !== 'false') {
      const intervalMs = parseInt(process.env.SIMULATION_INTERVAL_MS) || 10000;
      TrafficSimulator.startSimulator(intervalMs);
    }

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚦 Smart Traffic Management System API Server`);
      console.log(`🚀 Server running in [${process.env.NODE_ENV || 'development'}] mode`);
      console.log(`📡 Listening on http://localhost:${PORT}`);
      console.log(`🩺 Healthcheck: http://localhost:${PORT}/api/health`);
      console.log('====================================================');
    });

    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      TrafficSimulator.stopSimulator();
      server.close(async () => {
        const { disconnectDB } = require('./config/db');
        await disconnectDB();
        console.log('[Server] Closed connections. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Critical Server Initialization Error:', error);
    process.exit(1);
  }
};

startServer();
