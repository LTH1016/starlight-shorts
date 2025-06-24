const fs = require('fs');
const path = require('path');

// 递归获取所有TypeScript文件
function getAllTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules' && item !== 'dist') {
      getAllTsFiles(fullPath, files);
    } else if (item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 修复导入路径
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 替换 @/ 路径别名
  const replacements = [
    { from: "from '@/config/", to: "from '../config/" },
    { from: "from '@/utils/", to: "from '../utils/" },
    { from: "from '@/middleware/", to: "from '../middleware/" },
    { from: "from '@/models/", to: "from '../models/" },
    { from: "from '@/services/", to: "from '../services/" },
    { from: "from '@/controllers/", to: "from '../controllers/" },
    { from: "from '@/routes/", to: "from '../routes/" },
    { from: "from '@/types/", to: "from '../types/" },
    { from: "from '@/scripts/", to: "from '../scripts/" }
  ];
  
  for (const replacement of replacements) {
    if (content.includes(replacement.from)) {
      content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
      modified = true;
    }
  }
  
  // 根据文件位置调整相对路径
  const relativePath = path.relative('src', path.dirname(filePath));
  const depth = relativePath === '' ? 0 : relativePath.split(path.sep).length;
  
  if (depth > 0) {
    const prefix = '../'.repeat(depth);
    content = content.replace(/from '\.\.\/([^']+)'/g, `from '${prefix}$1'`);
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
  }
}

// 执行修复
const srcDir = path.join(__dirname, 'src');
const tsFiles = getAllTsFiles(srcDir);

console.log(`Found ${tsFiles.length} TypeScript files`);

for (const file of tsFiles) {
  fixImports(file);
}

console.log('Import fixing completed!');
