import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/AuthService';
import { RegisterData, LoginData } from '../types/user';
import { ApiResponse } from '../types/drama';
import { logger } from '../utils/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * 用户注册
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(this.createErrorResponse('参数验证失败', errors.array()));
        return;
      }

      const registerData: RegisterData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        nickname: req.body.nickname
      };

      const result = await this.authService.register(registerData);

      // 设置刷新令牌到HttpOnly Cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30天
      });

      res.status(201).json(this.createSuccessResponse('注册成功', {
        user: result.user,
        accessToken: result.accessToken,
        expiresIn: result.expiresIn
      }));
    } catch (error: any) {
      logger.error('Error in register:', error);
      res.status(400).json(this.createErrorResponse(error.message || '注册失败'));
    }
  };

  /**
   * 用户登录
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(this.createErrorResponse('参数验证失败', errors.array()));
        return;
      }

      const loginData: LoginData = {
        email: req.body.email,
        password: req.body.password,
        rememberMe: req.body.rememberMe
      };

      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      const result = await this.authService.login(loginData, ipAddress, userAgent);

      // 设置刷新令牌到HttpOnly Cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: loginData.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30天或1天
      });

      res.json(this.createSuccessResponse('登录成功', {
        user: result.user,
        accessToken: result.accessToken,
        expiresIn: result.expiresIn
      }));
    } catch (error: any) {
      logger.error('Error in login:', error);
      res.status(401).json(this.createErrorResponse(error.message || '登录失败'));
    }
  };

  /**
   * 刷新访问令牌
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        res.status(401).json(this.createErrorResponse('未提供刷新令牌'));
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);

      // 更新刷新令牌Cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30天
      });

      res.json(this.createSuccessResponse('令牌刷新成功', {
        user: result.user,
        accessToken: result.accessToken,
        expiresIn: result.expiresIn
      }));
    } catch (error: any) {
      logger.error('Error in refreshToken:', error);
      res.status(401).json(this.createErrorResponse(error.message || '令牌刷新失败'));
    }
  };

  /**
   * 用户登出
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }

      // 清除刷新令牌Cookie
      res.clearCookie('refreshToken');

      res.json(this.createSuccessResponse('登出成功'));
    } catch (error: any) {
      logger.error('Error in logout:', error);
      res.status(500).json(this.createErrorResponse('登出失败'));
    }
  };

  /**
   * 登出所有设备
   */
  logoutAll = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(this.createErrorResponse('需要登录'));
        return;
      }

      await this.authService.logoutAllDevices(req.user._id.toString());

      // 清除刷新令牌Cookie
      res.clearCookie('refreshToken');

      res.json(this.createSuccessResponse('已登出所有设备'));
    } catch (error: any) {
      logger.error('Error in logoutAll:', error);
      res.status(500).json(this.createErrorResponse('操作失败'));
    }
  };

  /**
   * 获取当前用户信息
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(this.createErrorResponse('需要登录'));
        return;
      }

      res.json(this.createSuccessResponse('获取用户信息成功', req.user.toSafeObject()));
    } catch (error: any) {
      logger.error('Error in getProfile:', error);
      res.status(500).json(this.createErrorResponse('获取用户信息失败'));
    }
  };

  /**
   * 验证令牌
   */
  verifyToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json(this.createErrorResponse('未提供令牌'));
        return;
      }

      const user = await this.authService.verifyAccessToken(token);

      if (!user) {
        res.status(401).json(this.createErrorResponse('无效的令牌'));
        return;
      }

      res.json(this.createSuccessResponse('令牌有效', {
        valid: true,
        user: user.toSafeObject()
      }));
    } catch (error: any) {
      logger.error('Error in verifyToken:', error);
      res.status(401).json(this.createErrorResponse('令牌验证失败'));
    }
  };

  /**
   * 检查用户名是否可用
   */
  checkUsername = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      if (!username) {
        res.status(400).json(this.createErrorResponse('用户名不能为空'));
        return;
      }

      const { User } = await import('../models/User');
      const existingUser = await User.findOne({ username });

      res.json(this.createSuccessResponse('检查完成', {
        available: !existingUser,
        username
      }));
    } catch (error: any) {
      logger.error('Error in checkUsername:', error);
      res.status(500).json(this.createErrorResponse('检查失败'));
    }
  };

  /**
   * 检查邮箱是否可用
   */
  checkEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.params;

      if (!email) {
        res.status(400).json(this.createErrorResponse('邮箱不能为空'));
        return;
      }

      const { User } = await import('../models/User');
      const existingUser = await User.findOne({ email });

      res.json(this.createSuccessResponse('检查完成', {
        available: !existingUser,
        email
      }));
    } catch (error: any) {
      logger.error('Error in checkEmail:', error);
      res.status(500).json(this.createErrorResponse('检查失败'));
    }
  };

  /**
   * 创建成功响应
   */
  private createSuccessResponse<T>(message: string, data?: T): ApiResponse<T> {
    return {
      success: true,
      message,
      data: data as T,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 创建错误响应
   */
  private createErrorResponse(message: string, error?: any): ApiResponse {
    return {
      success: false,
      message,
      error: error || undefined,
      timestamp: new Date().toISOString()
    };
  }
}
