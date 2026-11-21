import { db } from '../config/db.js';
import { LINKEDIN } from '../config/constants.js';
import { excerptFrom, parseLinkedInPost, titleFrom } from '../utils/linkedin.js';
import logger from '../utils/logger.js';

/**
 * LinkedIn offers no way to list a person's posts (the feed needs a login and the
 * API does not expose it). So each post is added once by its link
 * (`npm run add-post -- <link>`), and from then on this service re-reads the public
 * post page once a day to keep its text, image and like count current.
 */
const posts = db.collection('linkedin_posts');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

/** Accepts only linkedin.com post links and drops tracking parameters. */
export function normalizeUrl(input) {
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new Error('That is not a link');
  }
  const isLinkedIn = url.protocol === 'https:' && /(^|\.)linkedin\.com$/.test(url.hostname);
  if (!isLinkedIn || !/^\/(posts|feed\/update)\//.test(url.pathname)) {
    throw new Error('Expected a LinkedIn post link (https://www.linkedin.com/posts/...)');
  }
  return `https://www.linkedin.com${url.pathname.replace(/\/$/, '')}`;
}

async function fetchMeta(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error(`LinkedIn answered ${res.status}`);
  const meta = parseLinkedInPost(await res.text());
  if (!meta.text && !meta.published_at) throw new Error('LinkedIn did not return a public post for that link');
  return meta;
}

/**
 * Adds a post by link, or refreshes it if it is already there.
 * `details` are the hand-written parts of a card that LinkedIn cannot supply:
 * title (event name), tag (result badge), org (organiser), summary (what was built)
 * and facts (short chips such as team name or format).
 */
export async function addPost(rawUrl, details = {}) {
  const url = normalizeUrl(rawUrl);
  const meta = await fetchMeta(url);

  await posts.updateOne(
    { url },
    {
      $set: {
        ...meta,
        published_at: meta.published_at ? new Date(meta.published_at) : new Date(),
        fetched_at: new Date(),
        ...Object.fromEntries(
          ['title', 'tag', 'org', 'summary', 'facts'].filter((k) => details[k]?.length).map((k) => [k, details[k]]),
        ),
      },
    },
    { upsert: true },
  );
  return toApi(await posts.findOne({ url }));
}

/** Removes a post by link. Returns false if it was not there. */
export async function removePost(rawUrl) {
  const { deletedCount } = await posts.deleteOne({ url: normalizeUrl(rawUrl) });
  return deletedCount === 1;
}

let refreshing = false;

/** Re-reads posts not checked in the last day. Runs in the background; never throws. */
async function refreshStale(docs) {
  if (refreshing) return;
  refreshing = true;
  try {
    for (const doc of docs) {
      if (Date.now() - new Date(doc.fetched_at).getTime() < LINKEDIN.REFRESH_MS) continue;
      try {
        const { text, image, likes, comments } = await fetchMeta(doc.url);
        await posts.updateOne({ _id: doc._id }, { $set: { text, image, likes, comments, fetched_at: new Date() } });
      } catch (err) {
        // Keep what we have and try again tomorrow rather than on every request.
        logger.warn(`LinkedIn refresh failed for ${doc.url}: ${err.message}`);
        await posts.updateOne({ _id: doc._id }, { $set: { fetched_at: new Date() } });
      }
    }
  } finally {
    refreshing = false;
  }
}

const toApi = (d) => ({
  id: d._id.toString(),
  title: d.title || titleFrom(d.text || ''),
  excerpt: d.summary || excerptFrom(d.text || ''),
  tag: d.tag || 'LinkedIn',
  organizer: d.org || '',
  facts: d.facts ?? [],
  thumbnail_url: d.image || '',
  link: d.url,
  published_at: d.published_at,
  likes: d.likes ?? null,
  comments: d.comments ?? null,
});

/** Newest posts first. */
export async function getPosts() {
  const docs = await posts.find().sort({ published_at: -1 }).limit(LINKEDIN.MAX_POSTS).toArray();
  refreshStale(docs).catch((err) => logger.error('LinkedIn refresh error:', err.message));
  return docs.map(toApi);
}
