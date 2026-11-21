const ENTITIES = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };

const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code) => {
    if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? whole;
    const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
    return Number.isFinite(n) && n <= 0x10ffff ? String.fromCodePoint(n) : whole;
  });

/**
 * Reads what a public LinkedIn post page exposes without login: the post text,
 * its image, when it was published, and like/comment counts.
 */
export function parseLinkedInPost(html) {
  const meta = (prop) =>
    decode(html.match(new RegExp(`<meta[^>]+property="${prop}"[^>]+content="([^"]*)"`))?.[1] ?? '');

  // The structured-data block carries the date and the counts.
  let ld = {};
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      const item = [].concat(data['@graph'] ?? data).find((x) => x?.datePublished);
      if (item) {
        ld = item;
        break;
      }
    } catch {
      // not JSON we can use; try the next block
    }
  }

  const count = (type) =>
    [].concat(ld.interactionStatistic ?? []).find((s) => String(s.interactionType).includes(type))
      ?.userInteractionCount ?? null;

  return {
    text: (meta('og:description') || ld.articleBody || ld.description || '').trim(),
    image: meta('og:image'),
    published_at: ld.datePublished ?? null,
    likes: count('Like'),
    comments: count('Comment'),
  };
}

const clip = (s, max) => (s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`);

/** Card title when none was given: the post's first sentence, without leading emoji. */
export function titleFrom(text) {
  const first = text.split(/\n|(?<=[.!?])\s/)[0] ?? '';
  const clean = first.replace(/^[^\p{L}\p{N}]+/u, '').trim();
  return clip(clean || 'LinkedIn post', 70);
}

/** Card excerpt: the post text on one line, shortened. */
export const excerptFrom = (text) => clip(text.replace(/\s+/g, ' ').trim(), 170);
