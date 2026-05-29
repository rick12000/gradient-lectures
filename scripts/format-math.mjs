/**
 * Ensures display math blocks ($$...$$) have blank lines before and after,
 * so remark-math renders them as centered block equations.
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

function formatMath(content) {
  const lines = content.split('\n');
  const out = [];
  let inFrontmatter = false;
  let frontmatterDone = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!frontmatterDone) {
      if (trimmed === '---') {
        if (!inFrontmatter) {
          inFrontmatter = true;
        } else {
          inFrontmatter = false;
          frontmatterDone = true;
        }
      }
      out.push(line);
      continue;
    }

    const isDisplayMath =
      trimmed.startsWith('$$') &&
      trimmed.endsWith('$$') &&
      trimmed.length > 4;

    if (isDisplayMath) {
      const prev = out[out.length - 1];
      if (prev !== undefined && prev.trim() !== '') {
        out.push('');
      }
      out.push(line);
      const next = lines[i + 1];
      if (next !== undefined && next.trim() !== '') {
        out.push('');
      }
      continue;
    }

    out.push(line);
  }

  return out.join('\n');
}

let changed = 0;
for (const file of walkMdx(docsDir)) {
  const original = fs.readFileSync(file, 'utf8');
  const formatted = formatMath(original);
  if (formatted !== original) {
    fs.writeFileSync(file, formatted, 'utf8');
    changed++;
    console.log('Updated:', path.relative(process.cwd(), file));
  }
}

console.log(`Done. ${changed} file(s) updated.`);
