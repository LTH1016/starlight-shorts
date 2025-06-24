import { Drama } from '../models/Drama';
import { Category } from '../models/Category';
import { 
  IDrama, 
  DramaFilters, 
  DramaListResponse, 
  RecommendationResult,
  PaginationParams,
  SortParams 
} from '../types/drama';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';

export class DramaService {
  private static readonly CACHE_TTL = 1800; // 30分钟
  private static readonly CACHE_KEYS = {
    DRAMA_LIST: 'drama:list',
    DRAMA_DETAIL: 'drama:detail',
    HOT_DRAMAS: 'drama:hot',
    NEW_DRAMAS: 'drama:new',
    TRENDING_DRAMAS: 'drama:trending',
    CATEGORIES: 'categories:active'
  };

  /**
   * 获取短剧列表
   */
  async getDramas(filters: DramaFilters): Promise<DramaListResponse> {
    try {
      const { page = 1, limit = 20 } = filters;
      const skip = (page - 1) * limit;

      // 构建查询条件
      const query = this.buildQuery(filters);
      
      // 构建排序条件
      const sort = this.buildSort(filters);

      // 尝试从缓存获取
      const cacheKey = `${DramaService.CACHE_KEYS.DRAMA_LIST}:${JSON.stringify({ query, sort, skip, limit })}`;
      
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('Drama list retrieved from cache');
          return JSON.parse(cached);
        }
      }

      // 执行查询
      const [dramas, total] = await Promise.all([
        Drama.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        Drama.countDocuments(query)
      ]);

      const result: DramaListResponse = {
        dramas: dramas as IDrama[],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        filters
      };

      // 缓存结果
      if (redis.isReady()) {
        await redis.set(cacheKey, JSON.stringify(result), DramaService.CACHE_TTL);
      }

      return result;
    } catch (error) {
      logger.error('Error getting dramas:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取短剧详情
   */
  async getDramaById(id: string): Promise<IDrama | null> {
    try {
      const cacheKey = `${DramaService.CACHE_KEYS.DRAMA_DETAIL}:${id}`;
      
      // 尝试从缓存获取
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug(`Drama ${id} retrieved from cache`);
          return JSON.parse(cached);
        }
      }

      const drama = await Drama.findById(id).lean().exec();
      
      if (drama) {
        // 缓存结果
        if (redis.isReady()) {
          await redis.set(cacheKey, JSON.stringify(drama), DramaService.CACHE_TTL);
        }
      }

      return drama as IDrama;
    } catch (error) {
      logger.error(`Error getting drama ${id}:`, error);
      throw error;
    }
  }

  /**
   * 搜索短剧
   */
  async searchDramas(query: string, filters: Partial<DramaFilters> = {}): Promise<IDrama[]> {
    try {
      const searchQuery = {
        $text: { $search: query },
        ...this.buildQuery(filters)
      };

      const dramas = await Drama.find(searchQuery)
        .sort({ score: { $meta: 'textScore' }, rating: -1 })
        .limit(filters.limit || 20)
        .lean()
        .exec();

      return dramas as IDrama[];
    } catch (error) {
      logger.error('Error searching dramas:', error);
      throw error;
    }
  }

  /**
   * 获取推荐短剧
   */
  async getRecommendations(): Promise<RecommendationResult> {
    try {
      const cacheKey = 'recommendations:all';
      
      // 尝试从缓存获取
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('Recommendations retrieved from cache');
          return JSON.parse(cached);
        }
      }

      const [hot, newDramas, trending] = await Promise.all([
        this.getHotDramas(),
        this.getNewDramas(),
        this.getTrendingDramas()
      ]);

      const result: RecommendationResult = {
        hot,
        new: newDramas,
        trending
      };

      // 缓存结果
      if (redis.isReady()) {
        await redis.set(cacheKey, JSON.stringify(result), DramaService.CACHE_TTL);
      }

      return result;
    } catch (error) {
      logger.error('Error getting recommendations:', error);
      throw error;
    }
  }

  /**
   * 获取热门短剧
   */
  async getHotDramas(limit = 10): Promise<IDrama[]> {
    try {
      // 临时禁用缓存进行测试
      // const cacheKey = `${DramaService.CACHE_KEYS.HOT_DRAMAS}:${limit}`;

      // if (redis.isReady()) {
      //   const cached = await redis.get(cacheKey);
      //   if (cached) {
      //     return JSON.parse(cached);
      //   }
      // }

      const dramas = await Drama.find({ isHot: true })
        .sort({ viewCount: -1, rating: -1 })
        .limit(limit)
        .lean()
        .exec();

      // if (redis.isReady()) {
      //   await redis.set(cacheKey, JSON.stringify(dramas), DramaService.CACHE_TTL);
      // }

      return dramas as IDrama[];
    } catch (error) {
      logger.error('Error getting hot dramas:', error);
      throw error;
    }
  }

  /**
   * 获取最新短剧
   */
  async getNewDramas(limit = 10): Promise<IDrama[]> {
    try {
      const cacheKey = `${DramaService.CACHE_KEYS.NEW_DRAMAS}:${limit}`;
      
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const dramas = await Drama.find({ isNewDrama: true })
        .sort({ releaseDate: -1 })
        .limit(limit)
        .lean()
        .exec();

      if (redis.isReady()) {
        await redis.set(cacheKey, JSON.stringify(dramas), DramaService.CACHE_TTL);
      }

      return dramas as IDrama[];
    } catch (error) {
      logger.error('Error getting new dramas:', error);
      throw error;
    }
  }

  /**
   * 获取趋势短剧
   */
  async getTrendingDramas(limit = 10): Promise<IDrama[]> {
    try {
      const cacheKey = `${DramaService.CACHE_KEYS.TRENDING_DRAMAS}:${limit}`;
      
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const dramas = await Drama.find({
        releaseDate: { $gte: sevenDaysAgo }
      })
        .sort({ viewCount: -1, rating: -1 })
        .limit(limit)
        .lean()
        .exec();

      if (redis.isReady()) {
        await redis.set(cacheKey, JSON.stringify(dramas), DramaService.CACHE_TTL);
      }

      return dramas as IDrama[];
    } catch (error) {
      logger.error('Error getting trending dramas:', error);
      throw error;
    }
  }

  /**
   * 构建查询条件
   */
  private buildQuery(filters: Partial<DramaFilters>): any {
    const query: any = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.isHot !== undefined) {
      query.isHot = filters.isHot;
    }

    if (filters.isNew !== undefined) {
      query.isNewDrama = filters.isNew;
    }

    if (filters.rating) {
      const ratingQuery: any = {};
      if (filters.rating.min !== undefined) {
        ratingQuery.$gte = filters.rating.min;
      }
      if (filters.rating.max !== undefined) {
        ratingQuery.$lte = filters.rating.max;
      }
      if (Object.keys(ratingQuery).length > 0) {
        query.rating = ratingQuery;
      }
    }

    if (filters.releaseDate) {
      const dateQuery: any = {};
      if (filters.releaseDate.start) {
        dateQuery.$gte = filters.releaseDate.start;
      }
      if (filters.releaseDate.end) {
        dateQuery.$lte = filters.releaseDate.end;
      }
      if (Object.keys(dateQuery).length > 0) {
        query.releaseDate = dateQuery;
      }
    }

    return query;
  }

  /**
   * 构建排序条件
   */
  private buildSort(filters: Partial<DramaFilters>): any {
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    
    return { [sortBy]: sortOrder };
  }

  /**
   * 增加观看次数
   */
  async incrementViewCount(id: string): Promise<void> {
    try {
      await Drama.findByIdAndUpdate(
        id,
        { $inc: { viewCount: 1 } },
        { new: true }
      );

      // 清除相关缓存
      if (redis.isReady()) {
        const patterns = [
          `${DramaService.CACHE_KEYS.DRAMA_DETAIL}:${id}`,
          `${DramaService.CACHE_KEYS.DRAMA_LIST}:*`,
          `${DramaService.CACHE_KEYS.HOT_DRAMAS}:*`,
          `${DramaService.CACHE_KEYS.TRENDING_DRAMAS}:*`
        ];
        
        for (const pattern of patterns) {
          await redis.del(pattern);
        }
      }
    } catch (error) {
      logger.error(`Error incrementing view count for drama ${id}:`, error);
      throw error;
    }
  }
}
