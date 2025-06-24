// MongoDB初始化脚本
// 创建应用数据库和用户

// 切换到admin数据库
db = db.getSiblingDB('admin');

// 创建应用用户
db.createUser({
  user: 'drama_user',
  pwd: 'drama_password',
  roles: [
    {
      role: 'readWrite',
      db: 'drama-platform'
    }
  ]
});

// 切换到应用数据库
db = db.getSiblingDB('drama-platform');

// 创建集合和索引
db.createCollection('dramas');
db.createCollection('categories');
db.createCollection('users');

// 为dramas集合创建索引
db.dramas.createIndex({ "title": "text", "description": "text", "tags": "text" });
db.dramas.createIndex({ "category": 1, "isHot": 1 });
db.dramas.createIndex({ "category": 1, "isNewDrama": 1 });
db.dramas.createIndex({ "rating": -1, "viewCount": -1 });
db.dramas.createIndex({ "releaseDate": -1 });

// 为categories集合创建索引
db.categories.createIndex({ "name": 1 }, { unique: true });
db.categories.createIndex({ "sortOrder": 1, "isActive": 1 });

// 为users集合创建索引
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });

print('Database initialization completed successfully!');
