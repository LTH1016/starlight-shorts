import { User } from '../models/User';
import { UserSessionModel } from '../models/UserSession';
import { 
  IUser, 
  IUserDocument,
  UserFilters, 
  UserListResponse, 
  UserUpdateData,
  UserStats,
  UserRole,
  UserStatus
} from '../types/user';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';

export class UserService {
  private static readonly CACHE_TTL = 1800; // 30分钟
  private static readonly CACHE_KEYS = {
    USER_PROFILE: 'user:profile',
    USER_LIST: 'user:list',
    USER_STATS: 'user:stats'
  };

  /**
   * 获取用户列表
   */
  async getUsers(filters: UserFilters): Promise<UserListResponse> {
    try {
      const { page = 1, limit = 20 } = filters;
      const skip = (page - 1) * limit;

      // 构建查询条件
      const query = this.buildUserQuery(filters);
      
      // 构建排序条件
      const sort = this.buildUserSort(filters);

      // 尝试从缓存获取
      const cacheKey = `${UserService.CACHE_KEYS.USER_LIST}:${JSON.stringify({ query, sort, skip, limit })}`;
      
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('User list retrieved from cache');
          return JSON.parse(cached);
        }
      }

      // 执行查询
      const [users, total] = await Promise.all([
        User.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select('-password')
          .lean()
          .exec(),
        User.countDocuments(query)
      ]);

      const result: UserListResponse = {
        users: users as Partial<IUser>[],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        filters
      };

      // 缓存结果
      if (redis.isReady()) {
        await redis.set(cacheKey, JSON.stringify(result), UserService.CACHE_TTL);
      }

      return result;
    } catch (error) {
      logger.error('Error getting users:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取用户信息
   */
  async getUserById(id: string): Promise<IUser | null> {
    try {
      const cacheKey = `${UserService.CACHE_KEYS.USER_PROFILE}:${id}`;
      
      // 尝试从缓存获取
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug(`User ${id} retrieved from cache`);
          return JSON.parse(cached);
        }
      }

      const user = await User.findById(id).select('-password').lean().exec();
      
      if (user) {
        // 缓存结果
        if (redis.isReady()) {
          await redis.set(cacheKey, JSON.stringify(user), UserService.CACHE_TTL);
        }
      }

      return user as IUser;
    } catch (error) {
      logger.error(`Error getting user ${id}:`, error);
      throw error;
    }
  }

  /**
   * 根据邮箱获取用户信息
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ email }).select('-password').lean().exec();
      return user as IUser;
    } catch (error) {
      logger.error(`Error getting user by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   */
  async updateUser(id: string, updateData: UserUpdateData): Promise<IUser | null> {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { 
          ...updateData, 
          updatedAt: new Date() 
        },
        { 
          new: true, 
          runValidators: true,
          select: '-password'
        }
      ).lean().exec();

      if (user) {
        // 清除缓存
        await this.clearUserCache(id);
        logger.info(`User updated: ${id}`);
      }

      return user as IUser;
    } catch (error) {
      logger.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(id: string, status: UserStatus): Promise<IUser | null> {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { status, updatedAt: new Date() },
        { new: true, select: '-password' }
      ).lean().exec();

      if (user) {
        // 如果用户被禁用，清除所有会话
        if (status === UserStatus.BANNED || status === UserStatus.INACTIVE) {
          await UserSessionModel.clearUserSessions(id);
        }

        await this.clearUserCache(id);
        logger.info(`User status updated: ${id} -> ${status}`);
      }

      return user as IUser;
    } catch (error) {
      logger.error(`Error updating user status ${id}:`, error);
      throw error;
    }
  }

  /**
   * 更新用户角色
   */
  async updateUserRole(id: string, role: UserRole): Promise<IUser | null> {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { role, updatedAt: new Date() },
        { new: true, select: '-password' }
      ).lean().exec();

      if (user) {
        await this.clearUserCache(id);
        logger.info(`User role updated: ${id} -> ${role}`);
      }

      return user as IUser;
    } catch (error) {
      logger.error(`Error updating user role ${id}:`, error);
      throw error;
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const user = await User.findById(id);
      if (!user) {
        return false;
      }

      // 清除用户的所有会话
      await UserSessionModel.clearUserSessions(id);

      // 删除用户
      await User.findByIdAndDelete(id);
      
      // 清除缓存
      await this.clearUserCache(id);
      
      logger.info(`User deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const cacheKey = UserService.CACHE_KEYS.USER_STATS;
      
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('User stats retrieved from cache');
          return JSON.parse(cached);
        }
      }

      const stats = await (User as any).getUserStats();

      if (redis.isReady()) {
        await redis.set(cacheKey, JSON.stringify(stats), UserService.CACHE_TTL);
      }

      return stats;
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * 搜索用户
   */
  async searchUsers(query: string, limit = 20): Promise<Partial<IUser>[]> {
    try {
      const searchQuery = {
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { 'profile.nickname': { $regex: query, $options: 'i' } }
        ],
        status: UserStatus.ACTIVE
      };

      const users = await User.find(searchQuery)
        .select('username email profile.nickname avatar role createdAt')
        .limit(limit)
        .lean()
        .exec();

      return users as Partial<IUser>[];
    } catch (error) {
      logger.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * 获取用户的活跃会话
   */
  async getUserSessions(userId: string): Promise<any[]> {
    try {
      const sessions = await UserSessionModel.find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      })
        .select('sessionId ipAddress userAgent createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .lean()
        .exec();

      return sessions;
    } catch (error) {
      logger.error(`Error getting user sessions ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 构建用户查询条件
   */
  private buildUserQuery(filters: Partial<UserFilters>): any {
    const query: any = {};

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { username: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { 'profile.nickname': { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters.createdAfter || filters.createdBefore) {
      query.createdAt = {};
      if (filters.createdAfter) {
        query.createdAt.$gte = filters.createdAfter;
      }
      if (filters.createdBefore) {
        query.createdAt.$lte = filters.createdBefore;
      }
    }

    if (filters.lastLoginAfter) {
      query.lastLoginAt = { $gte: filters.lastLoginAfter };
    }

    return query;
  }

  /**
   * 构建用户排序条件
   */
  private buildUserSort(filters: Partial<UserFilters>): any {
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    
    return { [sortBy]: sortOrder };
  }

  /**
   * 清除用户相关缓存
   */
  private async clearUserCache(userId: string): Promise<void> {
    if (!redis.isReady()) {
      return;
    }

    try {
      const keys = [
        `${UserService.CACHE_KEYS.USER_PROFILE}:${userId}`,
        `${UserService.CACHE_KEYS.USER_LIST}:*`,
        UserService.CACHE_KEYS.USER_STATS
      ];
      
      for (const key of keys) {
        await redis.del(key);
      }
      logger.debug(`User cache cleared for: ${userId}`);
    } catch (error) {
      logger.error('Error clearing user cache:', error);
    }
  }
}
