require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

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
