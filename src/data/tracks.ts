export type TrackVariant = 'experimentation' | 'bayesian' | 'causal';

export interface LearningTrack {
  variant: TrackVariant;
  number: string;
  title: string;
  hours: number;
  tag: string;
  href: string;
  description: string;
  comingSoon?: boolean;
}

export const learningTracks: LearningTrack[] = [
  {
    variant: 'experimentation',
    number: 'Track 01',
    title: 'Experimentation',
    hours: 4,
    tag: 'theory',
    href: '/tracks/experimentation/',
    description:
      'The mathematics and statistics of A/B testing — power analysis, causal estimation, sequential testing, multiple comparisons, and network effects. Includes both Frequentist and Bayesian methods.',
  },
  {
    variant: 'bayesian',
    number: 'Track 02',
    title: 'Bayesian Statistics',
    hours: 1,
    tag: 'theory',
    href: '/tracks/bayesian-statistics/',
    description:
      'Bayesian inference from first principles — conjugate priors, posterior updates, credible intervals, and Bayesian regression.',
  },
  {
    variant: 'causal',
    number: 'Track 03',
    title: 'Causal Inference',
    hours: 3,
    tag: 'theory',
    href: '/tracks/causal-inference/',
    description:
      'Observational causal inference — DAGs, matching methods, propensity scores, IPW, and heterogeneous treatment effects like Causal Forests and CFRNet.',
  },
];

export function getTrackByVariant(variant: TrackVariant): LearningTrack | undefined {
  return learningTracks.find((t) => t.variant === variant);
}
