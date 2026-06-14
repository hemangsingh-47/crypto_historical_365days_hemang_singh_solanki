const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, 'frontend', 'src');

function traverseAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseAndReplace(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/--font-family-display/g, '--font-display');
      content = content.replace(/--font-family-body/g, '--font-body');
      content = content.replace(/--font-family-code/g, '--font-code');
      content = content.replace(/--font-weight-bold/g, '800');
      content = content.replace(/--font-weight-semibold/g, '600');
      content = content.replace(/--font-weight-medium/g, '500');
      content = content.replace(/--font-size-2xl/g, 'var(--text-section)');
      content = content.replace(/--font-size-md/g, 'var(--text-body)');
      fs.writeFileSync(fullPath, content);
    }
  }
}

traverseAndReplace(cssDir);
console.log('Variables replaced');
