import * as youtubeService from '../services/youtube.service.js';
import { ApiError } from '../utils/ApiError.js';

export async function getVideos(req, res, next) {
  try {
    // { videos: [...], shorts: [...] }
    const data = await youtubeService.getVideos();

    res.json({
      success: true,
      data,
      meta: { videos: data.videos.length, shorts: data.shorts.length },
    });
  } catch (err) {
    next(err instanceof ApiError ? err : ApiError.internal(err.message));
  }
}
