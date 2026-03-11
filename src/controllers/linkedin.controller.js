import * as linkedinService from '../services/linkedin.service.js';
import { ApiError } from '../utils/ApiError.js';

export async function getPosts(req, res, next) {
  try {
    const posts = await linkedinService.getPosts();

    res.json({
      success: true,
      data: posts,
      meta: { count: posts.length },
    });
  } catch (err) {
    next(err instanceof ApiError ? err : ApiError.internal(err.message));
  }
}
