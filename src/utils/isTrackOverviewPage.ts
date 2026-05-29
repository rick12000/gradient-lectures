import { TRACK_ORDER, trackOverviews } from '../data/trackOverviews';

/** Slugs for track overview index pages (no prev pagination). Derived from trackOverviews. */
const TRACK_OVERVIEW_SLUGS = new Set(
  TRACK_ORDER.map((id) => `tracks/${id}`)
);

export function isTrackOverviewPage(slug: string): boolean {
  return TRACK_OVERVIEW_SLUGS.has(slug);
}
