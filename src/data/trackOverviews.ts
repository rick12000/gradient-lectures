export type TrackVariant = 'experimentation' | 'bayesian' | 'causal';

export type TrackOverviewId =
  | 'experimentation'
  | 'bayesian-statistics'
  | 'causal-inference';

export interface TrackNoteItem {
  title: string;
  href: string;
  description: string;
  comingSoon?: boolean;
}

export interface TrackContentSection {
  title?: string;
  notes: TrackNoteItem[];
}

export interface TrackOverviewConfig {
  /** Short identifier used for the track card number, e.g. "Track 01" */
  number: string;
  /** Display title for the card and sidebar group label */
  title: string;
  /** Estimated read time shown on the track card */
  hours: number;
  /** Tag displayed on the card (e.g. "theory") */
  tag: string;
  /** Root path for the track overview page */
  href: string;
  /** One-sentence description for the track card */
  cardDescription: string;
  /** Variant slug used for CSS class names */
  variant: TrackVariant;
  /** Longer summary shown on the track overview page */
  summary: string;
  /** If true, show a coming-soon placeholder instead of note content */
  comingSoon?: boolean;
  /** Optional description shown in the coming-soon placeholder */
  comingSoonDescription?: string;
  sections: TrackContentSection[];
}

export const trackOverviews: Record<TrackOverviewId, TrackOverviewConfig> = {
  experimentation: {
    number: 'Track 01',
    title: 'Experimentation',
    hours: 4,
    tag: 'theory',
    href: '/tracks/experimentation/',
    cardDescription:
      'The mathematics and statistics of A/B testing — power analysis, causal estimation, sequential testing, multiple comparisons, and network effects. Includes both Frequentist and Bayesian methods.',
    variant: 'experimentation',
    summary:
      'The mathematics and statistics of A/B testing — from power analysis and causal estimation to sequential testing, multiple comparisons, and network effects. Includes both frequentist and Bayesian approaches.',
    sections: [
      {
        title: 'Frequentist Experimentation',
        notes: [
          {
            title: 'Foundations of A/B Testing',
            href: '/tracks/experimentation/frequentist-experimentation/foundations-of-ab-testing/',
            description: 'The ATE estimator, difference-in-means framework, and uncertainty quantification.',
          },
          {
            title: 'Power & Sensitivity',
            href: '/tracks/experimentation/frequentist-experimentation/power-and-sensitivity/',
            description: 'Sizing experiments to reliably detect real effects.',
          },
          {
            title: 'Multiple Testing',
            href: '/tracks/experimentation/frequentist-experimentation/multiple-testing/',
            description: 'Controlling false positives when evaluating many hypotheses.',
          },
          {
            title: 'Repeated Looks and Peeking',
            href: '/tracks/experimentation/frequentist-experimentation/repeated-looks-and-peeking/',
            description: 'Always-valid inference and sequential testing.',
          },
          {
            title: 'Normality & Resampling',
            href: '/tracks/experimentation/frequentist-experimentation/normality-and-resampling/',
            description: 'Handling non-normal metrics with resampling methods.',
          },
          {
            title: 'Spillover and Network Effects',
            href: '/tracks/experimentation/frequentist-experimentation/spillover-and-network-effects/',
            description: 'SUTVA violations and cluster randomization.',
          },
          {
            title: 'Interaction Effects',
            href: '/tracks/experimentation/frequentist-experimentation/interaction-effects/',
            description: 'Concurrent experiments interfering with each other.',
          },
          {
            title: 'Evidence Aggregation',
            href: '/tracks/experimentation/frequentist-experimentation/evidence-aggregation/',
            description: 'Combining p-values across independent experiments.',
          },
        ],
      },
      {
        title: 'Bayesian Experimentation',
        notes: [
          {
            title: 'Interpretational Bayesian A/B Testing',
            href: '/tracks/experimentation/bayesian-experimentation/interpretational-bayesian-experimentation/',
            description: 'Bayesian framing for experiment analysis — in progress.',
            comingSoon: true,
          },
        ],
      },
    ],
  },
  'bayesian-statistics': {
    number: 'Track 02',
    title: 'Bayesian Statistics',
    hours: 1,
    tag: 'theory',
    href: '/tracks/bayesian-statistics/',
    cardDescription:
      'Bayesian inference from first principles — conjugate priors, posterior updates, credible intervals, and Bayesian regression.',
    variant: 'bayesian',
    summary:
      "Bayesian inference from first principles — starting with Bayes' rule and building through conjugate priors to full Bayesian linear regression.",
    sections: [
      {
        notes: [
          {
            title: 'Bayes Rule',
            href: '/tracks/bayesian-statistics/bayes-rule/',
            description: 'The foundation of Bayesian inference.',
          },
          {
            title: 'Beta-Bernoulli Conjugate Prior',
            href: '/tracks/bayesian-statistics/beta-bernoulli-conjugate-prior/',
            description: 'Updating beliefs about a proportion.',
          },
          {
            title: 'Normal-Normal Conjugate Prior',
            href: '/tracks/bayesian-statistics/normal-normal-conjugate-prior/',
            description: 'Updating beliefs about a mean.',
          },
          {
            title: 'Bayesian Linear Regression',
            href: '/tracks/bayesian-statistics/bayesian-linear-regression/',
            description: 'Extending conjugacy to regression.',
          },
          {
            title: 'Multivariate Bayesian Linear Regression',
            href: '/tracks/bayesian-statistics/multivariate-bayesian-linear-regression/',
            description: 'The full vector-coefficient case.',
          },
        ],
      },
    ],
  },
  'causal-inference': {
    number: 'Track 03',
    title: 'Causal Inference',
    hours: 3,
    tag: 'theory',
    href: '/tracks/causal-inference/',
    cardDescription:
      'Observational causal inference — DAGs, matching methods, propensity scores, IPW, and heterogeneous treatment effects like Causal Forests and CFRNet.',
    variant: 'causal',
    summary:
      'Statistical methods for estimating causal effects from observational data — from foundational assumptions and DAGs through matching, propensity scores, and heterogeneous treatment effects.',
    sections: [
      {
        notes: [
          {
            title: 'Fundamental Assumptions',
            href: '/tracks/causal-inference/fundamental-assumptions/',
            description: 'The potential outcomes framework and identification assumptions.',
          },
          {
            title: 'DAG',
            href: '/tracks/causal-inference/dag/',
            description: 'Directed acyclic graphs for encoding causal structure.',
          },
          {
            title: 'Matching Methods',
            href: '/tracks/causal-inference/matching-methods/',
            description: 'Constructing counterfactuals by pairing similar units.',
          },
          {
            title: 'Propensity Scores',
            href: '/tracks/causal-inference/propensity-scores/',
            description: 'Collapsing covariates into a single balancing score.',
          },
          {
            title: 'Inverse Probability Weighting',
            href: '/tracks/causal-inference/inverse-probability-weighting/',
            description: 'Reweighting observations to simulate a randomized trial.',
          },
          {
            title: 'Double Machine Learning',
            href: '/tracks/causal-inference/double-machine-learning/',
            description: 'Isolating causal effects via residualization and cross-fitting.',
          },
        ],
      },
      {
        title: 'Heterogeneous Treatment Effects',
        notes: [
          {
            title: 'Introduction & Meta-Learners',
            href: '/tracks/causal-inference/heterogeneous-treatment-effects/introduction-and-basic-meta-learners/',
            description: 'Estimating CATEs with S-, T-, and X-learners.',
          },
          {
            title: 'TARNet',
            href: '/tracks/causal-inference/heterogeneous-treatment-effects/tarnet/',
            description: 'Neural network architecture for CATE estimation.',
          },
          {
            title: 'CFRNet',
            href: '/tracks/causal-inference/heterogeneous-treatment-effects/cfrnet/',
            description: 'Representation learning for counterfactual regression.',
          },
          {
            title: 'Causal Forests',
            href: '/tracks/causal-inference/heterogeneous-treatment-effects/causal-forests/',
            description: 'Tree-based nonparametric CATE estimation.',
          },
          {
            title: 'Gaussian Process Treatment Models',
            href: '/tracks/causal-inference/heterogeneous-treatment-effects/gaussian-process-treatment-models/',
            description: 'Bayesian nonparametric CATE estimation.',
          },
        ],
      },
    ],
  },
};

/** Ordered list of track IDs — controls display order on cards and sidebar. */
export const TRACK_ORDER: TrackOverviewId[] = [
  'experimentation',
  'bayesian-statistics',
  'causal-inference',
];
