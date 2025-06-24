const fs = require('fs');
const path = require('path');

// SVG封面数据
const covers = [
  {
    id: 1,
    title: "Boss's Substitute Bride",
    category: "Romance",
    rating: "8.5",
    gradient: ["#FF6B6B", "#FF8E8E"],
    bgId: "bg1"
  },
  {
    id: 2,
    title: "Phoenix Rebirth",
    category: "Historical",
    rating: "9.2",
    gradient: ["#4ECDC4", "#44A08D"],
    bgId: "bg2"
  },
  {
    id: 3,
    title: "Sweet Little Wife",
    category: "Romance",
    rating: "8.8",
    gradient: ["#A8E6CF", "#7FCDCD"],
    bgId: "bg3"
  },
  {
    id: 4,
    title: "CEO Love Story",
    category: "Modern",
    rating: "8.3",
    gradient: ["#FFB6C1", "#FFA0AC"],
    bgId: "bg4"
  },
  {
    id: 5,
    title: "Mystery Case",
    category: "Suspense",
    rating: "8.9",
    gradient: ["#6C5CE7", "#A29BFE"],
    bgId: "bg5"
  },
  {
    id: 6,
    title: "Sweet Heart",
    category: "Romance",
    rating: "8.7",
    gradient: ["#FD79A8", "#E84393"],
    bgId: "bg6"
  },
  {
    id: 7,
    title: "Time Travel",
    category: "Fantasy",
    rating: "9.0",
    gradient: ["#00B894", "#00A085"],
    bgId: "bg7"
  },
  {
    id: 8,
    title: "Palace Secrets",
    category: "Historical",
    rating: "8.6",
    gradient: ["#FDCB6E", "#E17055"],
    bgId: "bg8"
  }
];

// 创建SVG内容
function createSVG(cover) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="400" viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${cover.bgId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${cover.gradient[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${cover.gradient[1]};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景 -->
  <rect width="300" height="400" fill="url(#${cover.bgId})"/>
  
  <!-- 播放按钮背景 -->
  <circle cx="150" cy="160" r="50" fill="rgba(255,255,255,0.3)"/>
  
  <!-- 播放按钮 -->
  <polygon points="130,140 130,180 170,160" fill="white"/>
  
  <!-- 标题 -->
  <text x="150" y="250" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">${cover.title}</text>
  
  <!-- 分类 -->
  <text x="150" y="280" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="14">${cover.category}</text>
  
  <!-- 评分 -->
  <text x="150" y="320" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Arial, sans-serif" font-size="12">★★★★☆ ${cover.rating}</text>
</svg>`;
}

// 确保目录存在
const outputDir = path.join(__dirname, 'drama-platform-frontend', 'public', 'drama-covers');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 生成所有SVG文件
covers.forEach(cover => {
  const svgContent = createSVG(cover);
  const filename = `drama${cover.id}.svg`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, svgContent, 'utf8');
  console.log(`Created: ${filename}`);
});

console.log('All SVG covers created successfully!');
