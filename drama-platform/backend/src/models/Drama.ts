import mongoose, { Schema } from 'mongoose';
import { IDramaDocument } from '../types/drama';

const DramaSchema = new Schema<IDramaDocument>({
  title: {
    type: String,
    required: [true, '短剧标题不能为空'],
    trim: true,
    maxlength: [100, '标题长度不能超过100个字符'],
    index: true
  },
  description: {
    type: String,
    required: [true, '短剧描述不能为空'],
    trim: true,
    maxlength: [1000, '描述长度不能超过1000个字符']
  },
  poster: {
    type: String,
    required: [true, '海报图片不能为空'],
    trim: true
  },
  category: {
    type: String,
    required: [true, '分类不能为空'],
    trim: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, '标签长度不能超过20个字符']
  }],
  rating: {
    type: Number,
    default: 0,
    min: [0, '评分不能小于0'],
    max: [10, '评分不能大于10'],
    index: true
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, '观看次数不能小于0'],
    index: true
  },
  duration: {
    type: String,
    required: [true, '时长不能为空'],
    trim: true
  },
  episodes: {
    type: Number,
    required: [true, '集数不能为空'],
    min: [1, '集数不能小于1']
  },
  status: {
    type: String,
    enum: {
      values: ['updating', 'completed', 'coming_soon'],
      message: '状态必须是 updating, completed 或 coming_soon'
    },
    default: 'updating',
    index: true
  },
  actors: [{
    type: String,
    trim: true,
    maxlength: [50, '演员姓名长度不能超过50个字符']
  }],
  releaseDate: {
    type: Date,
    required: [true, '发布日期不能为空'],
    index: true
  },
  isHot: {
    type: Boolean,
    default: false,
    index: true
  },
  isNewDrama: {
    type: Boolean,
    default: false,
    index: true
  },
  videoUrls: [{
    type: String,
    trim: true
  }],
  cast: [{
    type: String,
    trim: true
  }],
  commentCount: {
    type: Number,
    default: 0,
    min: 0
  },
  favoriteCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      ret.isNew = ret.isNewDrama;
      delete ret._id;
      delete ret.isNewDrama;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      ret.isNew = ret.isNewDrama;
      delete ret._id;
      delete ret.isNewDrama;
      return ret;
    }
  }
});

// 创建复合索引
DramaSchema.index({ category: 1, isHot: 1 });
DramaSchema.index({ category: 1, isNewDrama: 1 });
DramaSchema.index({ rating: -1, viewCount: -1 });
DramaSchema.index({ releaseDate: -1 });
DramaSchema.index({ title: 'text', description: 'text', tags: 'text' });

// 中间件：保存前自动设置isNewDrama标志
DramaSchema.pre('save', function(next) {
  if (this.isModified('releaseDate')) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    (this as any).isNewDrama = (this as any).releaseDate > thirtyDaysAgo;
  }
  next();
});

// 静态方法：获取热门短剧
DramaSchema.statics.getHotDramas = function(limit = 10) {
  return this.find({ isHot: true })
    .sort({ viewCount: -1, rating: -1 })
    .limit(limit)
    .exec();
};

// 静态方法：获取最新短剧
DramaSchema.statics.getNewDramas = function(limit = 10) {
  return this.find({ isNewDrama: true })
    .sort({ releaseDate: -1 })
    .limit(limit)
    .exec();
};

// 静态方法：获取趋势短剧
DramaSchema.statics.getTrendingDramas = function(limit = 10) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return this.find({ 
    releaseDate: { $gte: sevenDaysAgo }
  })
    .sort({ viewCount: -1, rating: -1 })
    .limit(limit)
    .exec();
};

// 实例方法：增加观看次数
DramaSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

export const Drama = mongoose.model<IDramaDocument>('Drama', DramaSchema);
