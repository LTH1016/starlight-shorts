import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UserService } from '../services/UserService';
import { UserFilters, UserUpdateData, UserRole, UserStatus } from '../types/user';
import { ApiResponse } from '../types/drama';
import { logger } from '../utils/logger';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * 获取用户列表
   */
  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: UserFilters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        role: req.query.role as UserRole,
        status: req.query.status as UserStatus,
        search: req.query.search as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      // 处理日期过滤器
      if (req.query.createdAfter) {
        filters.createdAfter = new Date(req.query.createdAfter as string);
      }
      if (req.query.createdBefore) {
        filters.createdBefore = new Date(req.query.createdBefore as string);
      }
      if (req.query.lastLoginAfter) {
        filters.lastLoginAfter = new Date(req.query.lastLoginAfter as string);
      }

      const result = await this.userService.getUsers(filters);

      res.json(this.createSuccessResponse('获取用户列表成功', result));
    } catch (error: any) {
      logger.error('Error in getUsers:', error);
      res.status(500).json(this.createErrorResponse('获取用户列表失败'));
    }
  };

  /**
   * 获取当前用户资料
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
   * 获取用户详情
   */
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json(this.createErrorResponse('用户不存在'));
        return;
      }

      res.json(this.createSuccessResponse('获取用户信息成功', user));
    } catch (error: any) {
      logger.error('Error in getUserById:', error);
      res.status(500).json(this.createErrorResponse('获取用户信息失败'));
    }
  };

  /**
   * 更新用户信息
   */
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(this.createErrorResponse('参数验证失败', errors.array()));
        return;
      }

      const { id } = req.params;
      const updateData: UserUpdateData = req.body;

      const user = await this.userService.updateUser(id, updateData);

      if (!user) {
        res.status(404).json(this.createErrorResponse('用户不存在'));
        return;
      }

      res.json(this.createSuccessResponse('更新用户信息成功', user));
    } catch (error: any) {
      logger.error('Error in updateUser:', error);
      res.status(500).json(this.createErrorResponse('更新用户信息失败'));
    }
  };

  /**
   * 更新用户状态
   */
  updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(UserStatus).includes(status)) {
        res.status(400).json(this.createErrorResponse('无效的用户状态'));
        return;
      }

      const user = await this.userService.updateUserStatus(id, status);

      if (!user) {
        res.status(404).json(this.createErrorResponse('用户不存在'));
        return;
      }

      res.json(this.createSuccessResponse('更新用户状态成功', user));
    } catch (error: any) {
      logger.error('Error in updateUserStatus:', error);
      res.status(500).json(this.createErrorResponse('更新用户状态失败'));
    }
  };

  /**
   * 更新用户角色
   */
  updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!Object.values(UserRole).includes(role)) {
        res.status(400).json(this.createErrorResponse('无效的用户角色'));
        return;
      }

      const user = await this.userService.updateUserRole(id, role);

      if (!user) {
        res.status(404).json(this.createErrorResponse('用户不存在'));
        return;
      }

      res.json(this.createSuccessResponse('更新用户角色成功', user));
    } catch (error: any) {
      logger.error('Error in updateUserRole:', error);
      res.status(500).json(this.createErrorResponse('更新用户角色失败'));
    }
  };

  /**
   * 删除用户
   */
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // 防止删除自己
      if (req.user && req.user._id.toString() === id) {
        res.status(400).json(this.createErrorResponse('不能删除自己的账户'));
        return;
      }

      const success = await this.userService.deleteUser(id);

      if (!success) {
        res.status(404).json(this.createErrorResponse('用户不存在'));
        return;
      }

      res.json(this.createSuccessResponse('删除用户成功'));
    } catch (error: any) {
      logger.error('Error in deleteUser:', error);
      res.status(500).json(this.createErrorResponse('删除用户失败'));
    }
  };

  /**
   * 获取用户统计信息
   */
  getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.userService.getUserStats();

      res.json(this.createSuccessResponse('获取用户统计成功', stats));
    } catch (error: any) {
      logger.error('Error in getUserStats:', error);
      res.status(500).json(this.createErrorResponse('获取用户统计失败'));
    }
  };

  /**
   * 搜索用户
   */
  searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q: query } = req.query;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || typeof query !== 'string') {
        res.status(400).json(this.createErrorResponse('搜索关键词不能为空'));
        return;
      }

      const users = await this.userService.searchUsers(query, limit);

      res.json(this.createSuccessResponse('搜索用户成功', users));
    } catch (error: any) {
      logger.error('Error in searchUsers:', error);
      res.status(500).json(this.createErrorResponse('搜索用户失败'));
    }
  };

  /**
   * 获取用户的活跃会话
   */
  getUserSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const sessions = await this.userService.getUserSessions(id);

      res.json(this.createSuccessResponse('获取用户会话成功', sessions));
    } catch (error: any) {
      logger.error('Error in getUserSessions:', error);
      res.status(500).json(this.createErrorResponse('获取用户会话失败'));
    }
  };

  /**
   * 更新当前用户资料
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(this.createErrorResponse('需要登录'));
        return;
      }

      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(this.createErrorResponse('参数验证失败', errors.array()));
        return;
      }

      const updateData: UserUpdateData = req.body;
      const userId = req.user._id.toString();

      const user = await this.userService.updateUser(userId, updateData);

      if (!user) {
        res.status(404).json(this.createErrorResponse('用户不存在'));
        return;
      }

      res.json(this.createSuccessResponse('更新资料成功', user));
    } catch (error: any) {
      logger.error('Error in updateProfile:', error);
      res.status(500).json(this.createErrorResponse('更新资料失败'));
    }
  };

  /**
   * 获取当前用户的会话列表
   */
  getMySessions = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(this.createErrorResponse('需要登录'));
        return;
      }

      const userId = req.user._id.toString();
      const sessions = await this.userService.getUserSessions(userId);

      res.json(this.createSuccessResponse('获取会话列表成功', sessions));
    } catch (error: any) {
      logger.error('Error in getMySessions:', error);
      res.status(500).json(this.createErrorResponse('获取会话列表失败'));
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
