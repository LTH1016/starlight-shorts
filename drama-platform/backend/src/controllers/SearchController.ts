import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { SearchService } from '../services/SearchService';
import { RecommendationService } from '../services/RecommendationService';
import { RankingService } from '../services/RankingService';
import { UserPreferenceModel } from '../models/UserPreference';
import { 
  SearchRequest, 
  RecommendationRequest, 
  RecommendationType,
  RankingType,
  SearchType,
  SortBy,
  SortOrder
} from '../types/search';
import { ApiResponse } from '../types/drama';
import { logger } from '../utils/logger';

export class SearchController {
  private searchService: SearchService;
  private recommendationService: RecommendationService;
  private rankingService: RankingService;

  constructor() {
    this.searchService = new SearchService();
    this.recommendationService = new RecommendationService();
    this.rankingService = new RankingService();
  }

  /**
   * 执行搜索
   */
  search = async (req: Request, res: Response): Promise<void> => {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(this.createErrorResponse('参数验证失败', errors.array()));
        return;
      }

      const { q: query } = req.query;
      if (!query || typeof query !== 'string') {
        res.status(400).json(this.createErrorResponse('搜索关键词不能为空'));
        return;
      }

      const searchRequest: SearchRequest = {
        query,
        filters: {
          type: req.query.type as SearchType,
          category: req.query.category as string,
          tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
          minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
          maxRating: req.query.maxRating ? parseFloat(req.query.maxRating as string) : undefined,
          minViewCount: req.query.minViewCount ? parseInt(req.query.minViewCount as string) : undefined,
          maxViewCount: req.query.maxViewCount ? parseInt(req.query.maxViewCount as string) : undefined,
          releaseDateFrom: req.query.releaseDateFrom ? new Date(req.query.releaseDateFrom as string) : undefined,
          releaseDateTo: req.query.releaseDateTo ? new Date(req.query.releaseDateTo as string) : undefined,
          isHot: req.query.isHot ? req.query.isHot === 'true' : undefined,
          isNew: req.query.isNew ? req.query.isNew === 'true' : undefined,
          sortBy: req.query.sortBy as SortBy,
          sortOrder: req.query.sortOrder as SortOrder,
          page: req.query.page ? parseInt(req.query.page as string) : 1,
          limit: req.query.limit ? parseInt(req.query.limit as string) : 20
        },
        userId: req.user?._id.toString()
      };

      const result = await this.searchService.search(searchRequest);

      res.json(this.createSuccessResponse('搜索成功', result));
    } catch (error: any) {
      logger.error('Error in search:', error);
      res.status(500).json(this.createErrorResponse('搜索失败'));
    }
  };

  /**
   * 获取搜索建议
   */
  getSuggestions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q: query } = req.query;
      if (!query || typeof query !== 'string' || query.length < 2) {
        res.json(this.createSuccessResponse('获取建议成功', []));
        return;
      }

      const suggestions = await this.searchService.getSearchSuggestions(query);

      res.json(this.createSuccessResponse('获取建议成功', suggestions));
    } catch (error: any) {
      logger.error('Error in getSuggestions:', error);
      res.status(500).json(this.createErrorResponse('获取建议失败'));
    }
  };

  /**
   * 获取热门搜索词
   */
  getPopularSearches = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const popularSearches = await this.searchService.getPopularSearches(limit);

      res.json(this.createSuccessResponse('获取热门搜索成功', popularSearches));
    } catch (error: any) {
      logger.error('Error in getPopularSearches:', error);
      res.status(500).json(this.createErrorResponse('获取热门搜索失败'));
    }
  };

  /**
   * 获取推荐内容
   */
  getRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
      if (!Object.values(RecommendationType).includes(type as RecommendationType)) {
        res.status(400).json(this.createErrorResponse('无效的推荐类型'));
        return;
      }

      const request: RecommendationRequest = {
        userId: req.user?._id.toString(),
        dramaId: req.query.dramaId as string,
        type: type as RecommendationType,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        excludeWatched: req.query.excludeWatched !== 'false',
        categories: req.query.categories ? (req.query.categories as string).split(',') : undefined
      };

      const result = await this.recommendationService.getRecommendations(request);

      res.json(this.createSuccessResponse('获取推荐成功', result));
    } catch (error: any) {
      logger.error('Error in getRecommendations:', error);
      res.status(500).json(this.createErrorResponse('获取推荐失败'));
    }
  };

  /**
   * 获取个性化推荐
   */
  getPersonalizedRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(this.createErrorResponse('需要登录'));
        return;
      }

      const request: RecommendationRequest = {
        userId: req.user._id.toString(),
        type: RecommendationType.PERSONALIZED,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        excludeWatched: req.query.excludeWatched !== 'false'
      };

      const result = await this.recommendationService.getRecommendations(request);

      res.json(this.createSuccessResponse('获取个性化推荐成功', result));
    } catch (error: any) {
      logger.error('Error in getPersonalizedRecommendations:', error);
      res.status(500).json(this.createErrorResponse('获取个性化推荐失败'));
    }
  };

  /**
   * 获取相似推荐
   */
  getSimilarRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { dramaId } = req.params;
      if (!dramaId) {
        res.status(400).json(this.createErrorResponse('短剧ID不能为空'));
        return;
      }

      const request: RecommendationRequest = {
        dramaId,
        type: RecommendationType.SIMILAR,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };

      const result = await this.recommendationService.getRecommendations(request);

      res.json(this.createSuccessResponse('获取相似推荐成功', result));
    } catch (error: any) {
      logger.error('Error in getSimilarRecommendations:', error);
      res.status(500).json(this.createErrorResponse('获取相似推荐失败'));
    }
  };

  /**
   * 获取榜单
   */
  getRanking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
      if (!Object.values(RankingType).includes(type as RankingType)) {
        res.status(400).json(this.createErrorResponse('无效的榜单类型'));
        return;
      }

      const category = req.query.category as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await this.rankingService.getRanking(type as RankingType, category, limit);

      res.json(this.createSuccessResponse('获取榜单成功', result));
    } catch (error: any) {
      logger.error('Error in getRanking:', error);
      res.status(500).json(this.createErrorResponse('获取榜单失败'));
    }
  };

  /**
   * 获取分类榜单
   */
  getCategoryRankings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
      if (!Object.values(RankingType).includes(type as RankingType)) {
        res.status(400).json(this.createErrorResponse('无效的榜单类型'));
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await this.rankingService.getCategoryRankings(type as RankingType, limit);

      res.json(this.createSuccessResponse('获取分类榜单成功', result));
    } catch (error: any) {
      logger.error('Error in getCategoryRankings:', error);
      res.status(500).json(this.createErrorResponse('获取分类榜单失败'));
    }
  };

  /**
   * 获取榜单趋势
   */
  getRankingTrends = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
      if (!Object.values(RankingType).includes(type as RankingType)) {
        res.status(400).json(this.createErrorResponse('无效的榜单类型'));
        return;
      }

      const category = req.query.category as string;

      const result = await this.rankingService.getRankingTrends(type as RankingType, category);

      res.json(this.createSuccessResponse('获取榜单趋势成功', result));
    } catch (error: any) {
      logger.error('Error in getRankingTrends:', error);
      res.status(500).json(this.createErrorResponse('获取榜单趋势失败'));
    }
  };

  /**
   * 获取用户偏好
   */
  getUserPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(this.createErrorResponse('需要登录'));
        return;
      }

      const preferences = await UserPreferenceModel.getOrCreateUserPreference(req.user._id.toString());

      res.json(this.createSuccessResponse('获取用户偏好成功', preferences));
    } catch (error: any) {
      logger.error('Error in getUserPreferences:', error);
      res.status(500).json(this.createErrorResponse('获取用户偏好失败'));
    }
  };

  /**
   * 更新用户偏好
   */
  updateUserPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(this.createErrorResponse('需要登录'));
        return;
      }

      const { dramaId, action } = req.body;
      if (!dramaId || !action) {
        res.status(400).json(this.createErrorResponse('短剧ID和操作类型不能为空'));
        return;
      }

      // 获取短剧信息
      const { Drama } = await import('../models/Drama');
      const drama = await Drama.findById(dramaId).lean().exec();
      if (!drama) {
        res.status(404).json(this.createErrorResponse('短剧不存在'));
        return;
      }

      // 更新用户偏好
      const preferences = await UserPreferenceModel.updatePreferenceFromDrama(
        req.user._id.toString(),
        drama,
        action
      );

      res.json(this.createSuccessResponse('更新用户偏好成功', preferences));
    } catch (error: any) {
      logger.error('Error in updateUserPreferences:', error);
      res.status(500).json(this.createErrorResponse('更新用户偏好失败'));
    }
  };

  /**
   * 创建成功响应
   */
  private createSuccessResponse<T>(message: string, data?: T): ApiResponse<T> {
    return {
      success: true,
      message,
      data: data as T,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 创建错误响应
   */
  private createErrorResponse(message: string, error?: any): ApiResponse {
    return {
      success: false,
      message,
      error: error || undefined,
      timestamp: new Date().toISOString()
    };
  }
}
