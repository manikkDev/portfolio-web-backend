import { RATING } from '../config/constants.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates contact form data.
 * Returns { valid: boolean, errors: string[] }
 */
export function validateContact({ name, email, message }) {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    errors.push('Name is required');
  }
  if (name && name.trim().length > 100) {
    errors.push('Name must be 100 characters or fewer');
  }
  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email is required');
  }
  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    errors.push('Message must be at least 5 characters');
  }
  if (message && message.trim().length > 2000) {
    errors.push('Message must be 2000 characters or fewer');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates rating submission.
 */
export function validateRating({ rating, comment, name }) {
  const errors = [];

  if (rating === undefined || rating === null) {
    errors.push('Rating is required');
  } else if (!Number.isInteger(rating) || rating < RATING.MIN || rating > RATING.MAX) {
    errors.push(`Rating must be an integer between ${RATING.MIN} and ${RATING.MAX}`);
  }

  if (name && typeof name === 'string' && name.trim().length > 50) {
    errors.push('Name must be 50 characters or fewer');
  }

  if (comment && typeof comment === 'string' && comment.trim().length > 500) {
    errors.push('Comment must be 500 characters or fewer');
  }

  return { valid: errors.length === 0, errors };
}
