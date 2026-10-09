import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data provided',
        details: formattedErrors,
      },
    });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const fields = err.meta?.target || 'field';
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: `A record with this ${Array.isArray(fields) ? fields.join(', ') : fields} already exists`,
      },
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Requested record was not found',
      },
    });
  }

  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: statusCode === 500 && process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : message,
    },
  });
}
