/**
 * The numbers shown for the channel, from a YouTube `channels` item (part=statistics).
 * `subscribers` is null when the channel hides its count.
 */
export function channelStats(item) {
  const s = item?.statistics;
  if (!s) return null;
  return {
    subscribers: s.hiddenSubscriberCount ? null : Number(s.subscriberCount) || 0,
    videos: Number(s.videoCount) || 0,
    views: Number(s.viewCount) || 0,
  };
}
