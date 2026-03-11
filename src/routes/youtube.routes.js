import { Router } from 'express';
import { getVideos } from '../controllers/youtube.controller.js';

const router = Router();

router.get('/videos', getVideos);

export default router;
