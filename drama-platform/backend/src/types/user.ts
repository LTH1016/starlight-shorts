import mongoose, { Document, Types } from 'mongoose';

// 用户角色枚举
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
  PENDING = 'pending'
}

// 用户基础接口
export interface IUser {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  profile: {
    nickname?: string;
    bio?: string;
    gender?: 'male' | 'female' | 'other';
    birthday?: Date;
    location?: string;
  };
  preferences: {
    favoriteGenres: string[];
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      newDramas: boolean;
      recommendations: boolean;
    };
  };
  stats: {
    totalWatchTime: number;
    dramasWatched: number;
    favoritesCount: number;
    commentsCount: number;
  };
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// MongoDB文档接口
export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  toSafeObject(): Partial<IUser>;
}

// 用户模型静态方法接口
export interface IUserModel extends mongoose.Model<IUserDocument> {
  findByEmailWithPassword(email: string): Promise<IUserDocument | null>;
  findByUsernameWithPassword(username: string): Promise<IUserDocument | null>;
  getUserStats(): Promise<any>;
}

// 用户注册数据
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  nickname?: string;
}

// 用户登录数据
export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 认证结果
export interface AuthResult {
  user: Partial<IUser>;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// JWT载荷
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// 刷新令牌载荷
export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

// 用户更新数据
export interface UserUpdateData {
  nickname?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: Date;
  location?: string;
  avatar?: string;
  preferences?: Partial<IUser['preferences']>;
}

// 密码重置数据
export interface PasswordResetData {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// 用户查询过滤器
export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  lastLoginAfter?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'username' | 'email';
  sortOrder?: 'asc' | 'desc';
}

// 用户列表响应
export interface UserListResponse {
  users: Partial<IUser>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: UserFilters;
}

// 用户统计信息
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: Array<{
    role: UserRole;
    count: number;
  }>;
  usersByStatus: Array<{
    status: UserStatus;
    count: number;
  }>;
}

// 用户活动日志
export interface UserActivity {
  userId: Types.ObjectId;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// 用户会话信息
export interface UserSession {
  userId: Types.ObjectId;
  sessionId: string;
  refreshToken: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Express Request扩展
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
      userId?: string;
    }
  }
}
