import { Drama } from '../models/Drama';
import { UserPreferenceModel } from '../models/UserPreference';
import { SearchHistoryModel } from '../models/SearchHistory';
import {
  RecommendationRequest,
  RecommendationResult,
  RecommendationItem,
  RecommendationType,
  UserPreference
} from '../types/search';
import { IDrama } from '../types/drama';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';

export class RecommendationService {
  private static readonly CACHE_TTL = 3600; // 1小时
  private static readonly CACHE_KEYS = {
    RECOMMENDATION: 'recommendation',
    USER_PREFERENCE: 'user:preference',
    TRENDING: 'trending:dramas',
    SIMILAR: 'similar:dramas'
  };

  /**
   * 获取推荐内容
   */
  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResult> {
    const startTime = Date.now();
    
    try {
      const { userId, dramaId, type, limit = 10, excludeWatched = true, categories } = request;

      // 构建缓存键
      const cacheKey = this.buildCacheKey(request);
      
      // 尝试从缓存获取
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('Recommendation retrieved from cache');
          const result = JSON.parse(cached);
          result.executionTime = Date.now() - startTime;
          return result;
        }
      }

      let items: RecommendationItem[] = [];
      let algorithm = '';

      switch (type) {
        case RecommendationType.PERSONALIZED:
          if (userId) {
            items = await this.getPersonalizedRecommendations(userId, limit, excludeWatched);
            algorithm = 'collaborative_filtering + content_based';
          }
          break;
        
        case RecommendationType.SIMILAR:
          if (dramaId) {
            items = await this.getSimilarRecommendations(dramaId, limit);
            algorithm = 'content_similarity';
          }
          break;
        
        case RecommendationType.TRENDING:
          items = await this.getTrendingRecommendations(limit, categories);
          algorithm = 'trending_score';
          break;
        
        case RecommendationType.HOT:
          items = await this.getHotRecommendations(limit, categories);
          algorithm = 'popularity_score';
          break;
        
        case RecommendationType.NEW:
          items = await this.getNewRecommendations(limit, categories);
          algorithm = 'release_date';
          break;
        
        case RecommendationType.CATEGORY_BASED:
          if (categories && categories.length > 0) {
            items = await this.getCategoryBasedRecommendations(categories, limit);
            algorithm = 'category_matching';
          }
          break;
        
        default:
          items = await this.getHotRecommendations(limit);
          algorithm = 'default_hot';
      }

      const result: RecommendationResult = {
        type,
        items,
        total: items.length,
        userId,
        generatedAt: new Date(),
        algorithm,
        executionTime: Date.now() - startTime
      };

      // 缓存结果
      if (redis.isReady()) {
        await redis.set(cacheKey, JSON.stringify(result), RecommendationService.CACHE_TTL);
      }

      return result;
    } catch (error) {
      logger.error('Recommendation error:', error);
      throw error;
    }
  }

  /**
   * 获取个性化推荐
   */
  private async getPersonalizedRecommendations(
    userId: string, 
    limit: number, 
    excludeWatched: boolean
  ): Promise<RecommendationItem[]> {
    try {
      // 获取用户偏好
      const userPreference = await UserPreferenceModel.findOne({ userId });
      
      if (!userPreference) {
        // 如果没有偏好数据，返回热门推荐
        return this.getHotRecommendations(limit);
      }

      // 构建推荐查询
      const query: any = {};
      
      // 基于分类偏好
      if (userPreference.categories.length > 0) {
        const preferredCategories = userPreference.categories
          .filter(c => c.weight > 0.3)
          .map(c => c.category);
        
        if (preferredCategories.length > 0) {
          query.category = { $in: preferredCategories };
        }
      }

      // 基于评分偏好
      if (userPreference.ratingRange.preferred > 0) {
        query.rating = { $gte: Math.max(0, userPreference.ratingRange.preferred - 1) };
      }

      // 基于标签偏好
      if (userPreference.tags.length > 0) {
        const preferredTags = userPreference.tags
          .filter(t => t.weight > 0.3)
          .map(t => t.tag);
        
        if (preferredTags.length > 0) {
          query.tags = { $in: preferredTags };
        }
      }

      // 获取候选短剧
      const dramas = await Drama.find(query)
        .populate('category', 'name')
        .limit(limit * 2) // 获取更多候选项
        .lean()
        .exec();

      // 计算推荐分数并排序
      const scoredDramas = dramas.map(drama => ({
        drama: drama as IDrama,
        score: this.calculatePersonalizedScore(drama, userPreference),
        reason: this.generatePersonalizedReason(drama, userPreference),
        type: RecommendationType.PERSONALIZED
      }));

      // 按分数排序并返回指定数量
      return scoredDramas
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      logger.error('Error getting personalized recommendations:', error);
      return this.getHotRecommendations(limit);
    }
  }

  /**
   * 获取相似推荐
   */
  private async getSimilarRecommendations(dramaId: string, limit: number): Promise<RecommendationItem[]> {
    try {
      const baseDrama = await Drama.findById(dramaId).lean().exec();
      if (!baseDrama) {
        return [];
      }

      // 构建相似性查询
      const query: any = {
        _id: { $ne: dramaId }, // 排除自己
        $or: [
          { category: baseDrama.category }, // 同分类
          { tags: { $in: baseDrama.tags || [] } }, // 相同标签
          { cast: { $in: baseDrama.cast || [] } } // 相同演员
        ]
      };

      const similarDramas = await Drama.find(query)
        .populate('category', 'name')
        .limit(limit * 2)
        .lean()
        .exec();

      // 计算相似度分数
      const scoredDramas = similarDramas.map(drama => ({
        drama: drama as IDrama,
        score: this.calculateSimilarityScore(baseDrama, drama),
        reason: this.generateSimilarityReason(baseDrama, drama),
        type: RecommendationType.SIMILAR
      }));

      return scoredDramas
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      logger.error('Error getting similar recommendations:', error);
      return [];
    }
  }

  /**
   * 获取趋势推荐
   */
  private async getTrendingRecommendations(limit: number, categories?: string[]): Promise<RecommendationItem[]> {
    try {
      const query: any = {};
      
      if (categories && categories.length > 0) {
        query.category = { $in: categories };
      }

      // 计算趋势分数：最近观看量增长 + 评分
      const dramas = await Drama.find(query)
        .populate('category', 'name')
        .sort({ viewCount: -1, rating: -1, updatedAt: -1 })
        .limit(limit)
        .lean()
        .exec();

      return dramas.map(drama => ({
        drama: drama as IDrama,
        score: this.calculateTrendingScore(drama),
        reason: '正在热播，观看量快速增长',
        type: RecommendationType.TRENDING
      }));
    } catch (error) {
      logger.error('Error getting trending recommendations:', error);
      return [];
    }
  }

  /**
   * 获取热门推荐
   */
  private async getHotRecommendations(limit: number, categories?: string[]): Promise<RecommendationItem[]> {
    try {
      const query: any = { isHot: true };
      
      if (categories && categories.length > 0) {
        query.category = { $in: categories };
      }

      const dramas = await Drama.find(query)
        .populate('category', 'name')
        .sort({ rating: -1, viewCount: -1 })
        .limit(limit)
        .lean()
        .exec();

      return dramas.map(drama => ({
        drama: drama as IDrama,
        score: drama.rating * 10 + Math.log10(drama.viewCount + 1),
        reason: '热门推荐，高评分高人气',
        type: RecommendationType.HOT
      }));
    } catch (error) {
      logger.error('Error getting hot recommendations:', error);
      return [];
    }
  }

  /**
   * 获取最新推荐
   */
  private async getNewRecommendations(limit: number, categories?: string[]): Promise<RecommendationItem[]> {
    try {
      const query: any = { isNewDrama: true };
      
      if (categories && categories.length > 0) {
        query.category = { $in: categories };
      }

      const dramas = await Drama.find(query)
        .populate('category', 'name')
        .sort({ releaseDate: -1, createdAt: -1 })
        .limit(limit)
        .lean()
        .exec();

      return dramas.map(drama => ({
        drama: drama as IDrama,
        score: 80 + drama.rating, // 基础分数 + 评分
        reason: '最新上线，抢先观看',
        type: RecommendationType.NEW
      }));
    } catch (error) {
      logger.error('Error getting new recommendations:', error);
      return [];
    }
  }

  /**
   * 获取基于分类的推荐
   */
  private async getCategoryBasedRecommendations(categories: string[], limit: number): Promise<RecommendationItem[]> {
    try {
      const dramas = await Drama.find({ category: { $in: categories } })
        .populate('category', 'name')
        .sort({ rating: -1, viewCount: -1 })
        .limit(limit)
        .lean()
        .exec();

      return dramas.map(drama => ({
        drama: drama as IDrama,
        score: drama.rating * 8 + Math.log10(drama.viewCount + 1),
        reason: `${drama.category}类型推荐`,
        type: RecommendationType.CATEGORY_BASED
      }));
    } catch (error) {
      logger.error('Error getting category-based recommendations:', error);
      return [];
    }
  }

  /**
   * 计算个性化推荐分数
   */
  private calculatePersonalizedScore(drama: any, userPreference: UserPreference): number {
    let score = 0;

    // 分类匹配分数
    const categoryMatch = userPreference.categories.find(c => c.category === drama.category);
    if (categoryMatch) {
      score += categoryMatch.weight * 40;
    }

    // 标签匹配分数
    if (drama.tags && Array.isArray(drama.tags)) {
      for (const tag of drama.tags) {
        const tagMatch = userPreference.tags.find(t => t.tag === tag);
        if (tagMatch) {
          score += tagMatch.weight * 20;
        }
      }
    }

    // 演员匹配分数
    if (drama.cast && Array.isArray(drama.cast)) {
      for (const actor of drama.cast) {
        const actorMatch = userPreference.actors.find(a => a.actor === actor);
        if (actorMatch) {
          score += actorMatch.weight * 15;
        }
      }
    }

    // 评分匹配分数
    const ratingDiff = Math.abs(drama.rating - userPreference.ratingRange.preferred);
    score += Math.max(0, 25 - ratingDiff * 5);

    return Math.min(100, score);
  }

  /**
   * 计算相似度分数
   */
  private calculateSimilarityScore(baseDrama: any, targetDrama: any): number {
    let score = 0;

    // 分类相同
    if (baseDrama.category === targetDrama.category) {
      score += 30;
    }

    // 标签重叠
    if (baseDrama.tags && targetDrama.tags) {
      const commonTags = baseDrama.tags.filter((tag: string) => targetDrama.tags.includes(tag));
      score += commonTags.length * 10;
    }

    // 演员重叠
    if (baseDrama.cast && targetDrama.cast) {
      const commonCast = baseDrama.cast.filter((actor: string) => targetDrama.cast.includes(actor));
      score += commonCast.length * 15;
    }

    // 评分相近
    const ratingDiff = Math.abs(baseDrama.rating - targetDrama.rating);
    score += Math.max(0, 20 - ratingDiff * 4);

    return Math.min(100, score);
  }

  /**
   * 计算趋势分数
   */
  private calculateTrendingScore(drama: any): number {
    const viewScore = Math.log10(drama.viewCount + 1) * 10;
    const ratingScore = drama.rating * 8;
    const timeScore = this.getTimeScore(drama.updatedAt);
    
    return viewScore + ratingScore + timeScore;
  }

  /**
   * 获取时间分数（越新分数越高）
   */
  private getTimeScore(date: Date): number {
    const now = new Date();
    const daysDiff = (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 20 - daysDiff * 0.5);
  }

  /**
   * 生成个性化推荐理由
   */
  private generatePersonalizedReason(drama: any, userPreference: UserPreference): string {
    const reasons = [];

    const categoryMatch = userPreference.categories.find(c => c.category === drama.category);
    if (categoryMatch && categoryMatch.weight > 0.5) {
      reasons.push(`您喜欢${drama.category}类型`);
    }

    if (drama.rating >= userPreference.ratingRange.preferred) {
      reasons.push('高评分作品');
    }

    if (reasons.length === 0) {
      reasons.push('为您推荐');
    }

    return reasons.join('，');
  }

  /**
   * 生成相似推荐理由
   */
  private generateSimilarityReason(baseDrama: any, targetDrama: any): string {
    const reasons = [];

    if (baseDrama.category === targetDrama.category) {
      reasons.push(`同为${baseDrama.category}类型`);
    }

    if (baseDrama.cast && targetDrama.cast) {
      const commonCast = baseDrama.cast.filter((actor: string) => targetDrama.cast.includes(actor));
      if (commonCast.length > 0) {
        reasons.push(`相同演员：${commonCast[0]}`);
      }
    }

    if (reasons.length === 0) {
      reasons.push('相似内容推荐');
    }

    return reasons.join('，');
  }

  /**
   * 构建缓存键
   */
  private buildCacheKey(request: RecommendationRequest): string {
    const { userId, dramaId, type, limit, excludeWatched, categories } = request;
    const key = `${RecommendationService.CACHE_KEYS.RECOMMENDATION}:${JSON.stringify({
      userId, dramaId, type, limit, excludeWatched, categories
    })}`;
    return key.substring(0, 250);
  }
}
