import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const passwordRules = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .custom((value) => {
    if (!value || typeof value !== 'string') {
      throw new Error('Password is required');
    }
    // Reject common placeholder / default patterns (no default passwords)
    const lowered = value.toLowerCase();
    const forbidden = ['password', '12345678', 'qwerty123', 'admin123', 'default'];
    if (forbidden.includes(lowered)) {
      throw new Error('Choose a stronger, unique password');
    }
    return true;
  });

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    passwordRules,
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

export default router;
