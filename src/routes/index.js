import { Router } from 'express';
import contactRoutes from './contact.routes.js';
import ratingRoutes from './rating.routes.js';
import youtubeRoutes from './youtube.routes.js';
import linkedinRoutes from './linkedin.routes.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Portfolio API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Feature routes
router.use('/contact', contactRoutes);
router.use('/ratings', ratingRoutes);
router.use('/youtube', youtubeRoutes);
router.use('/linkedin', linkedinRoutes);

export default router;
