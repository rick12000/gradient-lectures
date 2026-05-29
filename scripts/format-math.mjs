/**
 * Ensures display math blocks render centered by converting single-line $$...$$
 * to multiline blocks (remark-math only treats multiline $$ as display math).
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

function isOpeningDisplayMath(line) {
  const t = line.trim();
  return t === '$$' || (t.startsWith('$$') && t.endsWith('$$') && t.length > 4);
}

function isClosingDisplayMath(line) {
  return line.trim() === '$$';
}

function isCompleteSingleLineMath(line) {
  const t = line.trim();
  return t.startsWith('$$') && t.endsWith('$$') && t.length > 4;
}

function toMultilineDisplayMath(line) {
  const content = line.trim().slice(2, -2).trim();
  return ['$$', content, '$$'];
}

function formatMath(content) {
  const lines = content.split('\n');
  const out = [];
  let inFrontmatter = false;
  let frontmatterDone = false;
  let inMathBlock = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    if (!frontmatterDone) {
      if (trimmed === '---') {
        if (!inFrontmatter) inFrontmatter = true;
        else {
          inFrontmatter = false;
          frontmatterDone = true;
        }
      }
      out.push(line);
      continue;
    }

    if (trimmed.startsWith('$$')) {
      line = trimmed;
    }

    const singleLine = isCompleteSingleLineMath(line);

    if (singleLine) {
      if (out.length > 0 && out[out.length - 1].trim() !== '') out.push('');
      out.push(...toMultilineDisplayMath(line));
      if (i + 1 < lines.length && lines[i + 1].trim() !== '') out.push('');
      continue;
    }

    const opening = isOpeningDisplayMath(line);
    const closing = inMathBlock && isClosingDisplayMath(line);

    if (opening && !inMathBlock) {
      if (out.length > 0 && out[out.length - 1].trim() !== '') out.push('');
      out.push(line);
      inMathBlock = true;
      continue;
    }

    if (closing) {
      out.push(line);
      inMathBlock = false;
      if (i + 1 < lines.length && lines[i + 1].trim() !== '') out.push('');
      continue;
    }

    if (inMathBlock) {
      out.push(line.trim());
      continue;
    }

    out.push(line);
  }

  return out.join('\n');
}

function collapseExcessiveBlankLines(content) {
  const lines = content.split('\n');
  let inFrontmatter = false;
  let frontmatterDone = false;
  const out = [];
  let blankRun = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!frontmatterDone) {
      out.push(line);
      if (trimmed === '---') {
        if (!inFrontmatter) inFrontmatter = true;
        else frontmatterDone = true;
      }
      continue;
    }

    if (trimmed === '') {
      blankRun++;
      if (blankRun <= 1) out.push('');
      continue;
    }

    blankRun = 0;
    out.push(line);
  }

  return out.join('\n');
}

let changed = 0;
for (const file of walkMdx(docsDir)) {
  const original = fs.readFileSync(file, 'utf8');
  const formatted = collapseExcessiveBlankLines(formatMath(original));
  if (formatted !== original) {
    fs.writeFileSync(file, formatted, 'utf8');
    changed++;
    console.log('Updated:', path.relative(process.cwd(), file));
  }
}

console.log(`Done. ${changed} file(s) updated.`);
