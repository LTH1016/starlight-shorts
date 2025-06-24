import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { UserSessionModel } from '../models/UserSession';
import { 
  RegisterData, 
  LoginData, 
  AuthResult, 
  JWTPayload, 
  RefreshTokenPayload,
  IUserDocument,
  UserRole,
  UserStatus
} from '../types/user';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';

export class AuthService {
  private static readonly TOKEN_BLACKLIST_PREFIX = 'blacklist:token:';
  private static readonly FAILED_LOGIN_PREFIX = 'failed_login:';
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60; // 15分钟

  /**
   * 用户注册
   */
  async register(registerData: RegisterData): Promise<AuthResult> {
    try {
      const { username, email, password, confirmPassword, nickname } = registerData;

      // 验证密码确认
      if (password !== confirmPassword) {
        throw new Error('密码确认不匹配');
      }

      // 检查用户名是否已存在
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        throw new Error('用户名已存在');
      }

      // 检查邮箱是否已存在
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        throw new Error('邮箱已被注册');
      }

      // 创建用户
      const user = new User({
        username,
        email,
        password,
        profile: {
          nickname: nickname || username
        },
        role: UserRole.USER,
        status: UserStatus.ACTIVE
      });

      await user.save();

      // 生成令牌
      const accessToken = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      // 创建会话
      await this.createUserSession(user._id.toString(), refreshToken);

      // 更新最后登录时间
      user.lastLoginAt = new Date();
      await user.save();

      logger.info(`User registered successfully: ${user.email}`);

      return {
        user: user.toSafeObject(),
        accessToken,
        refreshToken,
        expiresIn: this.getTokenExpirationTime()
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * 用户登录
   */
  async login(loginData: LoginData, ipAddress?: string, userAgent?: string): Promise<AuthResult> {
    try {
      const { email, password, rememberMe } = loginData;

      // 检查登录失败次数
      await this.checkLoginAttempts(email);

      // 查找用户（包含密码）
      const user = await User.findByEmailWithPassword(email);
      if (!user) {
        await this.recordFailedLogin(email);
        throw new Error('邮箱或密码错误');
      }

      // 检查用户状态
      if (user.status !== UserStatus.ACTIVE) {
        throw new Error('账户已被禁用或未激活');
      }

      // 验证密码
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await this.recordFailedLogin(email);
        throw new Error('邮箱或密码错误');
      }

      // 清除登录失败记录
      await this.clearFailedLogins(email);

      // 生成令牌
      const accessToken = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      // 创建会话
      await this.createUserSession(user._id.toString(), refreshToken, ipAddress, userAgent);

      // 更新最后登录时间
      user.lastLoginAt = new Date();
      await user.save();

      logger.info(`User logged in successfully: ${user.email}`);

      return {
        user: user.toSafeObject(),
        accessToken,
        refreshToken,
        expiresIn: this.getTokenExpirationTime()
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      // 验证刷新令牌
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'default-refresh-secret'
      ) as RefreshTokenPayload;

      // 检查会话是否存在且有效
      const session = await UserSessionModel.findOne({
        refreshToken,
        isActive: true,
        expiresAt: { $gt: new Date() }
      });

      if (!session) {
        throw new Error('无效的刷新令牌');
      }

      // 获取用户信息
      const user = await User.findById(decoded.userId);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new Error('用户不存在或已被禁用');
      }

      // 生成新的访问令牌
      const newAccessToken = user.generateAuthToken();
      const newRefreshToken = user.generateRefreshToken();

      // 更新会话
      session.refreshToken = newRefreshToken;
      session.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30天
      await session.save();

      logger.info(`Token refreshed for user: ${user.email}`);

      return {
        user: user.toSafeObject(),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.getTokenExpirationTime()
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new Error('刷新令牌失败');
    }
  }

  /**
   * 用户登出
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      // 将访问令牌加入黑名单
      if (redis.isReady()) {
        const tokenKey = `${AuthService.TOKEN_BLACKLIST_PREFIX}${refreshToken}`;
        await redis.set(tokenKey, 'blacklisted', 24 * 60 * 60); // 24小时
      }

      // 禁用会话
      await UserSessionModel.updateOne(
        { refreshToken },
        { isActive: false }
      );

      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * 登出所有设备
   */
  async logoutAllDevices(userId: string): Promise<void> {
    try {
      // 禁用用户的所有会话
      await UserSessionModel.clearUserSessions(userId);

      logger.info(`All sessions cleared for user: ${userId}`);
    } catch (error) {
      logger.error('Logout all devices error:', error);
      throw error;
    }
  }

  /**
   * 验证访问令牌
   */
  async verifyAccessToken(token: string): Promise<IUserDocument | null> {
    try {
      // 检查令牌是否在黑名单中
      if (redis.isReady()) {
        const isBlacklisted = await redis.exists(`${AuthService.TOKEN_BLACKLIST_PREFIX}${token}`);
        if (isBlacklisted) {
          return null;
        }
      }

      // 验证令牌
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret'
      ) as JWTPayload;

      // 获取用户信息
      const user = await User.findById(decoded.userId);
      if (!user || user.status !== UserStatus.ACTIVE) {
        return null;
      }

      return user;
    } catch (error) {
      logger.debug('Token verification failed:', error);
      return null;
    }
  }

  /**
   * 创建用户会话
   */
  private async createUserSession(
    userId: string, 
    refreshToken: string, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<void> {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30天

    await UserSessionModel.create({
      userId,
      sessionId,
      refreshToken,
      ipAddress,
      userAgent,
      isActive: true,
      expiresAt
    });
  }

  /**
   * 检查登录失败次数
   */
  private async checkLoginAttempts(email: string): Promise<void> {
    if (!redis.isReady()) return;

    const key = `${AuthService.FAILED_LOGIN_PREFIX}${email}`;
    const attempts = await redis.get(key);
    
    if (attempts && parseInt(attempts) >= AuthService.MAX_LOGIN_ATTEMPTS) {
      throw new Error(`登录失败次数过多，请${AuthService.LOCKOUT_DURATION / 60}分钟后再试`);
    }
  }

  /**
   * 记录登录失败
   */
  private async recordFailedLogin(email: string): Promise<void> {
    if (!redis.isReady()) return;

    const key = `${AuthService.FAILED_LOGIN_PREFIX}${email}`;
    const current = await redis.get(key);
    const attempts = current ? parseInt(current) + 1 : 1;
    
    await redis.set(key, attempts.toString(), AuthService.LOCKOUT_DURATION);
  }

  /**
   * 清除登录失败记录
   */
  private async clearFailedLogins(email: string): Promise<void> {
    if (!redis.isReady()) return;

    const key = `${AuthService.FAILED_LOGIN_PREFIX}${email}`;
    await redis.del(key);
  }

  /**
   * 获取令牌过期时间（秒）
   */
  private getTokenExpirationTime(): number {
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    // 简单解析时间字符串
    if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 24 * 60 * 60;
    } else if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 60 * 60;
    } else if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn) * 60;
    } else {
      return parseInt(expiresIn);
    }
  }
}
