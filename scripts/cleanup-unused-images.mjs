/**
 * Deletes unused images from src/assets/images.
 * Keeps only files referenced in MDX, components, or other src assets.
 */
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const exts = new Set(['.mdx', '.md', '.astro', '.tsx', '.ts', '.jsx', '.js', '.css', '.html', '.mjs']);

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.astro', '.git', 'scripts', 'temporary'].includes(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (exts.has(path.extname(ent.name))) files.push(p);
  }
  return files;
}

const refs = new Set();
const pattern = /(?:assets\/images\/|\/assets\/images\/)([^\s"')\`]+)/g;

for (const file of walk(root)) {
  const text = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = pattern.exec(text))) refs.add(path.basename(m[1]));
  const importRe = /from ['"].*?assets\/([^'"]+\.(?:png|jpg|jpeg|gif|svg|webp))['"]/gi;
  while ((m = importRe.exec(text))) refs.add(path.basename(m[1]));
}

const srcAssetsRoot = path.join(root, 'src', 'assets');
if (fs.existsSync(srcAssetsRoot)) {
  for (const f of fs.readdirSync(srcAssetsRoot)) {
    if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(f)) refs.add(f);
  }
}

const imagesDir = path.join(root, 'src', 'assets', 'images');
if (!fs.existsSync(imagesDir)) {
  console.log('No src/assets/images folder found.');
  process.exit(0);
}

let deleted = 0;
for (const file of fs.readdirSync(imagesDir)) {
  if (!refs.has(file)) {
    fs.unlinkSync(path.join(imagesDir, file));
    deleted++;
  }
}

const remaining = fs.readdirSync(imagesDir);
console.log(`Deleted ${deleted} unused image(s). ${remaining.length} kept in src/assets/images.`);
