import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// 导入配置和工具
import { database } from './config/database';
import { redis } from './config/redis';
import { logger } from './utils/logger';

// 导入中间件
import {
  globalErrorHandler,
  notFoundHandler,
  setupProcessHandlers
} from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

// 导入路由
import dramaRoutes from './routes/drama';
import categoryRoutes from './routes/category';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import searchRoutes from './routes/search';

// 加载环境变量
dotenv.config();

class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001');
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    // 安全中间件
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS配置
    const corsOptions = {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    };
    this.app.use(cors(corsOptions));

    // 请求解析中间件
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // 压缩中间件
    this.app.use(compression());

    // 日志中间件
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', {
        stream: {
          write: (message: string) => {
            logger.info(message.trim());
          }
        }
      }));
    }

    // 限流中间件
    this.app.use(generalLimiter);

    // 健康检查中间件
    this.app.use('/health', (req, res) => {
      const healthCheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: new Date().toISOString(),
        services: {
          database: database.getConnectionStatus(),
          redis: redis.isReady()
        }
      };
      
      res.status(200).json(healthCheck);
    });
  }

  /**
   * 设置路由
   */
  private setupRoutes(): void {
    const apiPrefix = process.env.API_PREFIX || '/api/v1';

    // API路由
    this.app.use(`${apiPrefix}/dramas`, dramaRoutes);
    this.app.use(`${apiPrefix}/categories`, categoryRoutes);
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/users`, userRoutes);
    this.app.use(`${apiPrefix}/search`, searchRoutes);

    // 根路径
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: '短剧平台API服务',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        docs: `${req.protocol}://${req.get('host')}/api-docs`
      });
    });

    // API文档路由（如果需要）
    this.app.get('/api-docs', (req, res) => {
      res.json({
        success: true,
        message: 'API文档',
        endpoints: {
          dramas: `${apiPrefix}/dramas`,
          categories: `${apiPrefix}/categories`,
          auth: `${apiPrefix}/auth`,
          users: `${apiPrefix}/users`,
          search: `${apiPrefix}/search`,
          health: '/health'
        }
      });
    });
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(): void {
    // 404处理
    this.app.use(notFoundHandler);
    
    // 全局错误处理
    this.app.use(globalErrorHandler);
    
    // 进程异常处理
    setupProcessHandlers();
  }

  /**
   * 启动服务器
   */
  public async start(): Promise<void> {
    try {
      // 尝试连接数据库
      try {
        await database.connect();
        logger.info('Database connected successfully');
      } catch (error) {
        logger.warn('Database connection failed, continuing without database:', error);
      }

      // 尝试连接Redis
      try {
        await redis.connect();
        logger.info('Redis connected successfully');
      } catch (error) {
        logger.warn('Redis connection failed, continuing without cache:', error);
      }

      // 启动HTTP服务器
      this.app.listen(this.port, () => {
        logger.info(`Server is running on port ${this.port}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`API Base URL: http://localhost:${this.port}${process.env.API_PREFIX || '/api/v1'}`);
        logger.info('Health check: http://localhost:' + this.port + '/health');
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * 优雅关闭服务器
   */
  public async shutdown(): Promise<void> {
    logger.info('Shutting down server...');
    
    try {
      await database.disconnect();
      logger.info('Database disconnected');
    } catch (error) {
      logger.error('Error disconnecting database:', error);
    }

    try {
      await redis.disconnect();
      logger.info('Redis disconnected');
    } catch (error) {
      logger.error('Error disconnecting Redis:', error);
    }

    logger.info('Server shutdown complete');
  }

  /**
   * 获取Express应用实例
   */
  public getApp(): express.Application {
    return this.app;
  }
}

// 创建并启动服务器
const server = new Server();

// 启动服务器
if (require.main === module) {
  server.start().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default server;
