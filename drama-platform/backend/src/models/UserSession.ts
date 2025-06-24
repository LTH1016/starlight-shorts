import mongoose, { Schema, Document } from 'mongoose';
import { UserSession } from '../types/user';

interface IUserSessionDocument extends UserSession, Document {}

interface IUserSessionModel extends mongoose.Model<IUserSessionDocument> {
  clearUserSessions(userId: string): Promise<any>;
  clearExpiredSessions(): Promise<any>;
  getActiveSessionCount(userId: string): Promise<number>;
}

const UserSessionSchema = new Schema<IUserSessionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL索引，自动删除过期文档
  }
}, {
  timestamps: true,
  versionKey: false
});

// 复合索引
UserSessionSchema.index({ userId: 1, isActive: 1 });
UserSessionSchema.index({ refreshToken: 1, isActive: 1 });

// 静态方法：清理用户的所有会话
UserSessionSchema.statics.clearUserSessions = function(userId: string) {
  return this.updateMany(
    { userId, isActive: true },
    { isActive: false }
  );
};

// 静态方法：清理过期会话
UserSessionSchema.statics.clearExpiredSessions = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false }
    ]
  });
};

// 静态方法：获取用户活跃会话数
UserSessionSchema.statics.getActiveSessionCount = function(userId: string) {
  return this.countDocuments({ userId, isActive: true });
};

export const UserSessionModel = mongoose.model<IUserSessionDocument, IUserSessionModel>('UserSession', UserSessionSchema);
