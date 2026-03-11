import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for contact form — 5 submissions per 15 minutes per IP.
 */
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many contact submissions. Please try again later.' },
  },
});

/**
 * Rate limiter for rating submissions — 3 per 10 minutes per IP.
 */
export const ratingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many rating submissions. Please try again later.' },
  },
});

/**
 * General API rate limiter — 100 requests per minute per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many requests. Please slow down.' },
  },
});
