import { Router } from 'express';
import { getPersonalizedFeed, getBookmarkedArticles } from '../controllers/articleController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getPersonalizedFeed);
router.get('/bookmarks', getBookmarkedArticles);

export default router;
