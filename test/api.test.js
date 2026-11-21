import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeRatings } from '../src/utils/ratingStats.js';
import { validateContact, validateRating } from '../src/utils/validators.js';
import { excerptFrom, parseLinkedInPost, titleFrom } from '../src/utils/linkedin.js';

test('summarizeRatings: empty', () => {
  assert.deepEqual(summarizeRatings([]), {
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
});

test('summarizeRatings: weighted average and distribution', () => {
  const s = summarizeRatings([{ _id: 5, n: 3 }, { _id: 4, n: 1 }, { _id: 1, n: 1 }]);
  assert.equal(s.total, 5);
  assert.equal(s.average, 4); // (15 + 4 + 1) / 5
  assert.deepEqual(s.distribution, { 1: 1, 2: 0, 3: 0, 4: 1, 5: 3 });
});

test('validateRating', () => {
  assert.ok(validateRating({ rating: 5 }).valid);
  assert.ok(validateRating({ rating: 3, name: 'A', comment: 'ok' }).valid);
  assert.ok(!validateRating({}).valid);
  assert.ok(!validateRating(undefined).valid);
  assert.ok(!validateRating({ rating: 6 }).valid);
  assert.ok(!validateRating({ rating: 4.5 }).valid);
  assert.ok(!validateRating({ rating: 5, name: { $gt: '' } }).valid);
  assert.ok(!validateRating({ rating: 5, comment: 'x'.repeat(501) }).valid);
});

test('validateContact', () => {
  const ok = { name: 'A', email: 'a@b.co', message: 'hello there' };
  assert.ok(validateContact(ok).valid);
  assert.ok(!validateContact({ ...ok, email: 'nope' }).valid);
  assert.ok(!validateContact({ ...ok, email: ['a@b.co'] }).valid);
  assert.ok(!validateContact({ ...ok, name: { $ne: null } }).valid);
  assert.ok(!validateContact({ ...ok, message: 'hey' }).valid);
  assert.ok(!validateContact(undefined).valid);
});

test('parseLinkedInPost reads text, image, date and counts', () => {
  const html = `
    <meta property="og:description" content="&#x1F680; Shipped my game! It&#39;s live &amp; playable.">
    <meta property="og:image" content="https://media.licdn.com/x.jpg?e=1&amp;v=beta">
    <script type="application/ld+json">{"@type":"SocialMediaPosting","datePublished":"2025-07-25T15:17:52.673Z",
      "interactionStatistic":[{"interactionType":"http://schema.org/LikeAction","userInteractionCount":92},
                              {"interactionType":"http://schema.org/CommentAction","userInteractionCount":16}]}</script>`;
  assert.deepEqual(parseLinkedInPost(html), {
    text: "🚀 Shipped my game! It's live & playable.",
    image: 'https://media.licdn.com/x.jpg?e=1&v=beta',
    published_at: '2025-07-25T15:17:52.673Z',
    likes: 92,
    comments: 16,
  });
});

test('parseLinkedInPost on a page with nothing usable', () => {
  assert.deepEqual(parseLinkedInPost('<html>login wall</html>'), {
    text: '', image: '', published_at: null, likes: null, comments: null,
  });
});

test('titleFrom and excerptFrom', () => {
  assert.equal(titleFrom("🚀 Shipped my game! It's live."), 'Shipped my game!');
  assert.equal(titleFrom(''), 'LinkedIn post');
  assert.ok(titleFrom('word '.repeat(40)).length <= 70);
  assert.equal(excerptFrom('a\n\n b   c'), 'a b c');
  assert.ok(excerptFrom('x'.repeat(400)).endsWith('…'));
});
