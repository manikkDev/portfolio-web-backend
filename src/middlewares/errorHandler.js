import logger from '../utils/logger.js';
import env from '../config/env.js';

/**
 * Global error handler middleware.
 * Must be registered LAST in the middleware chain (4 params = Express error handler).
 */
export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[${statusCode}] ${message}`, err.details || '');

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(err.details && { details: err.details }),
      ...(env.nodeEnv === 'development' && { stack: err.stack }),
    },
  });
}
