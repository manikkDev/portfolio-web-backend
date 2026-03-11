import * as ratingService from '../services/rating.service.js';
import { ApiError } from '../utils/ApiError.js';
import { PAGINATION } from '../config/constants.js';

export async function submitRating(req, res, next) {
  try {
    const { name, rating, comment } = req.body;
    const result = await ratingService.createRating({ name, rating, comment });

    res.status(201).json({
      success: true,
      message: 'Thank you for your rating!',
      data: result,
    });
  } catch (err) {
    next(err instanceof ApiError ? err : ApiError.internal(err.message));
  }
}

export async function getRatings(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT;
    const result = await ratingService.getRatings(page, limit);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err instanceof ApiError ? err : ApiError.internal(err.message));
  }
}

export async function getRatingStats(req, res, next) {
  try {
    const stats = await ratingService.getRatingStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err instanceof ApiError ? err : ApiError.internal(err.message));
  }
}
