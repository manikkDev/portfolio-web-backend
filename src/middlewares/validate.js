import { ApiError } from '../utils/ApiError.js';

/**
 * Creates a validation middleware from a validator function.
 * The validator must return { valid: boolean, errors: string[] }.
 */
export function validate(validatorFn) {
  return (req, _res, next) => {
    const { valid, errors } = validatorFn(req.body);
    if (!valid) {
      return next(ApiError.badRequest('Validation failed', errors));
    }
    next();
  };
}
