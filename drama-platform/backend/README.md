# 🎬 Short Drama Platform Backend

A comprehensive, production-ready backend API for the Short Drama Platform, built with modern technologies including Node.js, Express, TypeScript, MongoDB, and Redis. Features robust authentication, advanced search capabilities, and scalable architecture.

## ✨ Features

### 🎯 Core Features
- **RESTful API**: Complete REST API with comprehensive drama management
- **JWT Authentication**: Secure token-based authentication and authorization
- **MongoDB Integration**: Robust database layer with Mongoose ODM
- **Redis Caching**: High-performance caching for optimal response times
- **Advanced Search**: Full-text search with filters, suggestions, and recommendations
- **Category System**: Hierarchical drama categorization and management
- **User Management**: Complete user profiles, preferences, and favorites system
- **Rate Limiting**: API protection with configurable rate limiting
- **Comprehensive Logging**: Structured logging with Winston for monitoring
- **Input Validation**: Robust request validation with express-validator

### 🛡️ Security Features
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for enhanced security
- **Error Handling**: Secure error responses without information leakage
- **Input Sanitization**: Protection against injection attacks

### 🚀 Performance Features
- **Connection Pooling**: Optimized database connections
- **Response Compression**: Gzip compression for faster responses
- **Database Indexing**: Optimized MongoDB indexes for fast queries
- **Pagination**: Efficient data pagination for large datasets
- **Caching Strategy**: Multi-layer caching with Redis

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB 6.x with Mongoose ODM
- **Cache**: Redis 7.x
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: helmet, cors, bcryptjs
- **Logging**: Winston with multiple transports
- **Testing**: Jest with TypeScript support
- **Development**: nodemon, ts-node

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis 7+
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/LTH1016/short-drama-platform-backend.git
   cd short-drama-platform-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/short-drama-platform

   # Redis Cache
   REDIS_URL=redis://localhost:6379

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-refresh-secret-key
   JWT_REFRESH_EXPIRES_IN=30d

   # CORS
   FRONTEND_URL=http://localhost:3000

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start Services**
   ```bash
   # Using Docker (Recommended)
   docker-compose up -d

   # Or start services manually
   mongod --dbpath /your/db/path
   redis-server
   ```

5. **Initialize Database**
   ```bash
   # Seed with sample data
   npm run seed
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

   Server will start at `http://localhost:3001`

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run seed` - Seed database with sample data
- `npm run clean` - Clean build directory

## 📚 API Documentation

### Base Information

- **Base URL**: `http://localhost:3001/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)

### 🎭 Drama Endpoints

#### Get All Dramas
```http
GET /api/v1/dramas
```

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `category`: Filter by category ID
- `search`: Search keyword
- `sortBy`: Sort field (createdAt|rating|viewCount|releaseDate)
- `sortOrder`: Sort direction (asc|desc)

#### Get Drama Details
```http
GET /api/v1/dramas/:id
```

#### Search Dramas
```http
GET /api/v1/dramas/search?q=keyword
```

#### Get Recommended Dramas
```http
GET /api/v1/dramas/recommendations
```

#### Get Trending Dramas
```http
GET /api/v1/dramas/trending?limit=10
```

#### Get Latest Dramas
```http
GET /api/v1/dramas/latest?limit=10
```

### 📂 Category Endpoints

#### Get All Categories
```http
GET /api/v1/categories
```

#### Get Category Details
```http
GET /api/v1/categories/:id
```

### 🔍 Search Endpoints

#### Advanced Search
```http
GET /api/v1/search?q=keyword&category=id&year=2024&rating=4.5
```

#### Search Suggestions
```http
GET /api/v1/search/suggestions?q=partial-keyword
```

### 👤 User Endpoints (Authentication Required)

#### User Registration
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}
```

#### User Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /api/v1/users/profile
Authorization: Bearer <jwt-token>
```

#### Get User Favorites
```http
GET /api/v1/users/favorites
Authorization: Bearer <jwt-token>
```

#### Add to Favorites
```http
POST /api/v1/users/favorites/:dramaId
Authorization: Bearer <jwt-token>
```

## 🏗️ Project Structure

```
src/
├── config/              # Configuration files
│   ├── database.ts      # MongoDB configuration
│   └── redis.ts         # Redis configuration
├── controllers/         # Route controllers
│   ├── AuthController.ts
│   ├── DramaController.ts
│   ├── CategoryController.ts
│   ├── SearchController.ts
│   └── UserController.ts
├── middleware/          # Express middleware
│   ├── auth.ts          # Authentication middleware
│   ├── errorHandler.ts  # Error handling
│   └── rateLimiter.ts   # Rate limiting
├── models/              # Mongoose models
│   ├── User.ts
│   ├── Drama.ts
│   ├── Category.ts
│   ├── SearchHistory.ts
│   ├── UserPreference.ts
│   └── UserSession.ts
├── routes/              # Express routes
│   ├── auth.ts
│   ├── drama.ts
│   ├── category.ts
│   ├── search.ts
│   └── user.ts
├── services/            # Business logic
│   ├── AuthService.ts
│   ├── DramaService.ts
│   ├── CategoryService.ts
│   ├── SearchService.ts
│   ├── UserService.ts
│   ├── RankingService.ts
│   └── RecommendationService.ts
├── types/               # TypeScript type definitions
│   ├── user.ts
│   ├── drama.ts
│   └── search.ts
├── utils/               # Utility functions
│   └── logger.ts
├── validators/          # Request validators
│   ├── authValidators.ts
│   ├── userValidators.ts
│   └── searchValidators.ts
├── scripts/             # Database scripts
│   └── seedData.ts
└── server.ts            # Application entry point
```

## 🗄️ Database Schema

### Drama Model
```typescript
{
  title: string;
  description: string;
  coverImage: string;
  category: ObjectId;
  tags: string[];
  rating: number;
  viewCount: number;
  duration: number; // in minutes
  releaseYear: number;
  status: 'ongoing' | 'completed';
  episodes: Array<{
    number: number;
    title: string;
    duration: number;
    videoUrl: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

### User Model
```typescript
{
  username: string;
  email: string;
  password: string; // hashed with bcrypt
  avatar?: string;
  preferences: {
    favoriteCategories: string[];
    preferredLanguage: string;
    autoplay: boolean;
  };
  favorites: ObjectId[]; // Drama IDs
  watchHistory: Array<{
    drama: ObjectId;
    watchedAt: Date;
    progress: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Category Model
```typescript
{
  name: string;
  description: string;
  color: string;
  icon?: string;
  dramaCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Password Hashing**: bcryptjs with salt rounds for secure password storage
- **Rate Limiting**: Configurable API rate limiting to prevent abuse
- **CORS Protection**: Cross-origin resource sharing configuration
- **Security Headers**: Helmet.js for enhanced security headers
- **Input Validation**: Comprehensive request validation with express-validator
- **Error Handling**: Secure error responses without sensitive information leakage
- **Input Sanitization**: Protection against NoSQL injection and XSS attacks

## ⚡ Performance Optimization

- **Redis Caching**: Multi-layer caching strategy for frequently accessed data
- **Database Indexing**: Optimized MongoDB indexes for fast query performance
- **Connection Pooling**: Efficient database connection management
- **Response Compression**: Gzip compression for reduced bandwidth usage
- **Pagination**: Efficient data pagination for large datasets
- **Query Optimization**: Optimized database queries with proper projections

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=drama.test.ts
```

### Test Coverage
- Unit tests for all services and controllers
- Integration tests for API endpoints
- Database model tests
- Authentication and authorization tests
- Error handling tests

## 🚀 Deployment

### Docker Deployment (Recommended)

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Custom Docker build**
   ```bash
   docker build -t short-drama-backend .
   docker run -p 3001:3001 --env-file .env short-drama-backend
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   export NODE_ENV=production
   export MONGODB_URI=your-production-mongodb-uri
   export REDIS_URL=your-production-redis-url
   export JWT_SECRET=your-production-jwt-secret
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://your-production-host:27017/drama-platform
REDIS_URL=redis://your-production-redis:6379
JWT_SECRET=your-super-secure-production-jwt-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret
FRONTEND_URL=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Monitoring and Logging

- **Winston Logging**: Structured logging with multiple transports
- **Error Tracking**: Comprehensive error logging and tracking
- **Performance Metrics**: Request timing and performance monitoring
- **Health Checks**: API health check endpoints
- **Database Monitoring**: MongoDB connection and query monitoring

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests for new functionality**
5. **Ensure all tests pass**
   ```bash
   npm test
   ```
6. **Commit your changes**
   ```bash
   git commit -m 'feat: Add amazing feature'
   ```
7. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure code passes ESLint checks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Express.js** for the robust web framework
- **MongoDB** for the flexible document database
- **Redis** for high-performance caching
- **TypeScript** for type safety and better development experience
- **Jest** for comprehensive testing framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/LTH1016/short-drama-platform-backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/LTH1016/short-drama-platform-backend/discussions)
- **Email**: support@example.com

---

**Built with ❤️ by LTH1016**

### 🔗 Related Projects

- [Short Drama Platform Frontend](https://github.com/LTH1016/short-drama-platform) - React frontend application
- [Short Drama Platform Mobile](https://github.com/LTH1016/short-drama-platform-mobile) - React Native mobile app (coming soon)
GET /api/v1/dramas/new?limit=10
```

#### 获取趋势短剧
```http
GET /api/v1/dramas/trending?limit=10
```

#### 增加观看次数
```http
POST /api/v1/dramas/:id/view
```

### 分类相关API

#### 获取活跃分类
```http
GET /api/v1/categories
```

#### 获取所有分类
```http
GET /api/v1/categories/all
```

#### 获取分类统计
```http
GET /api/v1/categories/stats
```

#### 创建分类
```http
POST /api/v1/categories
Content-Type: application/json

{
  "name": "分类名称",
  "color": "#FF6B9D",
  "description": "分类描述",
  "sortOrder": 1,
  "isActive": true
}
```

### 响应格式

成功响应：
```json
{
  "success": true,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

错误响应：
```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 开发指南

### 项目结构

```
src/
├── config/          # 配置文件
│   ├── database.ts  # 数据库配置
│   └── redis.ts     # Redis配置
├── controllers/     # 控制器
├── middleware/      # 中间件
├── models/          # 数据模型
├── routes/          # 路由定义
├── services/        # 业务逻辑
├── types/           # TypeScript类型定义
├── utils/           # 工具函数
├── scripts/         # 脚本文件
└── server.ts        # 服务器入口
```

### 代码规范

- 使用TypeScript严格模式
- 遵循ESLint规则
- 使用Prettier格式化代码
- 编写单元测试

### 添加新功能

1. 在 `types/` 中定义类型接口
2. 在 `models/` 中创建数据模型
3. 在 `services/` 中实现业务逻辑
4. 在 `controllers/` 中创建控制器
5. 在 `routes/` 中定义路由
6. 更新API文档

## 🧪 测试

```bash
# 运行测试
npm test

# 运行测试覆盖率
npm run test:coverage
```

## 📊 监控和日志

### 健康检查

```http
GET /health
```

返回服务状态和依赖服务状态。

### 日志

日志文件位置：
- `logs/combined.log` - 所有日志
- `logs/error.log` - 错误日志
- `logs/exceptions.log` - 异常日志

## 🚀 部署

### Docker部署

```bash
# 构建镜像
docker build -t drama-platform-backend .

# 运行容器
docker run -p 3001:3001 drama-platform-backend
```

### PM2部署

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start dist/server.js --name drama-api

# 查看状态
pm2 status

# 查看日志
pm2 logs drama-api
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目链接: [GitHub Repository]
- 问题反馈: [GitHub Issues]

## 🔄 更新日志

### v1.0.0 (2024-01-01)
- ✅ 实现基础短剧管理功能
- ✅ 实现分类管理功能
- ✅ 实现搜索和推荐功能
- ✅ 添加缓存和限流保护
- ✅ 完善错误处理和日志系统
