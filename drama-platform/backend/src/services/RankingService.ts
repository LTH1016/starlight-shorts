import { Drama } from '../models/Drama';
import { Category } from '../models/Category';
import {
  RankingType,
  RankingResult,
  RankingItem
} from '../types/search';
import { IDrama } from '../types/drama';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';

export class RankingService {
  private static readonly CACHE_TTL = 7200; // 2小时
  private static readonly CACHE_KEYS = {
    RANKING: 'ranking',
    CATEGORY_RANKING: 'ranking:category'
  };

  /**
   * 获取榜单
   */
  async getRanking(type: RankingType, category?: string, limit = 20): Promise<RankingResult> {
    try {
      // 构建缓存键
      const cacheKey = `${RankingService.CACHE_KEYS.RANKING}:${type}:${category || 'all'}:${limit}`;
      
      // 尝试从缓存获取
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('Ranking retrieved from cache');
          return JSON.parse(cached);
        }
      }

      // 计算时间范围
      const period = this.calculatePeriod(type);
      
      // 获取榜单数据
      const items = await this.calculateRanking(type, period, category, limit);

      const result: RankingResult = {
        type,
        category,
        items,
        generatedAt: new Date(),
        period
      };

      // 缓存结果
      if (redis.isReady()) {
        await redis.set(cacheKey, JSON.stringify(result), RankingService.CACHE_TTL);
      }

      return result;
    } catch (error) {
      logger.error('Ranking error:', error);
      throw error;
    }
  }

  /**
   * 获取多个分类的榜单
   */
  async getCategoryRankings(type: RankingType, limit = 10): Promise<{ [category: string]: RankingResult }> {
    try {
      const cacheKey = `${RankingService.CACHE_KEYS.CATEGORY_RANKING}:${type}:${limit}`;
      
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('Category rankings retrieved from cache');
          return JSON.parse(cached);
        }
      }

      // 获取所有活跃分类
      const categories = await Category.find({ isActive: true })
        .select('name')
        .lean()
        .exec();

      const rankings: { [category: string]: RankingResult } = {};

      // 为每个分类生成榜单
      for (const category of categories) {
        rankings[category.name] = await this.getRanking(type, category.name, limit);
      }

      if (redis.isReady()) {
        await redis.set(cacheKey, JSON.stringify(rankings), RankingService.CACHE_TTL);
      }

      return rankings;
    } catch (error) {
      logger.error('Category rankings error:', error);
      throw error;
    }
  }

  /**
   * 计算时间范围
   */
  private calculatePeriod(type: RankingType): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);

    switch (type) {
      case RankingType.DAILY:
        start.setDate(start.getDate() - 1);
        break;
      case RankingType.WEEKLY:
        start.setDate(start.getDate() - 7);
        break;
      case RankingType.MONTHLY:
        start.setMonth(start.getMonth() - 1);
        break;
      case RankingType.ALL_TIME:
        start = new Date('2020-01-01'); // 设置一个很早的日期
        break;
    }

    return { start, end };
  }

  /**
   * 计算榜单排名
   */
  private async calculateRanking(
    type: RankingType,
    period: { start: Date; end: Date },
    category?: string,
    limit = 20
  ): Promise<RankingItem[]> {
    try {
      // 构建查询条件
      const query: any = {};
      
      if (category) {
        query.category = category;
      }

      // 根据榜单类型添加时间过滤
      if (type !== RankingType.ALL_TIME) {
        query.updatedAt = { $gte: period.start, $lte: period.end };
      }

      // 获取短剧数据
      const dramas = await Drama.find(query)
        .populate('category', 'name')
        .lean()
        .exec();

      // 计算排名分数
      const scoredDramas = dramas.map(drama => ({
        drama: drama as IDrama,
        score: this.calculateRankingScore(drama, type),
        metrics: {
          viewCount: drama.viewCount,
          rating: drama.rating,
          commentCount: drama.commentCount || 0,
          favoriteCount: drama.favoriteCount || 0
        }
      }));

      // 按分数排序
      scoredDramas.sort((a, b) => b.score - a.score);

      // 生成排名项
      const items: RankingItem[] = scoredDramas.slice(0, limit).map((item, index) => ({
        rank: index + 1,
        drama: item.drama,
        score: item.score,
        change: 0, // 简化实现，实际应该与历史数据比较
        metrics: item.metrics
      }));

      return items;
    } catch (error) {
      logger.error('Error calculating ranking:', error);
      return [];
    }
  }

  /**
   * 计算排名分数
   */
  private calculateRankingScore(drama: any, type: RankingType): number {
    let score = 0;

    // 基础分数权重
    const weights = {
      viewCount: 0.4,
      rating: 0.3,
      commentCount: 0.15,
      favoriteCount: 0.15
    };

    // 根据榜单类型调整权重
    switch (type) {
      case RankingType.DAILY:
      case RankingType.WEEKLY:
        // 短期榜单更注重观看量和互动
        weights.viewCount = 0.5;
        weights.commentCount = 0.2;
        weights.favoriteCount = 0.2;
        weights.rating = 0.1;
        break;
      case RankingType.MONTHLY:
        // 月榜平衡各项指标
        break;
      case RankingType.ALL_TIME:
        // 总榜更注重评分和收藏
        weights.rating = 0.4;
        weights.favoriteCount = 0.3;
        weights.viewCount = 0.2;
        weights.commentCount = 0.1;
        break;
    }

    // 计算加权分数
    score += Math.log10(drama.viewCount + 1) * weights.viewCount * 20;
    score += drama.rating * weights.rating * 10;
    score += Math.log10((drama.commentCount || 0) + 1) * weights.commentCount * 15;
    score += Math.log10((drama.favoriteCount || 0) + 1) * weights.favoriteCount * 15;

    // 时间衰减因子（越新的内容在短期榜单中分数越高）
    if (type === RankingType.DAILY || type === RankingType.WEEKLY) {
      const timeDecay = this.calculateTimeDecay(drama.updatedAt, type);
      score *= timeDecay;
    }

    // 热门标记加成
    if (drama.isHot) {
      score *= 1.1;
    }

    // 新剧加成
    if (drama.isNewDrama) {
      score *= 1.05;
    }

    return Math.round(score * 100) / 100;
  }

  /**
   * 计算时间衰减因子
   */
  private calculateTimeDecay(updatedAt: Date, type: RankingType): number {
    const now = new Date();
    const hoursDiff = (now.getTime() - new Date(updatedAt).getTime()) / (1000 * 60 * 60);

    switch (type) {
      case RankingType.DAILY:
        // 24小时内线性衰减
        return Math.max(0.5, 1 - hoursDiff / 48);
      case RankingType.WEEKLY:
        // 7天内线性衰减
        return Math.max(0.7, 1 - hoursDiff / (7 * 24 * 2));
      default:
        return 1;
    }
  }

  /**
   * 获取榜单变化趋势
   */
  async getRankingTrends(type: RankingType, category?: string): Promise<any> {
    try {
      // 获取当前榜单
      const currentRanking = await this.getRanking(type, category);
      
      // 获取历史榜单（简化实现，实际应该存储历史数据）
      const previousPeriod = this.calculatePreviousPeriod(type);
      const previousRanking = await this.calculateRanking(type, previousPeriod, category);

      // 计算排名变化
      const trends = currentRanking.items.map(currentItem => {
        const previousItem = previousRanking.find(p => p.drama._id.toString() === currentItem.drama._id.toString());
        const previousRank = previousItem ? previousItem.rank : null;
        
        let change = 0;
        if (previousRank) {
          change = previousRank - currentItem.rank; // 正数表示上升
        }

        return {
          ...currentItem,
          change,
          isNew: !previousRank
        };
      });

      return {
        ...currentRanking,
        items: trends
      };
    } catch (error) {
      logger.error('Error getting ranking trends:', error);
      throw error;
    }
  }

  /**
   * 计算上一个周期
   */
  private calculatePreviousPeriod(type: RankingType): { start: Date; end: Date } {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    switch (type) {
      case RankingType.DAILY:
        start.setDate(start.getDate() - 2);
        end.setDate(end.getDate() - 1);
        break;
      case RankingType.WEEKLY:
        start.setDate(start.getDate() - 14);
        end.setDate(end.getDate() - 7);
        break;
      case RankingType.MONTHLY:
        start.setMonth(start.getMonth() - 2);
        end.setMonth(end.getMonth() - 1);
        break;
      case RankingType.ALL_TIME:
        start = new Date('2020-01-01');
        end.setMonth(end.getMonth() - 1);
        break;
    }

    return { start, end };
  }

  /**
   * 清除榜单缓存
   */
  async clearRankingCache(): Promise<void> {
    if (!redis.isReady()) {
      return;
    }

    try {
      // 简化实现，直接删除特定键
      const keyPatterns = [
        `${RankingService.CACHE_KEYS.RANKING}:daily`,
        `${RankingService.CACHE_KEYS.RANKING}:weekly`,
        `${RankingService.CACHE_KEYS.RANKING}:monthly`,
        `${RankingService.CACHE_KEYS.RANKING}:all_time`,
        `${RankingService.CACHE_KEYS.CATEGORY_RANKING}:daily`,
        `${RankingService.CACHE_KEYS.CATEGORY_RANKING}:weekly`,
        `${RankingService.CACHE_KEYS.CATEGORY_RANKING}:monthly`,
        `${RankingService.CACHE_KEYS.CATEGORY_RANKING}:all_time`
      ];

      for (const key of keyPatterns) {
        await redis.del(key);
      }

      logger.info(`Cleared ranking cache entries`);
    } catch (error) {
      logger.error('Error clearing ranking cache:', error);
    }
  }
}
