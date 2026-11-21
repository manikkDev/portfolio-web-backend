import { db } from '../config/db.js';
import { PAGINATION } from '../config/constants.js';
import { summarizeRatings } from '../utils/ratingStats.js';
import logger from '../utils/logger.js';

const ratings = db.collection('ratings');

const toApi = ({ _id, ...rest }) => ({ id: _id.toString(), ...rest });

/**
 * Create a new rating.
 */
export async function createRating({ name, rating, comment }) {
  const doc = {
    name: name?.trim() || 'Anonymous',
    rating,
    comment: comment?.trim() || null,
    created_at: new Date(),
  };

  await ratings.insertOne(doc); // adds _id to doc
  logger.info(`New rating: ${rating}/5 from "${doc.name}"`);
  return toApi(doc);
}

/**
 * Get all ratings, sorted by newest first, with pagination.
 */
export async function getRatings(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), PAGINATION.MAX_LIMIT);

  const [total, docs] = await Promise.all([
    ratings.countDocuments(),
    ratings
      .find()
      .sort({ created_at: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .toArray(),
  ]);

  return {
    ratings: docs.map(toApi),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
}

/**
 * Get aggregate stats for ratings.
 */
export async function getRatingStats() {
  const rows = await ratings.aggregate([{ $group: { _id: '$rating', n: { $sum: 1 } } }]).toArray();
  return summarizeRatings(rows);
}
