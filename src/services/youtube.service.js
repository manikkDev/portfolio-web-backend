import { YOUTUBE } from '../config/constants.js';
import env from '../config/env.js';
import { supabaseAdmin } from '../config/supabase.js';
import logger from '../utils/logger.js';

const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Fetch latest videos from YouTube Data API v3 and cache in Supabase.
 */
async function fetchFromYouTube() {
  const { apiKey, channelId } = env.youtube;

  if (!apiKey || !channelId) {
    logger.warn('YouTube API key or Channel ID not configured — using cached data only');
    return null;
  }

  const url = new URL(`${YT_API_BASE}/search`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('channelId', channelId);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('order', 'date');
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', String(YOUTUBE.MAX_RESULTS));

  const res = await fetch(url.toString());

  if (!res.ok) {
    const errBody = await res.text();
    logger.error('YouTube API error:', res.status, errBody);
    return null;
  }

  const json = await res.json();

  const videos = (json.items || []).map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
    published_at: item.snippet.publishedAt,
    channel_title: item.snippet.channelTitle,
    link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    tags: item.snippet.tags ? item.snippet.tags.join(', ') : '',
    fetched_at: new Date().toISOString(),
  }));

  // Upsert into cache
  if (videos.length > 0) {
    const { error } = await supabaseAdmin
      .from('youtube_cache')
      .upsert(videos, { onConflict: 'id' });

    if (error) {
      logger.error('Failed to cache YouTube videos:', error.message);
    } else {
      logger.info(`Cached ${videos.length} YouTube videos`);
    }
  }

  return videos;
}

/**
 * Get YouTube videos — serves from cache, refreshes if stale.
 */
export async function getVideos() {
  // Check cache freshness
  const { data: cached, error } = await supabaseAdmin
    .from('youtube_cache')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(YOUTUBE.MAX_RESULTS);

  if (error) {
    logger.error('Failed to read YouTube cache:', error.message);
  }

  // If cache exists and is fresh, return it
  if (cached && cached.length > 0) {
    const newestFetch = new Date(cached[0].fetched_at).getTime();
    const isStale = Date.now() - newestFetch > YOUTUBE.CACHE_TTL_MS;

    if (!isStale) {
      logger.debug('Serving YouTube videos from cache');
      return cached;
    }
  }

  // Cache is stale or empty — try to refresh
  const fresh = await fetchFromYouTube();

  if (fresh && fresh.length > 0) {
    return fresh;
  }

  // Fallback to whatever is in cache
  return cached || [];
}
