const mongoose = require('mongoose');

// 连接MongoDB
mongoose.connect('mongodb://localhost:27017/drama-platform');

// 短剧模型
const dramaSchema = new mongoose.Schema({}, { strict: false });
const Drama = mongoose.model('Drama', dramaSchema);

async function checkDatabase() {
  try {
    console.log('检查数据库中的热门短剧...');
    
    const hotDramas = await Drama.find({ isHot: true }).sort({ viewCount: -1 });
    console.log(`找到 ${hotDramas.length} 个热门短剧:\n`);
    
    hotDramas.forEach((drama, index) => {
      console.log(`${index + 1}. ${drama.title}`);
      console.log(`   ID: ${drama._id}`);
      console.log(`   Poster: ${drama.poster}`);
      console.log(`   ViewCount: ${drama.viewCount}`);
      console.log(`   IsHot: ${drama.isHot}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkDatabase();
