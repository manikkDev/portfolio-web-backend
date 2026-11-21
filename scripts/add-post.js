// Adds a LinkedIn post to the site's "Hackathon Wins" section (or updates one already there).
//
//   npm run add-post -- "<linkedin post link>" --title "Event name" --tag "1st Place" //       --org "Organiser" --summary "What was built, in one sentence." --facts "24-hour hackathon, Team Name"
//
//   npm run add-post -- "<linkedin post link>" --remove
//
// Only the link is required. The image, date and like count come from LinkedIn.
import { addPost, removePost } from '../src/services/linkedin.service.js';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
const remove = args.includes('--remove');
const details = {
  title: flag('title'),
  tag: flag('tag'),
  org: flag('org'),
  summary: flag('summary'),
  facts: flag('facts')?.split(',').map((f) => f.trim()).filter(Boolean),
};
const url = args.find((a) => !a.startsWith('--'));

if (!url) {
  console.error('Usage: npm run add-post -- "<linkedin post link>" [--title ..] [--tag ..] [--org ..] [--summary ..] [--facts "a, b"] | --remove');
  process.exit(1);
}

try {
  if (remove) {
    console.log((await removePost(url)) ? 'Removed.' : 'That post was not in the list.');
  } else {
    const post = await addPost(url, details);
    console.log(`Added: "${post.title}" [${post.tag}] · ${post.organizer || 'no organiser'} · published ${new Date(post.published_at).toDateString()}`);
  }
  process.exit(0);
} catch (err) {
  console.error(`Failed: ${err.message}`);
  process.exit(1);
}
