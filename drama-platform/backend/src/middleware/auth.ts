import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UserRole } from '../types/user';
import { logger } from '../utils/logger';

// 认证中间件
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '未提供访问令牌',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
    
    const authService = new AuthService();
    const user = await authService.verifyAccessToken(token);
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: '无效的访问令牌',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 将用户信息添加到请求对象
    req.user = user;
    req.userId = user._id.toString();
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: '认证失败',
      timestamp: new Date().toISOString()
    });
  }
};

// 可选认证中间件（不强制要求登录）
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const authService = new AuthService();
      const user = await authService.verifyAccessToken(token);
      
      if (user) {
        req.user = user;
        req.userId = user._id.toString();
      }
    }
    
    next();
  } catch (error) {
    logger.debug('Optional auth failed:', error);
    next(); // 继续执行，不阻止请求
  }
};

// 角色授权中间件
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '需要登录',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: '权限不足',
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

// 管理员权限中间件
export const requireAdmin = authorize(UserRole.ADMIN);

// 管理员或版主权限中间件
export const requireModerator = authorize(UserRole.ADMIN, UserRole.MODERATOR);

// 用户自己或管理员权限中间件
export const requireOwnerOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: '需要登录',
      timestamp: new Date().toISOString()
    });
    return;
  }

  const targetUserId = req.params.id || req.params.userId;
  const currentUserId = req.user._id.toString();
  const isAdmin = req.user.role === UserRole.ADMIN;

  if (currentUserId !== targetUserId && !isAdmin) {
    res.status(403).json({
      success: false,
      message: '只能访问自己的资源',
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};

// 检查用户状态中间件
export const checkUserStatus = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: '需要登录',
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (req.user.status !== 'active') {
    res.status(403).json({
      success: false,
      message: '账户已被禁用',
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};

// API密钥认证中间件（用于服务间调用）
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    res.status(500).json({
      success: false,
      message: '服务器配置错误',
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (!apiKey || apiKey !== validApiKey) {
    res.status(401).json({
      success: false,
      message: '无效的API密钥',
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};

// 限制请求频率的认证中间件
export const authenticateWithRateLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // 先进行认证
  await authenticate(req, res, () => {
    // 认证成功后，可以根据用户角色设置不同的限流策略
    if (req.user) {
      // 为不同角色的用户设置不同的请求头
      res.set('X-User-Role', req.user.role);
      res.set('X-User-ID', req.user._id.toString());
    }
    next();
  });
};

// 记录用户活动中间件
export const logUserActivity = (action: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user) {
      // 记录用户活动（可以异步处理）
      setImmediate(() => {
        logger.info('User activity:', {
          userId: req.user?._id,
          action,
          resource: req.originalUrl,
          method: req.method,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        });
      });
    }
    next();
  };
};
