import mongoose, { Schema, Document } from 'mongoose';
import { SearchHistory, SearchFilters } from '../types/search';

interface ISearchHistoryDocument extends SearchHistory, Document {}

interface ISearchHistoryModel extends mongoose.Model<ISearchHistoryDocument> {
  getUserHistory(userId: string, limit?: number): Promise<any[]>;
  getPopularSearches(limit?: number, days?: number): Promise<any[]>;
  getSearchSuggestions(query: string, limit?: number): Promise<any[]>;
}

const SearchHistorySchema = new Schema<ISearchHistoryDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  query: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  filters: {
    type: Schema.Types.Mixed,
    default: {}
  },
  resultCount: {
    type: Number,
    required: true,
    min: 0
  },
  clickedItems: [{
    type: String,
    trim: true
  }],
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false,
  versionKey: false
});

// 创建复合索引
SearchHistorySchema.index({ userId: 1, timestamp: -1 });
SearchHistorySchema.index({ query: 1, timestamp: -1 });
SearchHistorySchema.index({ timestamp: -1 }); // TTL索引，自动删除旧记录

// 设置TTL，90天后自动删除
SearchHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// 静态方法：获取用户搜索历史
SearchHistorySchema.statics.getUserHistory = function(userId: string, limit = 20) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean()
    .exec();
};

// 静态方法：获取热门搜索词
SearchHistorySchema.statics.getPopularSearches = function(limit = 10, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        query: { $ne: '' }
      }
    },
    {
      $group: {
        _id: '$query',
        count: { $sum: 1 },
        avgResultCount: { $avg: '$resultCount' }
      }
    },
    {
      $match: {
        count: { $gte: 2 } // 至少被搜索2次
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        keyword: '$_id',
        count: 1,
        avgResultCount: 1,
        _id: 0
      }
    }
  ]);
};

// 静态方法：获取搜索建议
SearchHistorySchema.statics.getSearchSuggestions = function(query: string, limit = 5) {
  const regex = new RegExp(query, 'i');
  
  return this.aggregate([
    {
      $match: {
        query: regex,
        timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 最近30天
      }
    },
    {
      $group: {
        _id: '$query',
        count: { $sum: 1 },
        lastUsed: { $max: '$timestamp' }
      }
    },
    {
      $sort: { count: -1, lastUsed: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        text: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);
};

export const SearchHistoryModel = mongoose.model<ISearchHistoryDocument, ISearchHistoryModel>('SearchHistory', SearchHistorySchema);
