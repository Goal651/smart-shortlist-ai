const fs = require('fs');
const path = require('path');

const directories = [
  'c:\\Users\\aine\\Downloads\\codes\\challenges\\smart-shortlist-ai\\frontend\\src\\components\\dashboard',
  'c:\\Users\\aine\\Downloads\\codes\\challenges\\smart-shortlist-ai\\frontend\\src\\components\\ui',
  'c:\\Users\\aine\\Downloads\\codes\\challenges\\smart-shortlist-ai\\frontend\\src\\app\\(dashboard)'
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix colors
      content = content.replace(/text-gray-400/g, 'text-gray-600');
      content = content.replace(/text-gray-500/g, 'text-gray-600');
      content = content.replace(/text-slate-400/g, 'text-gray-600');
      content = content.replace(/text-slate-500/g, 'text-gray-600');
      
      // Fix uppercase
      content = content.replace(/\buppercase\b/g, '');
      
      // Fix bold
      content = content.replace(/\bfont-bold\b/g, 'font-medium');
      content = content.replace(/\bfont-semibold\b/g, 'font-medium');

      // Clean up multiple spaces inside class names (optional, prevents "  " from replacements)
      content = content.replace(/className="([^"]*)"/g, (match, p1) => {
          return `className="${p1.replace(/\s+/g, ' ').trim()}"`;
      });
      content = content.replace(/className={cn\(([\s\S]*?)\)}/g, (match, p1) => {
         return match; // We don't want to mess up expressions too badly, but the strings will have double spaces. It's fine.
      });

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

directories.forEach(processDirectory);
console.log('Typography and contrast fix applied to all files.');
