# 🎭 Drama Platform

一个现代化的短剧平台，提供完整的前后端解决方案。

## 📁 项目结构

```
drama-platform/
├── 📁 backend/          # 后端服务 (Node.js + Express + MongoDB)
├── 📁 frontend/         # 前端应用 (Vite + React + TypeScript)
├── 📁 docs/            # 项目文档
├── 📄 README.md        # 项目说明
├── 📄 docker-compose.yml  # Docker 编排文件
└── 📄 package.json     # 根目录包管理
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- MongoDB 6.0+
- Redis 6.0+
- Docker (可选)

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
pnpm install

# 安装后端依赖
cd ../backend
npm install
```

### 启动生产环境

#### 使用 Docker Compose (推荐)

```bash
# 启动所有服务
npm start
# 或者
docker-compose up -d

# 查看日志
npm run logs
# 或者
docker-compose logs -f

# 停止服务
npm stop
# 或者
docker-compose down
```

#### 手动启动 (开发调试)

```bash
# 1. 启动 MongoDB 和 Redis
# 请确保 MongoDB 和 Redis 服务已启动

# 2. 启动后端服务
cd backend
npm run dev

# 3. 启动前端服务 (新终端)
cd frontend
pnpm dev
```

### 访问地址

- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:3000
- **API文档**: http://localhost:3000/api-docs

## 🛠️ 技术栈

### 前端技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **UI组件**: Radix UI
- **状态管理**: React Context + Hooks
- **路由**: React Router
- **HTTP客户端**: Axios

### 后端技术栈

- **运行时**: Node.js
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MongoDB + Mongoose
- **缓存**: Redis
- **认证**: JWT
- **文档**: Swagger/OpenAPI
- **测试**: Jest + Supertest

## 📋 功能特性

### 🎬 核心功能

- ✅ 短剧浏览与搜索
- ✅ 分类筛选
- ✅ 用户认证系统
- ✅ 收藏与历史记录
- ✅ 评论与互动
- ✅ 排行榜系统
- ✅ 推荐算法
- ✅ 响应式设计

### 🔧 技术特性

- ✅ TypeScript 全栈支持
- ✅ RESTful API 设计
- ✅ JWT 身份验证
- ✅ Redis 缓存优化
- ✅ MongoDB 数据持久化
- ✅ Docker 容器化部署
- ✅ 热重载开发环境
- ✅ API 文档自动生成

## 📚 开发指南

### 前端开发

```bash
cd frontend

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview

# 代码检查
pnpm lint

# 类型检查
pnpm type-check
```

### 后端开发

```bash
cd backend

# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 启动生产服务器
npm start

# 运行测试
npm test

# 代码检查
npm run lint
```

## 🐳 生产环境部署

### 使用 Docker Compose

```bash
# 启动所有服务
npm start
# 或者
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
npm run logs
# 或者
docker-compose logs -f

# 停止服务
npm stop
# 或者
docker-compose down

# 重启服务
npm restart
# 或者
docker-compose restart
```

### 🛠️ 可用的管理命令

```bash
# 生产环境管理
npm start               # 启动所有服务
npm stop                # 停止所有服务
npm restart             # 重启所有服务
npm run logs            # 查看日志

# 开发调试
npm run dev             # 本地开发模式
npm run dev:frontend    # 只启动前端
npm run dev:backend     # 只启动后端

# 构建和测试
npm run build           # 构建前后端
npm run test            # 运行测试
npm run lint            # 代码检查
npm run clean           # 清理构建文件
npm run install:all     # 安装所有依赖
```

## 📖 API 文档

启动后端服务后，访问 http://localhost:3000/api-docs 查看完整的 API 文档。

### 主要 API 端点

- `GET /api/dramas` - 获取短剧列表
- `GET /api/dramas/:id` - 获取短剧详情
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/users/profile` - 获取用户信息
- `POST /api/comments` - 发表评论

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👥 团队

- **前端开发**: React + TypeScript + Tailwind CSS
- **后端开发**: Node.js + Express + MongoDB
- **DevOps**: Docker + Docker Compose

## 🔗 相关链接

- [项目文档](./docs/)
- [API 文档](http://localhost:3000/api-docs)
- [前端组件库](./frontend/src/components/)
- [后端 API](./backend/src/routes/)

---

**🎭 Drama Platform** - 让每个故事都精彩绽放
