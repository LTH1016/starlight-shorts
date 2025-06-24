const mongoose = require('mongoose');

// 连接MongoDB
mongoose.connect('mongodb://localhost:27017/drama-platform');

// 短剧模型
const dramaSchema = new mongoose.Schema({}, { strict: false });
const Drama = mongoose.model('Drama', dramaSchema);

async function testSingleDrama() {
  try {
    console.log('临时更新一个短剧的poster为测试SVG...');
    
    // 找到第一个热门短剧
    const drama = await Drama.findOne({ isHot: true });
    if (drama) {
      console.log(`找到短剧: ${drama.title}`);
      console.log(`当前poster: ${drama.poster}`);
      
      // 临时更新为测试SVG
      await Drama.findByIdAndUpdate(drama._id, {
        poster: '/drama-covers/test.svg'
      });
      
      console.log('已更新为测试SVG: /drama-covers/test.svg');
      console.log('请刷新页面查看效果');
    } else {
      console.log('没有找到热门短剧');
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

testSingleDrama();
