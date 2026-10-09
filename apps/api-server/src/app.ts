import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';

export const app = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (ENV.CORS_ORIGIN.indexOf(origin) !== -1 || origin.includes('localhost')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev flexible fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body Parsers & Cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl !== '/api/v1/health') {
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// API Routes
app.use('/api/v1', apiRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Bridge Of Love API Server v1.0.0',
    documentation: '/api/v1/health',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    },
  });
});

// Centralized Error Handler
app.use(errorHandler);
