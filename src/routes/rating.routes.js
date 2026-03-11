import { Router } from 'express';
import { submitRating, getRatings, getRatingStats } from '../controllers/rating.controller.js';
import { validate } from '../middlewares/validate.js';
import { validateRating } from '../utils/validators.js';
import { ratingLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.get('/', getRatings);
router.get('/stats', getRatingStats);
router.post('/', ratingLimiter, validate(validateRating), submitRating);

export default router;
