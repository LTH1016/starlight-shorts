import mongoose, { Schema } from 'mongoose';
import { ICategoryDocument } from '../types/drama';

const CategorySchema = new Schema<ICategoryDocument>({
  name: {
    type: String,
    required: [true, '分类名称不能为空'],
    unique: true,
    trim: true,
    maxlength: [50, '分类名称长度不能超过50个字符'],
    index: true
  },
  color: {
    type: String,
    required: [true, '分类颜色不能为空'],
    trim: true,
    match: [/^#[0-9A-Fa-f]{6}$/, '颜色格式必须是有效的十六进制颜色代码']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, '描述长度不能超过200个字符']
  },
  sortOrder: {
    type: Number,
    default: 0,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

// 创建索引
CategorySchema.index({ sortOrder: 1, isActive: 1 });

// 静态方法：获取活跃分类
CategorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .exec();
};

// 静态方法：获取分类统计
CategorySchema.statics.getCategoryStats = async function() {
  const Drama = mongoose.model('Drama');
  
  const pipeline = [
    {
      $lookup: {
        from: 'dramas',
        localField: 'name',
        foreignField: 'category',
        as: 'dramas'
      }
    },
    {
      $project: {
        name: 1,
        color: 1,
        description: 1,
        sortOrder: 1,
        isActive: 1,
        dramaCount: { $size: '$dramas' },
        totalViews: { $sum: '$dramas.viewCount' },
        averageRating: { $avg: '$dramas.rating' }
      }
    },
    {
      $sort: { sortOrder: 1 as 1, name: 1 as 1 }
    }
  ];
  
  return this.aggregate(pipeline).exec();
};

// 中间件：删除前检查是否有关联的短剧
CategorySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  const Drama = mongoose.model('Drama');
  const dramaCount = await Drama.countDocuments({ category: this.name });
  
  if (dramaCount > 0) {
    const error = new Error(`无法删除分类 "${this.name}"，因为还有 ${dramaCount} 部短剧使用此分类`);
    return next(error);
  }
  
  next();
});

export const Category = mongoose.model<ICategoryDocument>('Category', CategorySchema);
