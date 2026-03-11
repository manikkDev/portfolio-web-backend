import { supabase } from '../config/supabase.js';
import { PAGINATION } from '../config/constants.js';
import logger from '../utils/logger.js';

/**
 * Create a new rating.
 */
export async function createRating({ name, rating, comment }) {
  const { data, error } = await supabase
    .from('ratings')
    .insert({
      name: name ? name.trim() : 'Anonymous',
      rating,
      comment: comment ? comment.trim() : null,
    })
    .select('id, name, rating, comment, created_at')
    .single();

  if (error) {
    logger.error('Failed to insert rating:', error.message);
    throw new Error('Failed to save rating');
  }

  logger.info(`New rating: ${rating}/5 from "${data.name}"`);
  return data;
}

/**
 * Get all ratings, sorted by newest first, with pagination.
 */
export async function getRatings(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) {
  const safeLimit = Math.min(limit, PAGINATION.MAX_LIMIT);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  // Get count
  const { count, error: countError } = await supabase
    .from('ratings')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    logger.error('Failed to count ratings:', countError.message);
    throw new Error('Failed to fetch ratings');
  }

  // Get data
  const { data, error } = await supabase
    .from('ratings')
    .select('id, name, rating, comment, created_at')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    logger.error('Failed to fetch ratings:', error.message);
    throw new Error('Failed to fetch ratings');
  }

  return {
    ratings: data,
    pagination: {
      page,
      limit: safeLimit,
      total: count,
      totalPages: Math.ceil(count / safeLimit),
    },
  };
}

/**
 * Get aggregate stats for ratings.
 */
export async function getRatingStats() {
  const { data, error } = await supabase
    .from('ratings')
    .select('rating');

  if (error) {
    logger.error('Failed to fetch rating stats:', error.message);
    throw new Error('Failed to fetch rating stats');
  }

  if (!data || data.length === 0) {
    return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  for (const row of data) {
    sum += row.rating;
    distribution[row.rating] = (distribution[row.rating] || 0) + 1;
  }

  return {
    average: parseFloat((sum / data.length).toFixed(1)),
    total: data.length,
    distribution,
  };
}
