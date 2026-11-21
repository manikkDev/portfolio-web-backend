import { RATING } from '../config/constants.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isString = (v) => typeof v === 'string';
// Optional text fields must be absent or a string: objects and arrays are rejected
// so they can never reach the database or crash a .trim().
const isOptionalString = (v) => v === undefined || v === null || isString(v);

/**
 * Validates contact form data.
 * Returns { valid: boolean, errors: string[] }
 */
export function validateContact({ name, email, subject, message } = {}) {
  const errors = [];

  if (!isString(name) || name.trim().length < 1) {
    errors.push('Name is required');
  } else if (name.trim().length > 100) {
    errors.push('Name must be 100 characters or fewer');
  }

  if (!isString(email) || email.length > 254 || !emailRegex.test(email)) {
    errors.push('A valid email is required');
  }

  if (!isOptionalString(subject) || (subject && subject.trim().length > 150)) {
    errors.push('Subject must be 150 characters or fewer');
  }

  if (!isString(message) || message.trim().length < 5) {
    errors.push('Message must be at least 5 characters');
  } else if (message.trim().length > 2000) {
    errors.push('Message must be 2000 characters or fewer');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates rating submission.
 */
export function validateRating({ rating, comment, name } = {}) {
  const errors = [];

  if (rating === undefined || rating === null) {
    errors.push('Rating is required');
  } else if (!Number.isInteger(rating) || rating < RATING.MIN || rating > RATING.MAX) {
    errors.push(`Rating must be an integer between ${RATING.MIN} and ${RATING.MAX}`);
  }

  if (!isOptionalString(name) || (name && name.trim().length > 50)) {
    errors.push('Name must be 50 characters or fewer');
  }

  if (!isOptionalString(comment) || (comment && comment.trim().length > 500)) {
    errors.push('Comment must be 500 characters or fewer');
  }

  return { valid: errors.length === 0, errors };
}
