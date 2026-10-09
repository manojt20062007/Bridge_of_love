import { app } from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';

async function bootstrap() {
  await connectDB();

  const server = app.listen(ENV.PORT, () => {
    logger.info(`🚀 Bridge Of Love API Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
    logger.info(`   Base API URL: http://localhost:${ENV.PORT}/api/v1`);
    logger.info(`   Trust Name:   ${ENV.TRUST_NAME}`);
  });

  const shutdown = () => {
    logger.info('Gracefully shutting down server...');
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  logger.error('Failed to start application:', err);
  process.exit(1);
});
