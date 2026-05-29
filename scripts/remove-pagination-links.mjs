/**
 * Removes manual prev/next navigation links from MDX notes.
 * Starlight pagination handles this via astro.config.mjs.
 */
import fs from 'fs';
import path from 'path';

const docsDir = path.join(process.cwd(), 'src', 'content', 'docs');

function walkMdx(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMdx(p, files);
    else if (ent.name.endsWith('.mdx')) files.push(p);
  }
  return files;
}

const linkPattern = /^\[←[^\n]+\]\([^\)]+\)(\s*\|\s*\[[^\n]+\]\([^\)]+\))?\s*$/;

let changed = 0;
for (const file of walkMdx(docsDir)) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const filtered = [];
  let fileChanged = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (linkPattern.test(line.trim())) {
      fileChanged = true;
      // Also remove trailing --- separator if it's the line before
      if (
        filtered.length > 0 &&
        filtered[filtered.length - 1].trim() === '---' &&
        (i + 1 >= lines.length || lines[i + 1].trim() === '')
      ) {
        filtered.pop();
      }
      continue;
    }
    filtered.push(line);
  }

  // Trim trailing blank lines from removed nav
  while (filtered.length > 0 && filtered[filtered.length - 1].trim() === '') {
    filtered.pop();
  }
  filtered.push('');

  if (fileChanged) {
    fs.writeFileSync(file, filtered.join('\n'), 'utf8');
    changed++;
    console.log('Updated:', path.relative(process.cwd(), file));
  }
}

console.log(`Done. ${changed} file(s) updated.`);
