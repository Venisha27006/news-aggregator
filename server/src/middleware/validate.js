import { validationResult } from 'express-validator';

/**
 * Runs after express-validator chains; returns 400 with first error if invalid.
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
    });
  }
  next();
}
