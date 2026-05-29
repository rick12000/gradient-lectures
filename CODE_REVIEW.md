# Gradient Lectures — Definitive Code Review & Remediation Plan

**Date:** 2026-05-29  
**Scope:** Full repository — every source file read directly.  
**Purpose:** Action plan for a coding agent to execute, ordered by priority.

---

## Table of contents

1. [P0 — Production blockers](#p0--production-blockers)
2. [P1 — Correctness & behaviour](#p1--correctness--behaviour)
3. [P2 — Architecture & maintainability](#p2--architecture--maintainability)
4. [P3 — CSS & design-system hygiene](#p3--css--design-system-hygiene)
5. [P4 — Minor quality improvements](#p4--minor-quality-improvements)
6. [What is working well (do not change)](#what-is-working-well-do-not-change)

---

## P0 — Production blockers

These cause visible failures for real users on `rick12000.github.io/gradient-lectures`.

---

### P0-1 · All in-content cross-links 404 on GitHub Pages

**File(s):** 26 MDX files in `src/content/docs/`  
**Verified:** Built HTML contains `href="/tracks/..."` in link bodies but `href="/gradient-lectures/tracks/..."` in sidebar. The body links 404 in production.

**Root cause:** Markdown inline links use root-absolute paths without the `/gradient-lectures` base:
```markdown
[Bayes Rule](/tracks/bayesian-statistics/bayes-rule/)
```
Starlight does not rewrite these. `withBase()` exists in the codebase but is only used in Astro components, not in MDX link syntax.

**Total affected links:** ~70 across 26 files (counts from grep: `foundations-of-ab-testing` has 6, `fundamental-assumptions` has 8, etc.)

**Fix — add a rehype plugin that rewrites internal hrefs at build time:**

In `astro.config.mjs`, add to `rehypePlugins`:
```javascript
// scripts/rehype-base-links.mjs
import { visit } from 'unist-util-visit';

const BASE = '/gradient-lectures';

export function rehypeBaseLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties?.href) {
        const href = node.properties.href;
        if (typeof href === 'string' && href.startsWith('/') && !href.startsWith(BASE)) {
          node.properties.href = BASE + href;
        }
      }
    });
  };
}
```
Then in `astro.config.mjs`:
```javascript
import { rehypeBaseLinks } from './scripts/rehype-base-links.mjs';
// ...
markdown: {
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex, rehypeBaseLinks],
},
```
Install `unist-util-visit` as a dev dependency (`npm install -D unist-util-visit`).

This is the minimal, non-invasive fix. It does not require editing any MDX content.

---

### P0-2 · Missing favicon

**File:** `public/` (empty — file not present)  
**Verified:** Built HTML contains `<link rel="shortcut icon" href="/gradient-lectures/favicon.svg">` but no such file exists in the repo or in `dist/`.

**Fix:** Create `public/favicon.svg`. Minimum viable SVG (can be refined later):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#4f46e5"/>
  <text x="16" y="22" text-anchor="middle" font-family="sans-serif"
        font-size="18" font-weight="700" fill="#ffffff">G</text>
</svg>
```

Alternatively, configure Starlight's `favicon` option to point to a `src/assets/` file for pipeline processing — but for a simple SVG favicon, `public/` is the correct location.

---

### P0-3 · Starlight sets `data-theme="dark"` on dark-OS devices, but CSS is light-only

**Verified in built HTML:** Every page opens with `<html data-theme="dark">` when the OS prefers dark. The `:root` token block is light-only (correct), but Starlight's own internal styles, Expressive Code (syntax highlighting), and Mermaid `autoTheme` all react to `data-theme`, making code blocks, mobile menu borders, and diagrams render in dark mode even though prose looks light.

**Root cause:** `ThemeProvider.astro` runs an inline script before paint that reads `localStorage` or `prefers-color-scheme`. The custom `Header.astro` omits the desktop `ThemeSelect`, but `MobileMenuFooter` (imported in `Sidebar.astro`) still renders the full `<starlight-theme-select>` element — users on mobile can flip to dark and get a broken UI.

**Complete fix — three files to create/modify:**

**① Create `src/components/ThemeProvider.astro`** (new file):
```astro
---
// Light-only site. Override Starlight's ThemeProvider to always force light mode,
// prevent OS-preference switching, and stub the picker API so nothing errors.
---
<script is:inline>
  document.documentElement.dataset.theme = 'light';
  window.StarlightThemeProvider = { updatePickers() {} };
</script>
```

**② Create `src/components/Empty.astro`** (new file):
```astro
---
// Intentionally empty — used to suppress Starlight UI slots (ThemeSelect).
---
```

**③ Register both overrides in `astro.config.mjs`:**
```javascript
components: {
  Sidebar:       './src/components/Sidebar.astro',
  PageSidebar:   './src/components/PageSidebar.astro',
  Header:        './src/components/Header.astro',
  Pagination:    './src/components/Pagination.astro',
  ThemeProvider: './src/components/ThemeProvider.astro',  // ADD
  ThemeSelect:   './src/components/Empty.astro',           // ADD
},
```

**④ Disable Mermaid autoTheme in `astro.config.mjs`:**
```javascript
mermaid({
  theme: 'neutral',
  autoTheme: false,   // was: true
}),
```

**⑤ Restrict Expressive Code to a single light theme in `astro.config.mjs`** (inside `starlight({})`):
```javascript
expressiveCode: {
  themes: ['starlight-light'],
  useStarlightDarkModeSwitch: false,
},
```

**⑥ Add `color-scheme: light` to `src/styles/custom.css`** in the `html {}` rule:
```css
html {
  color-scheme: light;   /* ADD — browser chrome (scrollbars, inputs) stays light */
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  /* ... rest unchanged */
}
```

---

## P1 — Correctness & behaviour

These are bugs or wrong-behaviour items that affect users on an otherwise-working site.

---

### P1-1 · Hardcoded base path in `Header.astro`

**File:** `src/components/Header.astro`, lines 22–23  
**Every other component uses `withBase()`.** This one does not:
```astro
<a href="/gradient-lectures/learning-tracks/">Learning Tracks</a>
<a href="/gradient-lectures/contribute/">Contribute</a>
```
If the repo name or GitHub Pages path ever changes, these links break silently while the rest of the site still works.

**Fix:**
```astro
---
import config from 'virtual:starlight/user-config';
import { withBase } from '../utils/withBase';
// ... rest of imports
---
<!-- ... -->
<a href={withBase('/learning-tracks/')}>Learning Tracks</a>
<a href={withBase('/contribute/')}>Contribute</a>
```

---

### P1-2 · `PageSidebar.astro` contains dark-theme color values

**File:** `src/components/PageSidebar.astro`, lines 62–63, 78, 92  
These are dark-sidebar leftovers that produce white text on a light background:
```css
/* line 62-63 — white text on hover */
.sidebar-toggle-arrow:hover {
  color: var(--sl-color-white);           /* ← wrong: white on light bg */
  background-color: var(--sl-color-gray-6); /* ← wrong: near-black bg */
}

/* line 78 — white section heading */
.right-sidebar-panel :global(h2) {
  color: var(--sl-color-white);  /* ← wrong */
}

/* line 92 — white link hover */
.right-sidebar-panel :global(:where(a):hover) {
  color: var(--sl-color-white);  /* ← wrong */
}
```

**Fix — replace dark remnants with light-safe tokens:**
```css
.sidebar-toggle-arrow:hover {
  color: var(--sl-color-text);
  background-color: var(--gl-surface-2);
}

.right-sidebar-panel :global(h2) {
  color: var(--sl-color-text);
  /* keep font-size, font-weight, line-height, margin-bottom */
}

.right-sidebar-panel :global(:where(a):hover) {
  color: var(--sl-color-text);
}
```

---

### P1-3 · `Sidebar.astro` — `MobileMenuFooter` still renders `ThemeSelect`

**File:** `src/components/Sidebar.astro`, line 44  
`<MobileMenuFooter />` hard-imports `ThemeSelect` from Starlight. Once `ThemeSelect` is overridden with `Empty.astro` (fix P0-3 ②③), this is resolved automatically — no further change needed here. Listed for awareness.

---

### P1-4 · Inline style on logo image in `index.mdx`

**File:** `src/content/docs/index.mdx`, line 18  
```astro
<img src={fullLogo.src} alt="Gradient Lectures" class="hero-title"
  style={{ maxWidth: '450px', width: '100%', marginBottom: '1.25rem' }} />
```
Two issues:
1. `class="hero-title"` is a typography class (defines `font-size`, `font-weight`) applied to an `<img>` — semantically wrong. The class exists in CSS as a heading style, not an image container style.
2. Inline styles bypass the design system.

**Fix — rename the class and move styles to CSS:**

In `index.mdx`:
```astro
<img src={fullLogo.src} alt="Gradient Lectures" class="home-logo" />
```

In `custom.css` (inside the `/* ── Hero / landing page ── */` section):
```css
.home-logo {
  max-width: 450px;
  width: 100%;
  margin-bottom: 1.25rem;
  /* no border-radius or border — logo should not get the prose img treatment */
  border: none !important;
  border-radius: 0 !important;
}
```

---

### P1-5 · Inline style on `<h3>` in `interpretational-bayesian-experimentation.mdx`

**File:** `src/content/docs/tracks/experimentation/bayesian-experimentation/interpretational-bayesian-experimentation.mdx`, line 11  
```html
<h3 style="margin: 0; font-size: 1.15rem; font-weight: 650; letter-spacing: -0.02em;">Notes coming soon</h3>
```
The class `.coming-soon__title` already exists in `custom.css` with identical values. This should use the class.

**Fix:**
```html
<h3 class="coming-soon__title">Notes coming soon</h3>
```

---

### P1-6 · Splash pages hide the Starlight title using per-file inline `<style>` blocks

**Files:** `index.mdx` line 12–14, `learning-tracks.mdx` lines 10–13, `contribute.mdx` lines 8–10  
Each splash page has:
```html
<style>{`
  #_top { display: none !important; }
`}</style>
```
This pattern causes Astro to inject a `<style>` tag with a scoped hash into every page that uses it, and it's duplicated across three files.

**Fix — move to `custom.css` targeting splash pages only:**
```css
/* Suppress Starlight's auto-generated page title on splash template pages */
html:not([data-has-sidebar]) h1#_top {
  display: none !important;
}
```
Then delete the three inline `<style>` blocks from all three MDX files.

---

### P1-7 · `logo-light.svg` and `logo-dark.svg` are unused dead assets

**Files:** `src/assets/logo-light.svg`, `src/assets/logo-dark.svg`  
Not referenced anywhere. Starlight's dual-logo config (`logo: { light, dark }`) is not used — the config uses `src: './src/assets/short_logo.png'`. These files will confuse contributors and add noise to the asset directory.

**Fix:** Delete both files.

---

### P1-8 · `LanguageSelect` and `SocialIcons` render empty shells in `Header.astro`

**File:** `src/components/Header.astro`, lines 4, 7, 31  
`LanguageSelect` renders a visible empty select element (no languages configured). `SocialIcons` renders an empty `<div>` (no social links configured). Both add DOM and CSS weight.

**Fix:** Remove both imports and their JSX from `Header.astro`:
```astro
<!-- Remove these two lines: -->
import LanguageSelect from '@astrojs/starlight/components/LanguageSelect.astro';
import SocialIcons from '@astrojs/starlight/components/SocialIcons.astro';

<!-- Remove from JSX: -->
<div class="sl-hidden md:sl-flex social-icons">
  <SocialIcons />
</div>
<LanguageSelect />
```
Also remove the now-unused `.social-icons::after` rule in `custom.css` (line 1567–1569) and the `Header.astro` component-scoped `.social-icons::after` rule (lines 86–90).

---

## P2 — Architecture & maintainability

These do not break the live site today but make the codebase fragile as it grows.

---

### P2-1 · Navigation structure is maintained in three separate places

**Files:**
- `astro.config.mjs` — `sidebar: [...]` (~60 lines, lines 37–96)
- `src/data/trackOverviews.ts` — full note list with descriptions (~200 lines)
- `src/data/tracks.ts` — top-level track cards (~50 lines)

Adding a new note requires three manual edits. Descriptions, hrefs, and order can silently drift between sources.

**Evidence of current drift:** `trackOverviews.ts` marks the Bayesian Experimentation section `comingSoon: true` at the track level, but the note stub `interpretational-bayesian-experimentation.mdx` already exists. The sidebar in `astro.config.mjs` lists it with a label.

**Proposed architecture:** Make `trackOverviews.ts` the single source of truth. Derive sidebar config and `tracks.ts` cards from it at build time.

**Approach:**

1. Extend `TrackOverviewConfig` in `trackOverviews.ts` to include the display fields currently in `tracks.ts` (`number`, `title`, `hours`, `tag`, `description`, `comingSoon`).

2. In `astro.config.mjs`, import `trackOverviews` and derive the `sidebar` array programmatically:
```javascript
import { trackOverviews } from './src/data/trackOverviews.ts';

function buildSidebar(overviews) {
  return Object.entries(overviews).map(([id, track]) => ({
    label: track.title,
    items: [
      { label: 'Track Overview', link: `/tracks/${id}/` },
      ...track.sections.flatMap((section) =>
        section.title
          ? [{ label: section.title, items: section.notes.map(noteToItem) }]
          : section.notes.map(noteToItem)
      ),
    ],
  }));
}

function noteToItem(note) {
  return { label: note.title, link: note.href };
}
```

3. Delete `src/data/tracks.ts`. Update `TrackCards.astro` and `TrackCard.astro` to read from `trackOverviews`.

4. Keep `isTrackOverviewPage.ts` but derive its slugs programmatically from `trackOverviews` keys.

---

### P2-2 · Progress-bar script injected as raw string in `astro.config.mjs`

**File:** `astro.config.mjs`, lines 99–132  
A 30-line JavaScript function is embedded as a template-literal string inside the config file. It:
- Gets no syntax highlighting or linting
- Cannot be type-checked
- Has no `{ passive: true }` on the scroll listener (minor perf issue)
- Uses `DOMContentLoaded` + DOM manipulation to create elements that could instead be static HTML

**Fix — move to a proper script file and reference it:**

Create `src/scripts/reading-progress.ts`:
```typescript
// Inject reading progress bar on note pages only.
if (document.documentElement.hasAttribute('data-has-sidebar')) {
  const container = document.createElement('div');
  container.className = 'reading-progress-container';
  const bar = document.createElement('div');
  bar.className = 'reading-progress-bar';
  container.appendChild(bar);
  document.body.appendChild(container);

  window.addEventListener('scroll', () => {
    const scrolled = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = height > 0 ? `${(scrolled / height) * 100}%` : '0%';
  }, { passive: true });
}
```

In `astro.config.mjs`, replace the `head` array entry:
```javascript
head: [
  { tag: 'script', attrs: { src: '/gradient-lectures/reading-progress.js', defer: true } }
]
```

Or, simpler — use Astro's `is:inline` on a script imported via a layout component. The cleanest solution given this codebase is to place the script in `Sidebar.astro` (which only renders on note pages with a sidebar), eliminating the `data-has-sidebar` guard entirely:

```astro
<!-- Bottom of Sidebar.astro, alongside the existing toggle script -->
<script>
  const container = document.createElement('div');
  container.className = 'reading-progress-container';
  const bar = document.createElement('div');
  bar.className = 'reading-progress-bar';
  container.appendChild(bar);
  document.body.appendChild(bar);  // append bar, not container ← fix typo in original
  document.body.appendChild(container);

  window.addEventListener('scroll', () => {
    const scrolled = document.documentElement.scrollTop;
    const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
  }, { passive: true });
</script>
```

Then remove the `head` entry from `astro.config.mjs` entirely.

---

### P2-3 · Sidebar toggle scripts are duplicated across two components

**Files:** `Sidebar.astro` lines 90–99, `PageSidebar.astro` lines 109–122  
Both components contain separate but near-identical `DOMContentLoaded` + `querySelectorAll` + `toggle` patterns for their respective sidebars. The default-collapsed logic for the right sidebar is also inline.

**Fix — consolidate into one `<script>` block in `Sidebar.astro`:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  // Left sidebar toggle
  document.querySelectorAll('.left-sidebar-toggle').forEach(btn =>
    btn.addEventListener('click', () =>
      document.body.classList.toggle('hide-left-sidebar')));

  // Right sidebar — collapsed by default on desktop
  if (window.matchMedia('(min-width: 72rem)').matches) {
    document.body.classList.add('hide-right-sidebar');
  }
  document.querySelectorAll('.right-sidebar-toggle').forEach(btn =>
    btn.addEventListener('click', () =>
      document.body.classList.toggle('hide-right-sidebar')));
});
```
Remove the `<script>` block from `PageSidebar.astro` entirely.

---

### P2-4 · `Callout.astro` duplicates all five SVG icon blocks

**File:** `src/components/Callout.astro`, lines 31–44 (collapsible branch) and 60–74 (static branch)  
The same five `{type === 'x' && <svg>…</svg>}` blocks appear twice. This is ~45 lines of duplicated markup. Any icon change must be made in two places.

**Fix — extract a computed icon map in the frontmatter:**
```typescript
const ICONS: Record<string, string> = {
  note:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 22 12 12 22 2 12Z" /></svg>',
  tip:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3 14.5 9.5 21 12 14.5 14.5 12 21 9.5 14.5 3 12 9.5 9.5Z" /></svg>',
  info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 8h.01" /></svg>',
  example: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7Z" /></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 22 21H2Z" /><rect x="11" y="10" width="2" height="5" rx="0.5" fill="var(--sl-color-bg)" /><circle cx="12" cy="17.5" r="1.1" fill="var(--sl-color-bg)" /></svg>',
};
const iconHtml = ICONS[type] ?? ICONS.note;
```
Then in both branches:
```astro
<span class="callout-icon" aria-hidden="true" set:html={iconHtml} />
```

---

### P2-5 · Sidebar toggle button `<button>` elements lack `aria-expanded` and `aria-controls`

**Files:** `Sidebar.astro` line 29, `PageSidebar.astro` line 15  
Both collapse-toggle buttons have only a `title` attribute and no ARIA state. Screen readers cannot determine whether the sidebar is expanded or collapsed, or which element is controlled.

**Fix:**
```astro
<!-- Sidebar.astro -->
<button
  class="sidebar-toggle-arrow left-sidebar-toggle"
  aria-label="Toggle navigation sidebar"
  aria-expanded="true"
  aria-controls="left-sidebar-content"
>
```
```javascript
// In the toggle script, update aria-expanded:
btn.addEventListener('click', () => {
  const expanded = document.body.classList.toggle('hide-left-sidebar');
  // hide-left-sidebar present = collapsed → expanded=false
  btn.setAttribute('aria-expanded', String(!document.body.classList.contains('hide-left-sidebar')));
});
```

---

### P2-6 · `Sidebar.astro` uses `any` type for sidebar entries

**File:** `src/components/Sidebar.astro`, line 9  
```typescript
function hasCurrent(entry: any) {
```
Starlight exports typed sidebar entry types. Using `any` means changes to Starlight's internal entry shape will silently produce wrong behaviour rather than a type error.

**Fix:**
```typescript
import type { SidebarEntry } from '@astrojs/starlight/utils/navigation';

function hasCurrent(entry: SidebarEntry): boolean {
  if ('isCurrent' in entry && entry.isCurrent) return true;
  if ('entries' in entry) return entry.entries.some(hasCurrent);
  return false;
}
```
(Verify the exact import path against the installed Starlight version; the principle holds regardless.)

---

### P2-7 · `temporary/` directory is not gitignored

**File:** `.gitignore`  
The repo root contains a `temporary/` directory with Obsidian source notes, attachments, and PNG images. It is not listed in `.gitignore`. Only `source_notes/` is excluded.

**Fix:** Add to `.gitignore`:
```
temporary/
```

---

### P2-8 · No `tsconfig.json`, no type-checking in CI

There is no `tsconfig.json` in the repo. TypeScript in Astro components and `.ts` data files is only processed at build time by Astro's bundler, not checked independently. The CI workflow has no `astro check` step.

**Fix ①** — Add `tsconfig.json` at repo root:
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@assets/*": ["src/assets/*"] }
  },
  "include": ["src", "scripts"]
}
```

**Fix ②** — Add `"check": "astro check"` to `package.json` scripts.

**Fix ③** — Add a PR CI job in `.github/workflows/`:
```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm run check
```

---

### P2-9 · `package.json` missing `engines` field and utility scripts

**File:** `package.json`  
- No `engines` field — CI uses Node 20 but local dev can drift silently.
- Utility scripts `cleanup-unused-images.mjs`, `find-used-images.mjs`, `remove-pagination-links.mjs` exist under `scripts/` but are not exposed in `package.json`.

**Fix:**
```json
{
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "astro": "astro",
    "format-math": "node scripts/format-math.mjs",
    "find-images": "node scripts/find-used-images.mjs",
    "clean-images": "node scripts/cleanup-unused-images.mjs"
  }
}
```

---

## P3 — CSS & design-system hygiene

---

### P3-1 · Redundant token aliases (`--gl-*` duplicates `--sl-*`)

**File:** `src/styles/custom.css`, lines 44–50

The design system defines two parallel token sets for the same values:

| `--gl-*` token | Identical `--sl-*` token |
|----------------|--------------------------|
| `--gl-muted: #71717a` | `--sl-color-gray-4: #71717a` |
| `--gl-border: #e4e4e7` | `--sl-color-hairline: #e4e4e7` |
| `--gl-surface: #fafafa` | `--sl-color-bg-sidebar: #fafafa` |
| `--gl-surface-2: #f4f4f5` | `--sl-color-gray-1: #f4f4f5` |
| `--gl-accent: #4f46e5` | `--sl-color-accent: #4f46e5` |
| `--gl-accent-bg: #eef2ff` | `--sl-color-accent-low: #eef2ff` |

This doubles the number of tokens to keep in sync. The `--gl-*` prefix has a useful purpose for **custom** semantic values (chart colors, spacing), but not for straight aliases.

**Fix:** Delete the six alias lines from `:root`. Do a codebase-wide replacement:

| Replace | With |
|---------|------|
| `var(--gl-muted)` | `var(--sl-color-gray-4)` |
| `var(--gl-border)` | `var(--sl-color-hairline)` |
| `var(--gl-surface)` | `var(--sl-color-bg-sidebar)` |
| `var(--gl-surface-2)` | `var(--sl-color-gray-1)` |
| `var(--gl-accent)` | `var(--sl-color-accent)` |
| `var(--gl-accent-bg)` | `var(--sl-color-accent-low)` |

Keep `--gl-chart-*` and `--gl-space-*` — these are genuinely custom.  
Keep `--gl-muted` if the distinction between "muted text" and "gray-4" is intended as a stable semantic alias; simply remove the duplicate `:root` definition (since `--sl-color-gray-4` is already defined to `#71717a`, you can just use that directly wherever `--gl-muted` appears, or keep the alias explicitly noting it maps to gray-4).

---

### P3-2 · Empty dark-mode token section is misleading

**File:** `src/styles/custom.css`, lines 77–78  
```css
/* ── Dark mode tokens ────────────────────────────────────── */

```
Two blank lines. An empty section with a heading implies dark tokens should exist or will be added. After implementing P0-3 (forced light theme), this section is permanently meaningless.

**Fix:** Replace with a clear statement of intent:
```css
/* ── Dark mode: not supported — this site is light-only ────── */
/* ThemeProvider.astro forces data-theme="light". No dark tokens needed. */
```

---

### P3-3 · Two `interactive-chart` responsive rules exist for a feature that does not exist

**File:** `src/styles/custom.css`, lines 808–996, and responsive rules at lines 1650–1662  
The `.interactive-chart`, `.chart-control`, `.chart-btn`, `.chart-stat` block is ~190 lines of CSS for components that do not exist anywhere in the codebase. No MDX file, no Astro component uses `.interactive-chart`. The README still mentions "D3.js" and "Power Calculator" as if they exist.

**Fix ①** — Delete lines 808–996 (`/* ── Interactive chart containers ── */` through `.chart-btn:focus-visible`) from `custom.css`.  
**Fix ②** — Delete the two `@media (max-width: 800px)` and `@media (max-width: 480px)` responsive rules for `.interactive-chart__controls` (lines 1650–1662).  
**Fix ③** — Update `README.md`: remove "D3.js" from the dependency description, remove "Power Calculator" from the component list.

---

### P3-4 · `.math-result` uses hard-coded hex color instead of token

**File:** `src/styles/custom.css`, line 407  
```css
.sl-markdown-content .math-result {
  background: var(--sl-color-gray-6);
  color: #f4f4f5;   /* ← raw hex, should be var(--sl-color-gray-1) */
```
`#f4f4f5` is identical to `--sl-color-gray-1`.

**Fix:**
```css
color: var(--sl-color-gray-1);
```

---

### P3-5 · `.interactive-chart:hover` has a duplicate `border-color` declaration

**File:** `src/styles/custom.css`, lines 819–820  
(Will be deleted by P3-3, but noted for completeness.)
```css
.interactive-chart:hover {
  border-color: var(--sl-color-accent);
  border-color: rgba(99,102,241,0.35);  /* second declaration overrides first */
}
```

---

### P3-6 · `/* ── Dark mode tokens ── */` section comment is in wrong position

Already covered by P3-2. The blank section between the token block and the global typography block (lines 77–79) also creates an orphaned comment that makes the file structure look incomplete to any reader or automated parser.

---

### P3-7 · Inline `<style>` blocks in MDX use scoped Astro hashing unnecessarily

**Files:** `index.mdx`, `learning-tracks.mdx`, `contribute.mdx`  
Already covered by P1-6. The `<style>` in MDX does not get Astro's component-scoped hash — it injects a global `<style>` tag inline in the HTML body — which is valid but unconventional and duplicated across three files. Moving to `custom.css` (fix P1-6) is the right approach.

---

### P3-8 · `custom.css` has two separate `@media (min-width: 72rem)` blocks for the sidebar

**File:** `src/styles/custom.css`, lines 1494–1506 and 1508–1521  
Both blocks are for sidebar and main-pane layout at the same breakpoint. They can be merged:
```css
@media (min-width: 72rem) {
  .right-sidebar-container,
  .right-sidebar {
    width: var(--sl-sidebar-width) !important;
  }
  .right-sidebar {
    background-color: var(--sl-color-bg-sidebar) !important;
    border-inline-start: 1px solid var(--sl-color-hairline) !important;
    right: 0 !important;
    left: auto !important;
    flex-shrink: 0;
  }
  [data-has-sidebar] .main-pane {
    --sl-content-margin-inline: auto;
    flex: 1 1 0;
    width: auto !important;
    min-width: 0;
  }
  [data-has-sidebar] .main-pane .content-panel .sl-container {
    margin-inline: auto !important;
    max-width: var(--sl-content-width);
  }
}
```

---

### P3-9 · `astro.config.mjs` has a misindented `lastUpdated: false`

**File:** `astro.config.mjs`, line 97  
```javascript
      ],
            lastUpdated: false,   // ← 12-space indent, rest of block uses 6
      pagination: true,
```
This is cosmetic but signals the line was manually inserted without re-formatting.

**Fix:** Align to 6 spaces matching the surrounding `starlight({})` options.

---

## P4 — Minor quality improvements

These are low-urgency polish items.

---

### P4-1 · `TrackOverview.astro` — `coming-soon` text is hardcoded for Bayesian Experimentation only

**File:** `src/components/TrackOverview.astro`, lines 47–49  
The "coming soon" body text is hardcoded:
> "We're building out this track — Bayesian A/B testing, posterior inference, decision policies, and adaptive bandit designs."

This will be wrong when other tracks become `comingSoon: true`.

**Fix:** Add a `comingSoonDescription` field to `TrackOverviewConfig` in `trackOverviews.ts`, used in the component instead of the hardcoded string.

---

### P4-2 · `withBase` double-slash guard is slightly fragile

**File:** `src/utils/withBase.ts`  
```typescript
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
return `${baseWithSlash}${normalizedPath}`;
```
This is correct but can be simplified to a one-liner that is easier to read and impossible to misread:
```typescript
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
```

---

### P4-3 · `isTrackOverviewPage.ts` — slugs are hardcoded strings, not derived

**File:** `src/utils/isTrackOverviewPage.ts`  
The Set of slugs mirrors the `trackOverviews` keys. After P2-1, this can be derived:
```typescript
import { trackOverviews } from '../data/trackOverviews';
const TRACK_OVERVIEW_SLUGS = new Set(
  Object.keys(trackOverviews).map(id => `tracks/${id}`)
);
export const isTrackOverviewPage = (slug: string) => TRACK_OVERVIEW_SLUGS.has(slug);
```

---

### P4-4 · `getTrackByVariant` in `tracks.ts` is never called

**File:** `src/data/tracks.ts`, lines 47–49  
After P2-1 (consolidate data sources), `tracks.ts` is deleted entirely. Even before that, `getTrackByVariant` is not called anywhere in the codebase — confirmed by grep. It can be removed now.

---

### P4-5 · `Sidebar.astro` has an empty `/* No rotation needed */` comment block

**File:** `src/components/Sidebar.astro`, lines 83–87  
```css
:global(body.hide-left-sidebar) .left-sidebar-toggle svg {
  /* No rotation needed for the sidebar icon */
}
```
Empty rule with a comment. Delete it.

Same empty rule exists in `PageSidebar.astro` lines 66–68. Delete that too.

---

### P4-6 · `README.md` references D3.js and the Power Calculator

**File:** `README.md`, lines 32 and 62  
> "It tells npm exactly which libraries (like Astro, Starlight, **D3.js**, and KaTeX)"  
> "Custom interactive elements (like the **Power Calculator**) are built here using .astro files and **JavaScript (D3.js)**."

D3 is not a dependency. The Power Calculator does not exist. This misleads contributors.

**Fix:** Replace the D3/chart references with accurate language:
> "It tells npm exactly which libraries (like Astro, Starlight, KaTeX, and Mermaid)"  
> "Custom UI components are built here as `.astro` files. Currently: `Callout`, `TrackCard`, `TrackOverview`, `Pagination`, and sidebar layout components."

---

### P4-7 · `public/` has no `.gitkeep` — folder intention is ambiguous

**Fix:** Add `public/.gitkeep` so the directory is tracked and its policy is visible. Add a comment to `README.md` noting `public/` is intentionally empty except for root-level static files like `favicon.svg`.

---

## What is working well (do not change)

- **`withBase()`** — correctly centralises base-path prefixing; used consistently in all component `href`s.
- **`content.config.ts`** — `docsSchema()` with glob loader is idiomatic Starlight.
- **`TrackCard.astro` / `TrackCards.astro`** — dynamic tag (`a` vs `div`) for `comingSoon`, clean component boundaries.
- **`Pagination.astro`** — clean separation of `isTrackOverviewPage` logic; uses i18n keys.
- **Vertical rhythm tokens (`--gl-space-*`)** — single source of truth for prose spacing; well-documented.
- **Callout props API** — typed, composable, correct `not-content` class.
- **GitHub Pages CI** — `npm ci`, Node 20, cancel-in-progress, correct permissions, telemetry disabled.
- **Math pipeline** — `remark-math` + `rehype-katex` + `format-math.mjs` is the correct chain.
- **Image pipeline** — all images in `src/assets/images/`, processed by Astro/Sharp to `_astro/*.webp`. `public/` empty. No duplication.
- **Mermaid** — `astro-mermaid` with build-time SVG transformation; CSS correctly hides raw source pre-render.

---

## Execution order for coding agent

```
Phase 1 — Production correctness (must ship before site is publicly shared)
  P0-1  rehype-base-links plugin + unist-util-visit
  P0-2  public/favicon.svg
  P0-3  ThemeProvider.astro + Empty.astro + astro.config.mjs (autoTheme, expressiveCode)
         + color-scheme: light in custom.css
  P1-1  Header.astro withBase()
  P1-2  PageSidebar.astro dark color remnants
  P1-4  index.mdx class + inline style
  P1-5  interpretational-bayesian-experimentation.mdx inline style
  P1-6  Splash pages inline <style> → custom.css rule
  P1-7  Delete logo-dark.svg + logo-light.svg
  P1-8  Header.astro remove LanguageSelect + SocialIcons

Phase 2 — CSS housekeeping
  P3-2  Empty dark-mode comment → policy comment
  P3-3  Delete interactive-chart CSS + responsive rules + README D3 refs
  P3-4  .math-result color token
  P3-8  Merge duplicate @media (min-width: 72rem) sidebar blocks
  P3-1  Consolidate --gl-* alias tokens (do last, requires search-replace)
  P3-9  astro.config.mjs lastUpdated indentation

Phase 3 — Architecture
  P2-7  .gitignore temporary/
  P2-9  package.json engines + scripts
  P2-2  Move progress-bar script to Sidebar.astro
  P2-3  Consolidate sidebar toggle scripts
  P2-4  Callout.astro icon deduplication
  P2-5  Sidebar toggle aria-expanded
  P2-6  Sidebar.astro any → typed SidebarEntry
  P2-8  tsconfig.json + astro check + PR CI workflow
  P2-1  Single-source navigation (largest change, do last)

Phase 4 — Polish
  P4-1  TrackOverview comingSoon description
  P4-2  withBase simplification
  P4-3  isTrackOverviewPage derived from trackOverviews
  P4-4  Remove unused getTrackByVariant
  P4-5  Remove empty CSS rule blocks in sidebars
  P4-6  README accuracy (D3 / Power Calculator)
  P4-7  public/.gitkeep + README policy note
```

---

*This document was produced from a full direct read of every source file. No changes were made to the codebase as part of this analysis.*
