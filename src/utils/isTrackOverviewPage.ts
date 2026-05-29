/** Slugs for track overview index pages (no prev pagination). */
const TRACK_OVERVIEW_SLUGS = new Set([
  'tracks/experimentation',
  'tracks/bayesian-statistics',
  'tracks/causal-inference',
]);

export function isTrackOverviewPage(slug: string): boolean {
  return TRACK_OVERVIEW_SLUGS.has(slug);
}
