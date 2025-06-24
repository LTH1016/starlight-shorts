import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/drama';

// 自定义错误类
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 404错误处理中间件
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`路径 ${req.originalUrl} 不存在`, 404);
  next(error);
};

// 全局错误处理中间件
export const globalErrorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = '服务器内部错误';
  let isOperational = false;

  // 处理自定义错误
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  }
  // 处理MongoDB错误
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = '数据验证失败';
    const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
    message = validationErrors.join(', ');
  }
  // 处理MongoDB重复键错误
  else if ((error as any).code === 11000) {
    statusCode = 409;
    message = '数据已存在';
    const field = Object.keys((error as any).keyValue)[0];
    message = `${field} 已存在`;
  }
  // 处理MongoDB CastError
  else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'ID格式无效';
  }
  // 处理JWT错误
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '无效的访问令牌';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '访问令牌已过期';
  }

  // 记录错误日志
  if (statusCode >= 500) {
    logger.error('Server Error:', {
      message: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  } else {
    logger.warn('Client Error:', {
      message: error.message,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      statusCode
    });
  }

  // 构建错误响应
  const errorResponse: ApiResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  // 开发环境下返回错误堆栈
  if (process.env.NODE_ENV === 'development') {
    (errorResponse as any).error = {
      stack: error.stack,
      name: error.name
    };
  }

  res.status(statusCode).json(errorResponse);
};

// 异步错误捕获包装器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 验证错误处理
export const handleValidationError = (req: Request, res: Response, next: NextFunction): void => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: any) => error.msg);
    const error = new AppError(errorMessages.join(', '), 400);
    return next(error);
  }
  
  next();
};

// 数据库连接错误处理
export const handleDatabaseError = (error: any): void => {
  logger.error('Database connection error:', error);
  
  if (error.name === 'MongoNetworkError') {
    logger.error('MongoDB network error - check connection');
  } else if (error.name === 'MongooseServerSelectionError') {
    logger.error('MongoDB server selection error - check if MongoDB is running');
  }
};

// Redis连接错误处理
export const handleRedisError = (error: any): void => {
  logger.error('Redis connection error:', error);
  
  if (error.code === 'ECONNREFUSED') {
    logger.error('Redis connection refused - check if Redis is running');
  } else if (error.code === 'ENOTFOUND') {
    logger.error('Redis host not found - check Redis configuration');
  }
};

// 进程异常处理
export const setupProcessHandlers = (): void => {
  // 处理未捕获的异常
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  // 处理未处理的Promise拒绝
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  // 优雅关闭
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
};
