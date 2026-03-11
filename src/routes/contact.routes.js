import { Router } from 'express';
import { submitContact } from '../controllers/contact.controller.js';
import { validate } from '../middlewares/validate.js';
import { validateContact } from '../utils/validators.js';
import { contactLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/', contactLimiter, validate(validateContact), submitContact);

export default router;
