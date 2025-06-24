import dotenv from 'dotenv';
import { database } from '../config/database';
import { Drama } from '../models/Drama';
import { Category } from '../models/Category';
import { User } from '../models/User';
import { UserRole, UserStatus } from '../types/user';
import { logger } from '../utils/logger';

// 加载环境变量
dotenv.config();

// 分类数据
const categories = [
  {
    name: '都市言情',
    color: '#FF6B9D',
    description: '现代都市背景的爱情故事',
    sortOrder: 1,
    isActive: true
  },
  {
    name: '古装言情',
    color: '#4ECDC4',
    description: '古代背景的爱情故事',
    sortOrder: 2,
    isActive: true
  },
  {
    name: '霸道总裁',
    color: '#45B7D1',
    description: '霸道总裁类型的爱情故事',
    sortOrder: 3,
    isActive: true
  },
  {
    name: '甜宠',
    color: '#96CEB4',
    description: '甜蜜宠爱类型的故事',
    sortOrder: 4,
    isActive: true
  },
  {
    name: '悬疑',
    color: '#FFEAA7',
    description: '悬疑推理类型的故事',
    sortOrder: 5,
    isActive: true
  },
  {
    name: '校园',
    color: '#DDA0DD',
    description: '校园青春类型的故事',
    sortOrder: 6,
    isActive: true
  }
];

// 短剧数据
const dramas = [
  {
    title: '总裁的替身新娘',
    description: '一场意外的替身婚姻，让平凡女孩遇见了冷酷总裁，从契约到真爱的浪漫故事。',
    poster: 'https://example.com/posters/drama1.jpg',
    category: '霸道总裁',
    tags: ['总裁', '替身', '契约婚姻', '甜宠'],
    rating: 8.5,
    viewCount: 1250000,
    duration: '10分钟/集',
    episodes: 80,
    status: 'completed',
    actors: ['张三', '李四', '王五'],
    releaseDate: new Date('2024-01-15'),
    isHot: true,
    isNew: false,
    videoUrls: ['https://example.com/videos/drama1_ep1.mp4']
  },
  {
    title: '穿越之凤凰涅槃',
    description: '现代女医生穿越到古代，凭借医术和智慧在宫廷中站稳脚跟，与王爷展开一段跨越时空的恋情。',
    poster: 'https://example.com/posters/drama2.jpg',
    category: '古装言情',
    tags: ['穿越', '宫廷', '医女', '王爷'],
    rating: 9.2,
    viewCount: 2100000,
    duration: '12分钟/集',
    episodes: 100,
    status: 'updating',
    actors: ['赵六', '钱七', '孙八'],
    releaseDate: new Date('2024-02-01'),
    isHot: true,
    isNew: true,
    videoUrls: ['https://example.com/videos/drama2_ep1.mp4']
  },
  {
    title: '校园里的小美好',
    description: '青春校园里的纯真爱情，学霸男神与可爱学妹的甜蜜日常。',
    poster: 'https://example.com/posters/drama3.jpg',
    category: '校园',
    tags: ['校园', '学霸', '青春', '初恋'],
    rating: 8.8,
    viewCount: 980000,
    duration: '8分钟/集',
    episodes: 60,
    status: 'completed',
    actors: ['周九', '吴十', '郑十一'],
    releaseDate: new Date('2024-01-20'),
    isHot: false,
    isNew: true,
    videoUrls: ['https://example.com/videos/drama3_ep1.mp4']
  },
  {
    title: '都市夜未央',
    description: '都市白领的职场爱情故事，在繁华都市中寻找真爱的温暖故事。',
    poster: 'https://example.com/posters/drama4.jpg',
    category: '都市言情',
    tags: ['都市', '职场', '白领', '现代'],
    rating: 7.9,
    viewCount: 750000,
    duration: '15分钟/集',
    episodes: 45,
    status: 'updating',
    actors: ['冯十二', '陈十三', '褚十四'],
    releaseDate: new Date('2024-02-10'),
    isHot: false,
    isNew: true,
    videoUrls: ['https://example.com/videos/drama4_ep1.mp4']
  },
  {
    title: '神秘失踪案',
    description: '一起离奇的失踪案件，牵扯出隐藏多年的秘密，悬疑重重的推理故事。',
    poster: 'https://example.com/posters/drama5.jpg',
    category: '悬疑',
    tags: ['悬疑', '推理', '失踪', '秘密'],
    rating: 8.7,
    viewCount: 1100000,
    duration: '20分钟/集',
    episodes: 30,
    status: 'completed',
    actors: ['卫十五', '蒋十六', '沈十七'],
    releaseDate: new Date('2023-12-01'),
    isHot: true,
    isNew: false,
    videoUrls: ['https://example.com/videos/drama5_ep1.mp4']
  },
  {
    title: '甜心小娇妻',
    description: '萌萌哒小娇妻与腹黑老公的日常甜宠故事，满满的粉红泡泡。',
    poster: 'https://example.com/posters/drama6.jpg',
    category: '甜宠',
    tags: ['甜宠', '娇妻', '腹黑', '日常'],
    rating: 8.3,
    viewCount: 1350000,
    duration: '10分钟/集',
    episodes: 90,
    status: 'updating',
    actors: ['韩十八', '杨十九', '朱二十'],
    releaseDate: new Date('2024-01-25'),
    isHot: true,
    isNew: true,
    videoUrls: ['https://example.com/videos/drama6_ep1.mp4']
  },
  {
    title: '重生之商业帝国',
    description: '商界精英重生回到过去，利用未来的知识重新打造商业帝国。',
    poster: 'https://example.com/posters/drama7.jpg',
    category: '霸道总裁',
    tags: ['重生', '商战', '总裁', '逆袭'],
    rating: 8.1,
    viewCount: 890000,
    duration: '18分钟/集',
    episodes: 50,
    status: 'completed',
    actors: ['秦二一', '尤二二', '许二三'],
    releaseDate: new Date('2023-11-15'),
    isHot: false,
    isNew: false,
    videoUrls: ['https://example.com/videos/drama7_ep1.mp4']
  },
  {
    title: '宫廷秘史',
    description: '深宫大院中的权谋斗争，美人心计与帝王情深的古装大剧。',
    poster: 'https://example.com/posters/drama8.jpg',
    category: '古装言情',
    tags: ['宫廷', '权谋', '帝王', '美人'],
    rating: 9.0,
    viewCount: 1800000,
    duration: '25分钟/集',
    episodes: 120,
    status: 'updating',
    actors: ['何二四', '吕二五', '施二六'],
    releaseDate: new Date('2024-01-01'),
    isHot: true,
    isNew: true,
    videoUrls: ['https://example.com/videos/drama8_ep1.mp4']
  }
];

// 示例用户数据
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@drama-platform.com',
    password: 'Admin123456',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    profile: {
      nickname: '系统管理员',
      bio: '短剧平台系统管理员'
    },
    preferences: {
      favoriteGenres: ['都市言情', '霸道总裁'],
      language: 'zh-CN',
      notifications: {
        email: true,
        push: true,
        newDramas: true,
        recommendations: true
      }
    }
  },
  {
    username: 'moderator',
    email: 'moderator@drama-platform.com',
    password: 'Mod123456',
    role: UserRole.MODERATOR,
    status: UserStatus.ACTIVE,
    profile: {
      nickname: '内容审核员',
      bio: '负责内容审核和管理'
    },
    preferences: {
      favoriteGenres: ['悬疑', '古装言情'],
      language: 'zh-CN',
      notifications: {
        email: true,
        push: true,
        newDramas: true,
        recommendations: false
      }
    }
  },
  {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Test123456',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    profile: {
      nickname: '测试用户',
      bio: '这是一个测试用户账号',
      gender: 'female' as const
    },
    preferences: {
      favoriteGenres: ['甜宠', '校园'],
      language: 'zh-CN',
      notifications: {
        email: false,
        push: true,
        newDramas: true,
        recommendations: true
      }
    }
  },
  {
    username: 'demouser',
    email: 'demo@example.com',
    password: 'Demo123456',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    profile: {
      nickname: '演示用户',
      bio: '用于演示的用户账号',
      gender: 'male' as const
    },
    preferences: {
      favoriteGenres: ['霸道总裁', '都市言情'],
      language: 'zh-CN',
      notifications: {
        email: true,
        push: false,
        newDramas: false,
        recommendations: true
      }
    }
  }
];

class DataSeeder {
  async seedCategories(): Promise<void> {
    try {
      // 清空现有分类数据
      await Category.deleteMany({});
      logger.info('Cleared existing categories');

      // 插入新的分类数据
      const createdCategories = await Category.insertMany(categories);
      logger.info(`Created ${createdCategories.length} categories`);

      createdCategories.forEach(category => {
        logger.info(`- ${category.name} (${category.color})`);
      });
    } catch (error) {
      logger.error('Error seeding categories:', error);
      throw error;
    }
  }

  async seedDramas(): Promise<void> {
    try {
      // 清空现有短剧数据
      await Drama.deleteMany({});
      logger.info('Cleared existing dramas');

      // 插入新的短剧数据
      const createdDramas = await Drama.insertMany(dramas);
      logger.info(`Created ${createdDramas.length} dramas`);

      createdDramas.forEach(drama => {
        logger.info(`- ${drama.title} (${drama.category})`);
      });
    } catch (error) {
      logger.error('Error seeding dramas:', error);
      throw error;
    }
  }

  /**
   * 初始化用户数据
   */
  async seedUsers(): Promise<void> {
    try {
      // 清除现有用户数据
      await User.deleteMany({});
      logger.info('Cleared existing users');

      // 创建用户
      const users = await User.create(sampleUsers);
      logger.info(`Created ${users.length} users`);

      // 记录创建的用户
      for (const user of users) {
        logger.info(`- ${user.username} (${user.email}) - ${user.role}`);
      }
    } catch (error) {
      logger.error('Error seeding users:', error);
      throw error;
    }
  }

  async run(): Promise<void> {
    try {
      logger.info('Starting data seeding...');

      // 连接数据库
      await database.connect();
      logger.info('Database connected');

      // 执行数据初始化
      await this.seedCategories();
      await this.seedDramas();
      await this.seedUsers();

      logger.info('Data seeding completed successfully!');
    } catch (error) {
      logger.error('Data seeding failed:', error);
      throw error;
    } finally {
      // 断开数据库连接
      await database.disconnect();
      logger.info('Database disconnected');
    }
  }
}

// 执行数据初始化
if (require.main === module) {
  const seeder = new DataSeeder();
  seeder.run()
    .then(() => {
      logger.info('Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding process failed:', error);
      process.exit(1);
    });
}

export default DataSeeder;
