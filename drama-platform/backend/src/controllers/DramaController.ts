import { Request, Response } from 'express';
import { DramaService } from '../services/DramaService';
import { DramaFilters, ApiResponse } from '../types/drama';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

export class DramaController {
  private dramaService: DramaService;

  constructor() {
    this.dramaService = new DramaService();
  }

  /**
   * 获取短剧列表
   */
  getDramas = async (req: Request, res: Response): Promise<void> => {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(this.createErrorResponse('参数验证失败', errors.array()));
        return;
      }

      const filters: DramaFilters = {
        category: req.query.category as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        status: req.query.status as string,
        isHot: req.query.isHot === 'true',
        isNew: req.query.isNew === 'true',
        rating: req.query.minRating || req.query.maxRating ? {
          min: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
          max: req.query.maxRating ? parseFloat(req.query.maxRating as string) : undefined
        } as { min?: number; max?: number } : undefined,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 20, 100), // 最大100条
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };

      const result = await this.dramaService.getDramas(filters);
      
      res.json(this.createSuccessResponse('获取短剧列表成功', result));
    } catch (error) {
      logger.error('Error in getDramas:', error);
      res.status(500).json(this.createErrorResponse('服务器内部错误'));
    }
  };

  /**
   * 获取短剧详情
   */
  getDramaById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json(this.createErrorResponse('短剧ID不能为空'));
        return;
      }

      const drama = await this.dramaService.getDramaById(id);
      
      if (!drama) {
        res.status(404).json(this.createErrorResponse('短剧不存在'));
        return;
      }

      res.json(this.createSuccessResponse('获取短剧详情成功', drama));
    } catch (error) {
      logger.error('Error in getDramaById:', error);
      res.status(500).json(this.createErrorResponse('服务器内部错误'));
    }
  };

  /**
   * 搜索短剧
   */
  searchDramas = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q: query } = req.query;
      
      if (!query || typeof query !== 'string') {
        res.status(400).json(this.createErrorResponse('搜索关键词不能为空'));
        return;
      }

      const filters: Partial<DramaFilters> = {
        category: req.query.category as string,
        limit: Math.min(parseInt(req.query.limit as string) || 20, 100)
      };

      const dramas = await this.dramaService.searchDramas(query, filters);
      
      res.json(this.createSuccessResponse('搜索成功', {
        query,
        results: dramas,
        count: dramas.length
      }));
    } catch (error) {
      logger.error('Error in searchDramas:', error);
      res.status(500).json(this.createErrorResponse('服务器内部错误'));
    }
  };

  /**
   * 获取推荐短剧
   */
  getRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      const recommendations = await this.dramaService.getRecommendations();
      
      res.json(this.createSuccessResponse('获取推荐成功', recommendations));
    } catch (error) {
      logger.error('Error in getRecommendations:', error);
      res.status(500).json(this.createErrorResponse('服务器内部错误'));
    }
  };

  /**
   * 获取热门短剧
   */
  getHotDramas = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const dramas = await this.dramaService.getHotDramas(limit);
      
      res.json(this.createSuccessResponse('获取热门短剧成功', dramas));
    } catch (error) {
      logger.error('Error in getHotDramas:', error);
      res.status(500).json(this.createErrorResponse('服务器内部错误'));
    }
  };

  /**
   * 获取最新短剧
   */
  getNewDramas = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const dramas = await this.dramaService.getNewDramas(limit);
      
      res.json(this.createSuccessResponse('获取最新短剧成功', dramas));
    } catch (error) {
      logger.error('Error in getNewDramas:', error);
      res.status(500).json(this.createErrorResponse('服务器内部错误'));
    }
  };

  /**
   * 获取趋势短剧
   */
  getTrendingDramas = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const dramas = await this.dramaService.getTrendingDramas(limit);
      
      res.json(this.createSuccessResponse('获取趋势短剧成功', dramas));
    } catch (error) {
      logger.error('Error in getTrendingDramas:', error);
      res.status(500).json(this.createErrorResponse('服务器内部错误'));
    }
  };

  /**
   * 增加观看次数
   */
  incrementViewCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json(this.createErrorResponse('短剧ID不能为空'));
        return;
      }

      await this.dramaService.incrementViewCount(id);
      
      res.json(this.createSuccessResponse('观看次数更新成功'));
    } catch (error) {
      logger.error('Error in incrementViewCount:', error);
      res.status(500).json(this.createErrorResponse('服务器内部错误'));
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
