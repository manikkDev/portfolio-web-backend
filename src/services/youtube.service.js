import { YOUTUBE } from '../config/constants.js';
import env from '../config/env.js';
import { db } from '../config/db.js';
import logger from '../utils/logger.js';
import { channelStats } from '../utils/youtube.js';

const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';
const cache = db.collection('cache');

// YouTube keeps two automatic playlists per channel: swap the channel id's "UC"
// prefix for "UULF" to get long videos only, or "UUSH" to get Shorts only.
const LISTS = { videos: 'UULF', shorts: 'UUSH' };

async function yt(path, params) {
  const url = new URL(`${YT_API_BASE}/${path}`);
  url.search = new URLSearchParams({ key: env.youtube.apiKey, ...params }).toString();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube ${path} ${res.status}: ${await res.text()}`);
  return res.json();
}

/**
 * Latest long videos and latest Shorts, each newest first, with view counts, plus the
 * channel's subscriber, video and view totals. Costs 4 API quota units per refresh.
 */
async function fetchFromYouTube() {
  const { apiKey, channelId } = env.youtube;

  if (!apiKey || !channelId) {
    logger.warn('YouTube API key or Channel ID not configured — using cached data only');
    return null;
  }

  const channelRequest = yt('channels', { part: 'statistics', id: channelId }).catch((err) => {
    logger.warn(err.message);
    return { items: [] };
  });

  const lists = await Promise.all(
    Object.values(LISTS).map((prefix) =>
      yt('playlistItems', {
        part: 'contentDetails',
        playlistId: prefix + channelId.slice(2),
        maxResults: String(YOUTUBE.MAX_RESULTS),
      }).catch((err) => {
        // A channel with no Shorts (or no long videos) has no such playlist.
        logger.warn(err.message);
        return { items: [] };
      }),
    ),
  );

  const ids = lists.flatMap((l) => (l.items || []).map((i) => i.contentDetails.videoId));
  if (ids.length === 0) return null;

  const details = await yt('videos', { part: 'snippet,statistics', id: ids.join(',') });
  const byId = new Map(details.items.map((v) => [v.id, v]));

  const toVideo = (id, isShort) => {
    const v = byId.get(id);
    if (!v) return null;
    const t = v.snippet.thumbnails || {};
    return {
      id,
      title: v.snippet.title,
      thumbnail: (t.maxres || t.standard || t.high || t.medium)?.url || '',
      published_at: v.snippet.publishedAt,
      views: Number(v.statistics?.viewCount) || 0,
      link: isShort ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
    };
  };

  const [videos, shorts] = lists.map((l, i) =>
    (l.items || []).map((item) => toVideo(item.contentDetails.videoId, i === 1)).filter(Boolean),
  );
  const channel = channelStats((await channelRequest).items?.[0]);
  return { videos, shorts, channel };
}

/**
 * Get YouTube videos — serves the cached copy while it is fresh, refreshes it when
 * stale, and falls back to the stale copy if YouTube cannot be reached.
 */
export async function getVideos() {
  const cached = await cache.findOne({ _id: 'youtube' });
  if (cached && Date.now() - cached.fetched_at < YOUTUBE.CACHE_TTL_MS) {
    logger.debug('Serving YouTube videos from cache');
    return cached.data;
  }

  try {
    const data = await fetchFromYouTube();
    if (data) {
      await cache.replaceOne({ _id: 'youtube' }, { data, fetched_at: Date.now() }, { upsert: true });
      logger.info(`Cached ${data.videos.length} videos and ${data.shorts.length} Shorts`);
      return data;
    }
  } catch (err) {
    logger.error('YouTube refresh failed:', err.message);
  }

  return cached?.data ?? { videos: [], shorts: [], channel: null };
}
