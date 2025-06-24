import mongoose, { Schema, Document } from 'mongoose';
import { UserPreference } from '../types/search';

interface IUserPreferenceDocument extends UserPreference, Document {}

interface IUserPreferenceModel extends mongoose.Model<IUserPreferenceDocument> {
  getOrCreateUserPreference(userId: string): Promise<IUserPreferenceDocument>;
  updatePreferenceFromDrama(userId: string, drama: any, action: 'view' | 'like' | 'favorite' | 'complete'): Promise<IUserPreferenceDocument>;
}

const UserPreferenceSchema = new Schema<IUserPreferenceDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  categories: [{
    category: {
      type: String,
      required: true,
      trim: true
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    }
  }],
  tags: [{
    tag: {
      type: String,
      required: true,
      trim: true
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    }
  }],
  actors: [{
    actor: {
      type: String,
      required: true,
      trim: true
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    }
  }],
  ratingRange: {
    min: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    max: {
      type: Number,
      default: 10,
      min: 0,
      max: 10
    },
    preferred: {
      type: Number,
      default: 8,
      min: 0,
      max: 10
    }
  },
  viewingTime: {
    totalMinutes: {
      type: Number,
      default: 0,
      min: 0
    },
    averageSession: {
      type: Number,
      default: 0,
      min: 0
    },
    preferredDuration: {
      type: Number,
      default: 30, // 默认30分钟
      min: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// 创建索引
UserPreferenceSchema.index({ lastUpdated: -1 });
UserPreferenceSchema.index({ 'categories.category': 1 });
UserPreferenceSchema.index({ 'tags.tag': 1 });

// 实例方法：更新分类偏好
UserPreferenceSchema.methods.updateCategoryPreference = function(category: string, weight: number) {
  const existingIndex = this.categories.findIndex((c: any) => c.category === category);
  
  if (existingIndex >= 0) {
    this.categories[existingIndex].weight = Math.min(1, Math.max(0, weight));
  } else {
    this.categories.push({ category, weight: Math.min(1, Math.max(0, weight)) });
  }
  
  // 保持最多10个分类偏好
  if (this.categories.length > 10) {
    this.categories.sort((a: any, b: any) => b.weight - a.weight);
    this.categories = this.categories.slice(0, 10);
  }
  
  this.lastUpdated = new Date();
};

// 实例方法：更新标签偏好
UserPreferenceSchema.methods.updateTagPreference = function(tag: string, weight: number) {
  const existingIndex = this.tags.findIndex((t: any) => t.tag === tag);
  
  if (existingIndex >= 0) {
    this.tags[existingIndex].weight = Math.min(1, Math.max(0, weight));
  } else {
    this.tags.push({ tag, weight: Math.min(1, Math.max(0, weight)) });
  }
  
  // 保持最多20个标签偏好
  if (this.tags.length > 20) {
    this.tags.sort((a: any, b: any) => b.weight - a.weight);
    this.tags = this.tags.slice(0, 20);
  }
  
  this.lastUpdated = new Date();
};

// 实例方法：更新观看时间统计
UserPreferenceSchema.methods.updateViewingTime = function(sessionMinutes: number) {
  this.viewingTime.totalMinutes += sessionMinutes;
  
  // 计算平均观看时长（简化算法）
  const sessionCount = Math.max(1, this.viewingTime.totalMinutes / 30); // 假设平均30分钟一集
  this.viewingTime.averageSession = this.viewingTime.totalMinutes / sessionCount;
  
  // 更新偏好时长
  if (sessionMinutes > 0) {
    this.viewingTime.preferredDuration = 
      (this.viewingTime.preferredDuration * 0.8) + (sessionMinutes * 0.2);
  }
  
  this.lastUpdated = new Date();
};

// 静态方法：获取或创建用户偏好
UserPreferenceSchema.statics.getOrCreateUserPreference = async function(userId: string) {
  let preference = await this.findOne({ userId });
  
  if (!preference) {
    preference = new this({
      userId,
      categories: [],
      tags: [],
      actors: [],
      ratingRange: { min: 0, max: 10, preferred: 8 },
      viewingTime: { totalMinutes: 0, averageSession: 0, preferredDuration: 30 }
    });
    await preference.save();
  }
  
  return preference;
};

// 静态方法：基于用户行为更新偏好
UserPreferenceSchema.statics.updatePreferenceFromDrama = async function(
  userId: string, 
  drama: any, 
  action: 'view' | 'like' | 'favorite' | 'complete'
) {
  const preference = await (this as any).getOrCreateUserPreference(userId);
  
  // 根据行为类型设置权重
  const actionWeights = {
    view: 0.1,
    like: 0.3,
    favorite: 0.5,
    complete: 0.7
  };
  
  const weight = actionWeights[action];
  
  // 更新分类偏好
  if (drama.category) {
    preference.updateCategoryPreference(drama.category, weight);
  }
  
  // 更新标签偏好
  if (drama.tags && Array.isArray(drama.tags)) {
    drama.tags.forEach((tag: string) => {
      preference.updateTagPreference(tag, weight * 0.8); // 标签权重稍低
    });
  }
  
  // 更新演员偏好
  if (drama.cast && Array.isArray(drama.cast)) {
    drama.cast.forEach((actor: string) => {
      const existingIndex = preference.actors.findIndex((a: any) => a.actor === actor);
      if (existingIndex >= 0) {
        preference.actors[existingIndex].weight = Math.min(1, preference.actors[existingIndex].weight + weight * 0.6);
      } else {
        preference.actors.push({ actor, weight: weight * 0.6 });
      }
    });
    
    // 保持最多15个演员偏好
    if (preference.actors.length > 15) {
      preference.actors.sort((a: any, b: any) => b.weight - a.weight);
      preference.actors = preference.actors.slice(0, 15);
    }
  }
  
  await preference.save();
  return preference;
};

export const UserPreferenceModel = mongoose.model<IUserPreferenceDocument, IUserPreferenceModel>('UserPreference', UserPreferenceSchema);
