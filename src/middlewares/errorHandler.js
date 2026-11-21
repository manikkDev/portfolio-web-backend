import logger from '../utils/logger.js';
import env from '../config/env.js';

/**
 * Global error handler middleware.
 * Must be registered LAST in the middleware chain (4 params = Express error handler).
 */
export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isDev = env.nodeEnv === 'development';

  logger.error(`[${statusCode}] ${err.message}`, err.details || '');

  // Server-side failures can carry database or host details; only show them in development.
  const message = statusCode >= 500 && !isDev ? 'Internal Server Error' : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(err.details && { details: err.details }),
      ...(isDev && { stack: err.stack }),
    },
  });
}
