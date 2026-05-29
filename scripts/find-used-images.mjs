import fs from 'fs';
import path from 'path';

const root = process.cwd();
const exts = new Set(['.mdx', '.md', '.astro', '.tsx', '.ts', '.jsx', '.js', '.css', '.html', '.mjs']);

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.astro', '.git', 'scripts'].includes(ent.name)) continue;
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
  while ((m = pattern.exec(text))) {
    refs.add(path.basename(m[1]));
  }
  // src/assets direct imports
  const importRe = /from ['"].*?assets\/([^'"]+\.(?:png|jpg|jpeg|gif|svg|webp))['"]/gi;
  while ((m = importRe.exec(text))) {
    refs.add(path.basename(m[1]));
  }
}

const srcAssets = path.join(root, 'src', 'assets');
if (fs.existsSync(srcAssets)) {
  for (const f of fs.readdirSync(srcAssets)) {
    if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(f)) refs.add(f);
  }
}

console.log(JSON.stringify([...refs].sort(), null, 2));
