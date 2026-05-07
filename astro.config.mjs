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
              label: 'Frequentist Methods',
              items: [
                { label: 'Power & Sensitivity', link: '/tracks/experimentation/frequentist/01-power-sensitivity/' },
                { label: 'Core Estimation Layer', link: '/tracks/experimentation/frequentist/02-core-estimation/' },
                { label: 'Spillover & Network Effects', link: '/tracks/experimentation/frequentist/03-spillover-network-effects/' },
                { label: 'Interaction Effects', link: '/tracks/experimentation/frequentist/04-interaction-effects/' },
                { label: 'Multiple Testing', link: '/tracks/experimentation/frequentist/05-multiple-testing/' },
                { label: 'Repeated Looks & Peeking', link: '/tracks/experimentation/frequentist/06-repeated-looks-peeking/' },
                { label: 'Normality & Resampling', link: '/tracks/experimentation/frequentist/07-normality-resampling/' },
                { label: 'Evidence Aggregation', link: '/tracks/experimentation/frequentist/08-evidence-aggregation/' },
              ],
            },
            {
              label: 'Bayesian Methods',
              items: [
                { label: 'Bayesian Experimentation', link: '/tracks/experimentation/bayesian/' },
              ],
            },
          ],
        },
        {
          label: 'Bayesian Statistics',
          items: [
            { label: 'Track Overview', link: '/tracks/bayesian-statistics/' },
            { label: 'Bayes Rule', link: '/tracks/bayesian-statistics/01-bayes-rule/' },
            { label: 'Beta-Bernoulli Model', link: '/tracks/bayesian-statistics/02-beta-bernoulli/' },
            { label: 'Normal-Normal Model', link: '/tracks/bayesian-statistics/03-normal-normal/' },
            { label: 'Bayesian Linear Regression', link: '/tracks/bayesian-statistics/04-bayesian-linear-regression/' },
            { label: 'Multivariate Bayesian LR', link: '/tracks/bayesian-statistics/05-multivariate-bayesian-lr/' },
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
