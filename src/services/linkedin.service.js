import { supabase } from '../config/supabase.js';
import logger from '../utils/logger.js';

/**
 * Get all visible LinkedIn posts, ordered by display_order.
 *
 * NOTE: LinkedIn does not offer a public RSS feed or easily accessible
 * personal post API. The official Marketing API requires OAuth2 and
 * organization-level access. For a personal portfolio, the most
 * reliable approach is a manual sync:
 *
 * 1. Add new posts via Supabase dashboard or a protected admin endpoint.
 * 2. This service reads from the `linkedin_posts` table.
 * 3. Only posts with `is_visible = true` are returned (controlled by RLS).
 *
 * This ensures the frontend always has fresh data without relying on
 * fragile scraping or restrictive API access.
 */
export async function getPosts() {
  const { data, error } = await supabase
    .from('linkedin_posts')
    .select('id, title, excerpt, tag, date, read_time, thumbnail_url, link, created_at')
    .order('display_order', { ascending: true });

  if (error) {
    logger.error('Failed to fetch LinkedIn posts:', error.message);
    throw new Error('Failed to fetch LinkedIn posts');
  }

  return data || [];
}
