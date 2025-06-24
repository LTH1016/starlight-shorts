import winston from 'winston';
import path from 'path';

// 日志级别配置
const logLevel = process.env.LOG_LEVEL || 'info';
const logFilePath = process.env.LOG_FILE_PATH || './logs';

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// 控制台格式（开发环境）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    let log = `${timestamp} ${level}: ${message}`;
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// 创建传输器
const transports: winston.transport[] = [];

// 控制台输出
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: logLevel
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: logFormat,
      level: logLevel
    })
  );
}

// 文件输出
transports.push(
  // 错误日志
  new winston.transports.File({
    filename: path.join(logFilePath, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  // 组合日志
  new winston.transports.File({
    filename: path.join(logFilePath, 'combined.log'),
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// 创建logger实例
export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports,
  // 处理未捕获的异常
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logFilePath, 'exceptions.log'),
      format: logFormat
    })
  ],
  // 处理未处理的Promise拒绝
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logFilePath, 'rejections.log'),
      format: logFormat
    })
  ]
});

// 开发环境下的额外配置
if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logger initialized in development mode');
}

// 导出日志方法
export const logInfo = (message: string, meta?: any) => logger.info(message, meta);
export const logError = (message: string, error?: Error | any) => logger.error(message, error);
export const logWarn = (message: string, meta?: any) => logger.warn(message, meta);
export const logDebug = (message: string, meta?: any) => logger.debug(message, meta);
