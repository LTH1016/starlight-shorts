import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';

// 基础限流配置
const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      message: options.message,
      timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded:', {
        ip: req.ip,
        url: req.originalUrl,
        userAgent: req.get('User-Agent')
      });
      
      res.status(429).json({
        success: false,
        message: options.message,
        timestamp: new Date().toISOString()
      });
    }
  });
};

// 通用API限流 - 每15分钟100次请求
export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100,
  message: '请求过于频繁，请稍后再试'
});

// 搜索API限流 - 每分钟20次请求
export const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1分钟
  max: 20,
  message: '搜索请求过于频繁，请稍后再试'
});

// 严格限流 - 每小时10次请求（用于敏感操作）
export const strictLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 10,
  message: '操作过于频繁，请稍后再试'
});

// 宽松限流 - 每分钟60次请求（用于读取操作）
export const looseLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1分钟
  max: 60,
  message: '请求过于频繁，请稍后再试'
});

// 基于Redis的自定义限流器
export class RedisRateLimiter {
  private prefix: string;
  private windowMs: number;
  private maxRequests: number;

  constructor(prefix: string, windowMs: number, maxRequests: number) {
    this.prefix = prefix;
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  async isAllowed(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    if (!redis.isReady()) {
      // Redis不可用时允许请求通过
      return { allowed: true, remaining: this.maxRequests, resetTime: Date.now() + this.windowMs };
    }

    const key = `${this.prefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    try {
      // 使用Redis的有序集合来存储请求时间戳
      const client = redis.getClient();
      
      // 删除窗口外的旧记录
      await client.zRemRangeByScore(key, 0, windowStart);
      
      // 获取当前窗口内的请求数量
      const currentRequests = await client.zCard(key);
      
      if (currentRequests >= this.maxRequests) {
        // 获取最早的请求时间，计算重置时间
        const oldestRequest = await client.zRange(key, 0, 0, { BY: 'SCORE' });
        const resetTime = oldestRequest.length > 0
          ? parseInt(oldestRequest[0] || '0') + this.windowMs
          : now + this.windowMs;
          
        return { 
          allowed: false, 
          remaining: 0, 
          resetTime 
        };
      }

      // 添加当前请求
      await client.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
      
      // 设置过期时间
      await client.expire(key, Math.ceil(this.windowMs / 1000));

      return { 
        allowed: true, 
        remaining: this.maxRequests - currentRequests - 1, 
        resetTime: now + this.windowMs 
      };
    } catch (error) {
      logger.error('Redis rate limiter error:', error);
      // Redis错误时允许请求通过
      return { allowed: true, remaining: this.maxRequests, resetTime: now + this.windowMs };
    }
  }

  middleware() {
    return async (req: Request, res: Response, next: Function) => {
      const identifier = req.ip || 'unknown';
      const result = await this.isAllowed(identifier);

      // 设置响应头
      res.set({
        'X-RateLimit-Limit': this.maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      });

      if (!result.allowed) {
        logger.warn('Redis rate limit exceeded:', {
          ip: req.ip,
          url: req.originalUrl,
          userAgent: req.get('User-Agent')
        });

        return res.status(429).json({
          success: false,
          message: '请求过于频繁，请稍后再试',
          timestamp: new Date().toISOString()
        });
      }

      return next();
    };
  }
}

// 预定义的Redis限流器实例
export const redisApiLimiter = new RedisRateLimiter('api', 15 * 60 * 1000, 100); // 15分钟100次
export const redisSearchLimiter = new RedisRateLimiter('search', 60 * 1000, 20); // 1分钟20次
export const redisUploadLimiter = new RedisRateLimiter('upload', 60 * 60 * 1000, 5); // 1小时5次

// IP白名单中间件
export const createWhitelistMiddleware = (whitelist: string[]) => {
  return (req: Request, res: Response, next: Function) => {
    const clientIP = req.ip || 'unknown';

    if (whitelist.includes(clientIP)) {
      return next();
    }

    // 不在白名单中，继续执行限流
    next();
  };
};

// 动态限流中间件（根据用户类型调整限制）
export const createDynamicLimiter = () => {
  return async (req: Request, res: Response, next: Function) => {
    const userType = (req as any).user?.type || 'guest';
    let limiter: RedisRateLimiter;

    switch (userType) {
      case 'admin':
        limiter = new RedisRateLimiter('admin', 60 * 1000, 200); // 管理员：1分钟200次
        break;
      case 'premium':
        limiter = new RedisRateLimiter('premium', 60 * 1000, 100); // 高级用户：1分钟100次
        break;
      case 'user':
        limiter = new RedisRateLimiter('user', 60 * 1000, 60); // 普通用户：1分钟60次
        break;
      default:
        limiter = new RedisRateLimiter('guest', 60 * 1000, 30); // 游客：1分钟30次
    }

    return limiter.middleware()(req, res, next);
  };
};
