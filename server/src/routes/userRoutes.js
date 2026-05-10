import { Router } from 'express';
import { body } from 'express-validator';
import { getProfile, updatePreferences, toggleBookmark } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);

router.put(
  '/preferences',
  [
    body('categories').optional().isArray(),
    body('keywords').optional().isArray(),
  ],
  validate,
  updatePreferences
);

/** Bonus: bookmark toggle */
router.post('/bookmarks/:articleId', toggleBookmark);

export default router;
