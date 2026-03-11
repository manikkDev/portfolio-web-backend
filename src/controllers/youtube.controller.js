import * as youtubeService from '../services/youtube.service.js';
import { ApiError } from '../utils/ApiError.js';

export async function getVideos(req, res, next) {
  try {
    const videos = await youtubeService.getVideos();

    res.json({
      success: true,
      data: videos,
      meta: { count: videos.length },
    });
  } catch (err) {
    next(err instanceof ApiError ? err : ApiError.internal(err.message));
  }
}
