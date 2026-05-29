import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mermaid from 'astro-mermaid';
import { rehypeBaseLinks } from './scripts/rehype-base-links.mjs';
import { trackOverviews, TRACK_ORDER } from './src/data/trackOverviews.ts';

/**
 * Build the Starlight sidebar config from trackOverviews — single source of truth.
 * Structure: one top-level group per track, with a Track Overview link first,
 * then flat or grouped note links matching the sections array.
 */
function buildSidebar() {
  return TRACK_ORDER.map((id) => {
    const track = trackOverviews[id];

    const noteToItem = (note) => ({ label: note.title, link: note.href });

    const sectionItems = track.sections.flatMap((section) => {
      if (section.title) {
        return [{ label: section.title, items: section.notes.map(noteToItem) }];
      }
      return section.notes.map(noteToItem);
    });

    return {
      label: track.title,
      items: [
        { label: 'Track Overview', link: track.href },
        ...sectionItems,
      ],
    };
  });
}

const BASE = '/gradient-lectures';

export default defineConfig({
  site: 'https://rick12000.github.io',
  base: BASE,
  integrations: [
    mermaid({
      theme: 'neutral',
      autoTheme: false,
    }),
    starlight({
      title: 'Gradient Lectures',
      logo: {
        src: './src/assets/short_logo.png',
        replacesTitle: true,
      },
      description: 'A free, open, and deeply interconnected repository of machine learning and mathematical knowledge.',
      components: {
        Sidebar:       './src/components/Sidebar.astro',
        PageSidebar:   './src/components/PageSidebar.astro',
        Header:        './src/components/Header.astro',
        Pagination:    './src/components/Pagination.astro',
        ThemeProvider: './src/components/ThemeProvider.astro',
        ThemeSelect:   './src/components/Empty.astro',
      },
      expressiveCode: {
        themes: ['starlight-light'],
        useStarlightDarkModeSwitch: false,
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
      sidebar: buildSidebar(),
      lastUpdated: false,
      pagination: true,
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, [rehypeBaseLinks, BASE]],
  },
});
