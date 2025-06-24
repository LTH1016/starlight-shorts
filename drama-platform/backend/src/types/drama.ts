import { Document, Types } from 'mongoose';

// 短剧基础接口
export interface IDrama {
  _id?: Types.ObjectId; // MongoDB ID
  title: string;
  description: string;
  poster: string;
  category: string;
  tags: string[];
  rating: number;
  viewCount: number;
  duration: string;
  episodes: number;
  status: 'updating' | 'completed' | 'coming_soon';
  actors: string[];
  releaseDate: Date;
  isHot: boolean;
  isNew: boolean;
  isNewDrama?: boolean; // 数据库字段
  videoUrls: string[];
  cast?: string[]; // 演员列表
  commentCount?: number; // 评论数
  favoriteCount?: number; // 收藏数
  createdAt: Date;
  updatedAt: Date;
}

// MongoDB文档接口
export interface IDramaDocument extends IDrama, Document {
  _id: Types.ObjectId;
}

// 分类接口
export interface ICategory {
  name: string;
  color: string;
  description?: string;
  icon?: string; // 图标
  sortOrder: number;
  isActive: boolean;
  dramaCount?: number; // 短剧数量
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryDocument extends ICategory, Document {
  _id: Types.ObjectId;
}

// 短剧筛选参数
export interface DramaFilters {
  category?: string;
  tags?: string[];
  status?: string;
  isHot?: boolean;
  isNew?: boolean;
  rating?: {
    min?: number;
    max?: number;
  };
  releaseDate?: {
    start?: Date;
    end?: Date;
  };
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'viewCount' | 'releaseDate';
  sortOrder?: 'asc' | 'desc';
}

// 短剧列表响应
export interface DramaListResponse {
  dramas: IDrama[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: DramaFilters;
}

// 推荐结果
export interface RecommendationResult {
  hot: IDrama[];
  new: IDrama[];
  trending: IDrama[];
  personalized?: IDrama[];
}

// 短剧统计信息
export interface DramaStats {
  totalDramas: number;
  totalViews: number;
  averageRating: number;
  categoryCounts: Array<{
    category: string;
    count: number;
  }>;
  statusCounts: Array<{
    status: string;
    count: number;
  }>;
}

// API响应基础类型
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

// 排序参数
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}
