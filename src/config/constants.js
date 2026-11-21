export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const RATING = {
  MIN: 1,
  MAX: 5,
};

export const YOUTUBE = {
  MAX_RESULTS: 6, // per list: long videos and Shorts
  CACHE_TTL_MS: 60 * 60 * 1000, // 1 hour
};

export const LINKEDIN = {
  MAX_POSTS: 6,
  REFRESH_MS: 24 * 60 * 60 * 1000, // re-read each post's likes, text and image once a day
};
