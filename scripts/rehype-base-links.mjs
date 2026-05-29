/**
 * Rehype plugin: rewrite root-absolute internal hrefs to include the Astro base path.
 * This fixes cross-links in MDX content files that use paths like /tracks/... on a
 * site deployed at a sub-path (e.g. /gradient-lectures/).
 *
 * Accepts the base path as a parameter so there is a single source of truth in
 * astro.config.mjs — no hardcoded duplicate here.
 */
import { visit } from 'unist-util-visit';

/** @param {string} base - The Astro `base` config value (e.g. '/gradient-lectures'). */
export function rehypeBaseLinks(base) {
  const normalizedBase = base.replace(/\/$/, '');
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties?.href) {
        const href = node.properties.href;
        if (
          typeof href === 'string' &&
          href.startsWith('/') &&
          !href.startsWith(normalizedBase) &&
          !href.startsWith('//')
        ) {
          node.properties.href = normalizedBase + href;
        }
      }
    });
  };
}
