import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUserDocument, IUserModel, UserRole, UserStatus } from '../types/user';

const UserSchema = new Schema<IUserDocument>({
  username: {
    type: String,
    required: [true, '用户名不能为空'],
    unique: true,
    trim: true,
    minlength: [3, '用户名长度不能少于3个字符'],
    maxlength: [20, '用户名长度不能超过20个字符'],
    match: [/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'],
    index: true
  },
  email: {
    type: String,
    required: [true, '邮箱不能为空'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '邮箱格式不正确'],
    index: true
  },
  password: {
    type: String,
    required: [true, '密码不能为空'],
    minlength: [6, '密码长度不能少于6个字符'],
    select: false // 默认查询时不返回密码
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE,
    index: true
  },
  profile: {
    nickname: {
      type: String,
      trim: true,
      maxlength: [50, '昵称长度不能超过50个字符']
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, '个人简介长度不能超过500个字符']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: null
    },
    birthday: {
      type: Date,
      default: null
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, '地址长度不能超过100个字符']
    }
  },
  preferences: {
    favoriteGenres: [{
      type: String,
      trim: true
    }],
    language: {
      type: String,
      default: 'zh-CN'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      newDramas: {
        type: Boolean,
        default: true
      },
      recommendations: {
        type: Boolean,
        default: true
      }
    }
  },
  stats: {
    totalWatchTime: {
      type: Number,
      default: 0,
      min: 0
    },
    dramasWatched: {
      type: Number,
      default: 0,
      min: 0
    },
    favoritesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  lastLoginAt: {
    type: Date,
    default: null,
    index: true
  },
  emailVerifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      return ret;
    }
  }
});

// 创建索引
UserSchema.index({ email: 1, status: 1 });
UserSchema.index({ username: 1, status: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLoginAt: -1 });

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 实例方法：比较密码
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// 实例方法：生成访问令牌
UserSchema.methods.generateAuthToken = function(): string {
  const payload = {
    userId: this._id.toString(),
    email: this.email,
    role: this.role
  };

  const secret = process.env.JWT_SECRET || 'default-secret';
  const options: any = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'drama-platform',
    audience: 'drama-platform-users'
  };

  return jwt.sign(payload, secret, options);
};

// 实例方法：生成刷新令牌
UserSchema.methods.generateRefreshToken = function(): string {
  const payload = {
    userId: this._id.toString(),
    tokenId: new mongoose.Types.ObjectId().toString()
  };

  const secret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
  const options: any = {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    issuer: 'drama-platform',
    audience: 'drama-platform-refresh'
  };

  return jwt.sign(payload, secret, options);
};

// 实例方法：返回安全的用户对象
UserSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// 静态方法：根据邮箱查找用户（包含密码）
UserSchema.statics.findByEmailWithPassword = function(email: string) {
  return this.findOne({ email }).select('+password');
};

// 静态方法：根据用户名查找用户（包含密码）
UserSchema.statics.findByUsernameWithPassword = function(username: string) {
  return this.findOne({ username }).select('+password');
};

// 静态方法：获取用户统计信息
UserSchema.statics.getUserStats = async function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    activeUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    usersByRole,
    usersByStatus
  ] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ status: UserStatus.ACTIVE }),
    this.countDocuments({ createdAt: { $gte: today } }),
    this.countDocuments({ createdAt: { $gte: thisWeek } }),
    this.countDocuments({ createdAt: { $gte: thisMonth } }),
    this.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { role: '$_id', count: 1, _id: 0 } }
    ]),
    this.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ])
  ]);

  return {
    totalUsers,
    activeUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    usersByRole,
    usersByStatus
  };
};

export const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);
