import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://rick12000.github.io',
  base: '/gradient-lectures',
  integrations: [
    starlight({
      title: 'Gradient Lectures',
      logo: {
        src: './src/assets/short_logo.png',
        replacesTitle: true,
      },
      description: 'A free, open, and deeply interconnected repository of machine learning and mathematical knowledge.',
      components: {
        Sidebar: './src/components/Sidebar.astro',
        PageSidebar: './src/components/PageSidebar.astro',
        Header: './src/components/Header.astro',
      },
      customCss: [
        './src/styles/custom.css',
        '@fontsource/inter/400.css',
        '@fontsource/inter/500.css',
        '@fontsource/inter/600.css',
        '@fontsource/inter/700.css',
        '@fontsource/jetbrains-mono/400.css',
        'katex/dist/katex.min.css',
      ],
      sidebar: [
        {
          label: 'Experimentation',
          items: [
            { label: 'Track Overview', link: '/tracks/experimentation/' },
            {
              label: 'Frequentist Experimentation',
              items: [
                { label: 'Overview', link: '/tracks/experimentation/frequentist-experimentation/' },
                { label: 'Foundations of A/B Testing', link: '/tracks/experimentation/frequentist-experimentation/foundations-of-ab-testing/' },
                { label: 'Power & Sensitivity', link: '/tracks/experimentation/frequentist-experimentation/power-and-sensitivity/' },
                { label: 'Multiple Testing', link: '/tracks/experimentation/frequentist-experimentation/multiple-testing/' },
                { label: 'Repeated Looks and Peeking', link: '/tracks/experimentation/frequentist-experimentation/repeated-looks-and-peeking/' },
                { label: 'Normality & Resampling', link: '/tracks/experimentation/frequentist-experimentation/normality-and-resampling/' },
                { label: 'Spillover and Network Effects', link: '/tracks/experimentation/frequentist-experimentation/spillover-and-network-effects/' },
                { label: 'Interaction Effects', link: '/tracks/experimentation/frequentist-experimentation/interaction-effects/' },
                { label: 'Evidence Aggregation', link: '/tracks/experimentation/frequentist-experimentation/evidence-aggregation/' },
              ],
            },
            {
              label: 'Bayesian Experimentation',
              items: [
                { label: 'Overview', link: '/tracks/experimentation/bayesian-experimentation/' },
                { label: 'Interpretational Bayesian A/B Testing', link: '/tracks/experimentation/bayesian-experimentation/interpretational-bayesian-experimentation/' },
              ],
            },
          ],
        },
        {
          label: 'Bayesian Statistics',
          items: [
            { label: 'Track Overview', link: '/tracks/bayesian-statistics/' },
            { label: 'Bayes Rule', link: '/tracks/bayesian-statistics/bayes-rule/' },
            { label: 'Beta-Bernoulli Conjugate Prior', link: '/tracks/bayesian-statistics/beta-bernoulli-conjugate-prior/' },
            { label: 'Normal-Normal Conjugate Prior', link: '/tracks/bayesian-statistics/normal-normal-conjugate-prior/' },
            { label: 'Bayesian Linear Regression', link: '/tracks/bayesian-statistics/bayesian-linear-regression/' },
            { label: 'Multivariate Bayesian Linear Regression', link: '/tracks/bayesian-statistics/multivariate-bayesian-linear-regression/' },
          ],
        },
        {
          label: 'Causal Inference',
          items: [
            { label: 'Track Overview', link: '/tracks/causal-inference/' },
            { label: 'Fundamental Assumptions', link: '/tracks/causal-inference/fundamental-assumptions/' },
            { label: 'DAG', link: '/tracks/causal-inference/dag/' },
            { label: 'Propensity Scores', link: '/tracks/causal-inference/propensity-scores/' },
            { label: 'Matching Methods', link: '/tracks/causal-inference/matching-methods/' },
            { label: 'Inverse Probability Weighting', link: '/tracks/causal-inference/inverse-probability-weighting/' },
            { label: 'Double Machine Learning', link: '/tracks/causal-inference/double-machine-learning/' },
            {
              label: 'Heterogeneous Treatment Effects',
              items: [
                { label: 'Introduction & Meta-Learners', link: '/tracks/causal-inference/heterogeneous-treatment-effects/introduction-and-basic-meta-learners/' },
                { label: 'TARNet', link: '/tracks/causal-inference/heterogeneous-treatment-effects/tarnet/' },
                { label: 'CFRNet', link: '/tracks/causal-inference/heterogeneous-treatment-effects/cfrnet/' },
                { label: 'Causal Forests', link: '/tracks/causal-inference/heterogeneous-treatment-effects/causal-forests/' },
                { label: 'Gaussian Process Treatment Models', link: '/tracks/causal-inference/heterogeneous-treatment-effects/gaussian-process-treatment-models/' },
              ],
            },
          ],
        },
      ],
            lastUpdated: false,
      pagination: true,
      head: [
        {
          tag: 'script',
          content: `
            document.addEventListener('DOMContentLoaded', () => {
              // Only add progress bar on pages with a sidebar (note pages)
              if (!document.documentElement.hasAttribute('data-has-sidebar')) return;

              const progressBarContainer = document.createElement('div');
              progressBarContainer.className = 'reading-progress-container';
              
              const progressBar = document.createElement('div');
              progressBar.className = 'reading-progress-bar';
              
              progressBarContainer.appendChild(progressBar);
              document.body.appendChild(progressBarContainer);

              window.addEventListener('scroll', () => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                
                // Prevent division by zero or negative values
                if (height <= 0) {
                  progressBar.style.width = '0%';
                  return;
                }
                
                const scrolled = (winScroll / height) * 100;
                progressBar.style.width = scrolled + '%';
              });
            });
          `
        }
      ]
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
