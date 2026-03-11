/**
 * Custom API Error class.
 * Controllers throw these; the global error handler catches them.
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(429, message);
  }
}
