const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.mdx')) {
      let content = fs.readFileSync(p, 'utf8');
      
      // Find all $$...$$ blocks
      // We want to ensure they are surrounded by blank lines,
      // and that the content inside starts and ends with a newline.
      
      // First, temporarily replace all $$...$$ with a placeholder
      // to avoid messing up inline math $...$
      let blocks = [];
      let tempContent = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, p1) => {
        blocks.push(p1.trim());
        return `___MATH_BLOCK_${blocks.length - 1}___`;
      });
      
      // Now put them back with proper newlines
      let newContent = tempContent.replace(/___MATH_BLOCK_(\d+)___/g, (match, p1) => {
        return `\n\n$$\n${blocks[p1]}\n$$\n\n`;
      });
      
      // Clean up excessive newlines
      newContent = newContent.replace(/\n{3,}/g, '\n\n');
      
      if (content !== newContent) {
        fs.writeFileSync(p, newContent);
        console.log('Fixed', p);
      }
    }
  }
}

walk('src/content/docs');
