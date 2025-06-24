import mongoose, { Document, Types } from 'mongoose';
import { IDrama } from './drama';
import { IUser } from './user';

// 搜索类型枚举
export enum SearchType {
  ALL = 'all',
  DRAMA = 'drama',
  USER = 'user',
  CATEGORY = 'category'
}

// 排序方式枚举
export enum SortBy {
  RELEVANCE = 'relevance',
  RATING = 'rating',
  VIEW_COUNT = 'viewCount',
  RELEASE_DATE = 'releaseDate',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}

// 排序方向枚举
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

// 搜索过滤器
export interface SearchFilters {
  type?: SearchType;
  category?: string;
  tags?: string[];
  minRating?: number;
  maxRating?: number;
  minViewCount?: number;
  maxViewCount?: number;
  releaseDateFrom?: Date;
  releaseDateTo?: Date;
  isHot?: boolean;
  isNew?: boolean;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

// 搜索请求
export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  userId?: string; // 用于个性化搜索
}

// 搜索结果项
export interface SearchResultItem {
  id: string;
  type: SearchType;
  title: string;
  description?: string;
  thumbnail?: string;
  score: number; // 相关性评分
  highlights?: string[]; // 高亮片段
  metadata?: any; // 额外元数据
}

// 搜索结果
export interface SearchResult {
  query: string;
  total: number;
  items: SearchResultItem[];
  pagination: {
    page: number;
    limit: number;
    pages: number;
  };
  filters: SearchFilters;
  suggestions?: string[]; // 搜索建议
  facets?: SearchFacets; // 搜索分面
  executionTime: number; // 执行时间(ms)
}

// 搜索分面（用于筛选统计）
export interface SearchFacets {
  categories: Array<{
    name: string;
    count: number;
  }>;
  ratings: Array<{
    range: string;
    count: number;
  }>;
  years: Array<{
    year: number;
    count: number;
  }>;
  tags: Array<{
    tag: string;
    count: number;
  }>;
}

// 搜索建议
export interface SearchSuggestion {
  text: string;
  type: SearchType;
  count: number;
  score: number;
}

// 热门搜索词
export interface PopularSearch {
  keyword: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  category?: string;
}

// 搜索历史
export interface SearchHistory {
  userId: Types.ObjectId;
  query: string;
  filters?: SearchFilters;
  resultCount: number;
  clickedItems?: string[]; // 点击的结果ID
  timestamp: Date;
}

// 推荐类型枚举
export enum RecommendationType {
  PERSONALIZED = 'personalized', // 个性化推荐
  SIMILAR = 'similar', // 相似推荐
  TRENDING = 'trending', // 趋势推荐
  HOT = 'hot', // 热门推荐
  NEW = 'new', // 最新推荐
  CATEGORY_BASED = 'category_based', // 基于分类推荐
  COLLABORATIVE = 'collaborative', // 协同过滤推荐
  CONTENT_BASED = 'content_based' // 基于内容推荐
}

// 推荐请求
export interface RecommendationRequest {
  userId?: string;
  dramaId?: string; // 基于某个短剧推荐相似内容
  type: RecommendationType;
  limit?: number;
  excludeWatched?: boolean; // 排除已观看
  categories?: string[]; // 指定分类
}

// 推荐结果项
export interface RecommendationItem {
  drama: IDrama;
  score: number; // 推荐评分
  reason: string; // 推荐理由
  type: RecommendationType;
}

// 推荐结果
export interface RecommendationResult {
  type: RecommendationType;
  items: RecommendationItem[];
  total: number;
  userId?: string;
  generatedAt: Date;
  algorithm: string; // 使用的算法
  executionTime: number;
}

// 用户偏好分析
export interface UserPreference {
  userId: Types.ObjectId;
  categories: Array<{
    category: string;
    weight: number; // 权重 0-1
  }>;
  tags: Array<{
    tag: string;
    weight: number;
  }>;
  actors: Array<{
    actor: string;
    weight: number;
  }>;
  ratingRange: {
    min: number;
    max: number;
    preferred: number;
  };
  viewingTime: {
    totalMinutes: number;
    averageSession: number;
    preferredDuration: number;
  };
  lastUpdated: Date;
}

// 热门榜单类型
export enum RankingType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'all_time'
}

// 榜单项
export interface RankingItem {
  rank: number;
  drama: IDrama;
  score: number;
  change: number; // 排名变化 (+1, -1, 0)
  metrics: {
    viewCount: number;
    rating: number;
    commentCount: number;
    favoriteCount: number;
  };
}

// 榜单结果
export interface RankingResult {
  type: RankingType;
  category?: string;
  items: RankingItem[];
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
}

// 搜索分析数据
export interface SearchAnalytics {
  keyword: string;
  searchCount: number;
  clickCount: number;
  clickThroughRate: number;
  avgPosition: number; // 平均点击位置
  noResultsCount: number;
  period: {
    start: Date;
    end: Date;
  };
}

// 推荐效果分析
export interface RecommendationAnalytics {
  type: RecommendationType;
  impressions: number; // 展示次数
  clicks: number; // 点击次数
  conversions: number; // 转化次数（观看）
  clickThroughRate: number;
  conversionRate: number;
  avgScore: number;
  period: {
    start: Date;
    end: Date;
  };
}
