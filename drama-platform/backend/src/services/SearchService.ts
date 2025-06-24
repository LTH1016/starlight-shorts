import { Drama } from '../models/Drama';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { SearchHistoryModel } from '../models/SearchHistory';
import { UserPreferenceModel } from '../models/UserPreference';
import {
  SearchRequest,
  SearchResult,
  SearchResultItem,
  SearchType,
  SortBy,
  SortOrder,
  SearchFacets,
  PopularSearch
} from '../types/search';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';

export class SearchService {
  private static readonly CACHE_TTL = 1800; // 30分钟
  private static readonly CACHE_KEYS = {
    SEARCH_RESULT: 'search:result',
    POPULAR_SEARCHES: 'search:popular',
    SUGGESTIONS: 'search:suggestions',
    FACETS: 'search:facets'
  };

  /**
   * 执行搜索
   */
  async search(request: SearchRequest): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      const { query, filters = {}, userId } = request;
      const { page = 1, limit = 20 } = filters;

      // 构建缓存键
      const cacheKey = this.buildCacheKey(request);
      
      // 尝试从缓存获取
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('Search result retrieved from cache');
          const result = JSON.parse(cached);
          result.executionTime = Date.now() - startTime;
          return result;
        }
      }

      // 执行搜索
      const searchResults = await this.performSearch(query, filters);
      
      // 计算分页
      const total = searchResults.length;
      const skip = (page - 1) * limit;
      const items = searchResults.slice(skip, skip + limit);

      // 获取搜索分面和建议
      const [facets, suggestions] = await Promise.all([
        this.getSearchFacets(query, filters),
        this.getSearchSuggestions(query)
      ]);

      const result: SearchResult = {
        query,
        total,
        items,
        pagination: {
          page,
          limit,
          pages: Math.ceil(total / limit)
        },
        filters,
        suggestions,
        facets,
        executionTime: Date.now() - startTime
      };

      // 缓存结果
      if (redis.isReady()) {
        await redis.set(cacheKey, JSON.stringify(result), SearchService.CACHE_TTL);
      }

      // 记录搜索历史
      if (userId) {
        await this.recordSearchHistory(userId, query, filters, total);
      }

      return result;
    } catch (error) {
      logger.error('Search error:', error);
      throw error;
    }
  }

  /**
   * 执行实际搜索
   */
  private async performSearch(query: string, filters: any): Promise<SearchResultItem[]> {
    const results: SearchResultItem[] = [];

    // 搜索短剧
    if (!filters.type || filters.type === SearchType.ALL || filters.type === SearchType.DRAMA) {
      const dramaResults = await this.searchDramas(query, filters);
      results.push(...dramaResults);
    }

    // 搜索用户
    if (!filters.type || filters.type === SearchType.ALL || filters.type === SearchType.USER) {
      const userResults = await this.searchUsers(query, filters);
      results.push(...userResults);
    }

    // 搜索分类
    if (!filters.type || filters.type === SearchType.ALL || filters.type === SearchType.CATEGORY) {
      const categoryResults = await this.searchCategories(query, filters);
      results.push(...categoryResults);
    }

    // 按相关性排序
    return this.sortResults(results, filters);
  }

  /**
   * 搜索短剧
   */
  private async searchDramas(query: string, filters: any): Promise<SearchResultItem[]> {
    const searchQuery: any = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
        { cast: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    // 应用过滤器
    if (filters.category) {
      searchQuery.category = filters.category;
    }

    if (filters.tags && filters.tags.length > 0) {
      searchQuery.tags = { $in: filters.tags };
    }

    if (filters.minRating !== undefined) {
      searchQuery.rating = { $gte: filters.minRating };
    }

    if (filters.maxRating !== undefined) {
      searchQuery.rating = { ...searchQuery.rating, $lte: filters.maxRating };
    }

    if (filters.minViewCount !== undefined) {
      searchQuery.viewCount = { $gte: filters.minViewCount };
    }

    if (filters.maxViewCount !== undefined) {
      searchQuery.viewCount = { ...searchQuery.viewCount, $lte: filters.maxViewCount };
    }

    if (filters.releaseDateFrom || filters.releaseDateTo) {
      searchQuery.releaseDate = {};
      if (filters.releaseDateFrom) {
        searchQuery.releaseDate.$gte = filters.releaseDateFrom;
      }
      if (filters.releaseDateTo) {
        searchQuery.releaseDate.$lte = filters.releaseDateTo;
      }
    }

    if (filters.isHot !== undefined) {
      searchQuery.isHot = filters.isHot;
    }

    if (filters.isNew !== undefined) {
      searchQuery.isNewDrama = filters.isNew;
    }

    const dramas = await Drama.find(searchQuery)
      .populate('category', 'name')
      .lean()
      .exec();

    return dramas.map(drama => ({
      id: drama._id.toString(),
      type: SearchType.DRAMA,
      title: drama.title,
      description: drama.description,
      thumbnail: drama.poster,
      score: this.calculateRelevanceScore(query, drama.title, drama.description),
      highlights: this.generateHighlights(query, [drama.title, drama.description]),
      metadata: {
        category: drama.category,
        rating: drama.rating,
        viewCount: drama.viewCount,
        releaseDate: drama.releaseDate,
        tags: drama.tags
      }
    }));
  }

  /**
   * 搜索用户
   */
  private async searchUsers(query: string, filters: any): Promise<SearchResultItem[]> {
    const searchQuery = {
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { 'profile.nickname': { $regex: query, $options: 'i' } },
        { 'profile.bio': { $regex: query, $options: 'i' } }
      ],
      status: 'active'
    };

    const users = await User.find(searchQuery)
      .select('username profile.nickname profile.bio avatar role createdAt')
      .lean()
      .exec();

    return users.map(user => ({
      id: user._id.toString(),
      type: SearchType.USER,
      title: user.profile?.nickname || user.username,
      description: user.profile?.bio,
      thumbnail: user.avatar,
      score: this.calculateRelevanceScore(query, user.username, user.profile?.nickname),
      highlights: this.generateHighlights(query, [user.username, user.profile?.nickname, user.profile?.bio]),
      metadata: {
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }
    }));
  }

  /**
   * 搜索分类
   */
  private async searchCategories(query: string, filters: any): Promise<SearchResultItem[]> {
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    };

    const categories = await Category.find(searchQuery)
      .lean()
      .exec();

    return categories.map(category => ({
      id: category._id.toString(),
      type: SearchType.CATEGORY,
      title: category.name,
      description: category.description,
      thumbnail: category.icon,
      score: this.calculateRelevanceScore(query, category.name, category.description),
      highlights: this.generateHighlights(query, [category.name, category.description]),
      metadata: {
        dramaCount: category.dramaCount,
        color: category.color,
        sortOrder: category.sortOrder
      }
    }));
  }

  /**
   * 计算相关性评分
   */
  private calculateRelevanceScore(query: string, title: string, description?: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    const titleLower = title.toLowerCase();
    const descLower = description?.toLowerCase() || '';

    // 标题完全匹配
    if (titleLower === queryLower) {
      score += 100;
    }
    // 标题包含查询词
    else if (titleLower.includes(queryLower)) {
      score += 80;
    }
    // 标题以查询词开头
    else if (titleLower.startsWith(queryLower)) {
      score += 60;
    }

    // 描述包含查询词
    if (descLower.includes(queryLower)) {
      score += 20;
    }

    // 字符串相似度加分
    score += this.calculateStringSimilarity(queryLower, titleLower) * 40;

    return Math.min(100, score);
  }

  /**
   * 计算字符串相似度
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 计算编辑距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * 生成高亮片段
   */
  private generateHighlights(query: string, texts: (string | undefined)[]): string[] {
    const highlights: string[] = [];
    const queryLower = query.toLowerCase();

    for (const text of texts) {
      if (!text) continue;
      
      const textLower = text.toLowerCase();
      const index = textLower.indexOf(queryLower);
      
      if (index !== -1) {
        const start = Math.max(0, index - 20);
        const end = Math.min(text.length, index + query.length + 20);
        let highlight = text.substring(start, end);
        
        if (start > 0) highlight = '...' + highlight;
        if (end < text.length) highlight = highlight + '...';
        
        highlights.push(highlight);
      }
    }

    return highlights;
  }

  /**
   * 排序搜索结果
   */
  private sortResults(results: SearchResultItem[], filters: any): SearchResultItem[] {
    const sortBy = filters.sortBy || SortBy.RELEVANCE;
    const sortOrder = filters.sortOrder || SortOrder.DESC;

    return results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case SortBy.RELEVANCE:
          comparison = a.score - b.score;
          break;
        case SortBy.RATING:
          comparison = (a.metadata?.rating || 0) - (b.metadata?.rating || 0);
          break;
        case SortBy.VIEW_COUNT:
          comparison = (a.metadata?.viewCount || 0) - (b.metadata?.viewCount || 0);
          break;
        case SortBy.RELEASE_DATE:
          comparison = new Date(a.metadata?.releaseDate || 0).getTime() - 
                      new Date(b.metadata?.releaseDate || 0).getTime();
          break;
        default:
          comparison = a.score - b.score;
      }

      return sortOrder === SortOrder.ASC ? comparison : -comparison;
    });
  }

  /**
   * 获取搜索分面
   */
  private async getSearchFacets(query: string, filters: any): Promise<SearchFacets> {
    // 这里可以实现更复杂的分面统计
    // 为了简化，返回基本的分面信息
    const categories = await Category.find({ isActive: true })
      .select('name dramaCount')
      .lean()
      .exec();

    return {
      categories: categories.map(cat => ({
        name: cat.name,
        count: cat.dramaCount || 0
      })),
      ratings: [
        { range: '9-10', count: 0 },
        { range: '8-9', count: 0 },
        { range: '7-8', count: 0 },
        { range: '6-7', count: 0 },
        { range: '0-6', count: 0 }
      ],
      years: [],
      tags: []
    };
  }

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) {
      return [];
    }

    try {
      const suggestions = await SearchHistoryModel.getSearchSuggestions(query, 5);
      return suggestions.map((s: any) => s.text);
    } catch (error) {
      logger.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * 记录搜索历史
   */
  private async recordSearchHistory(
    userId: string, 
    query: string, 
    filters: any, 
    resultCount: number
  ): Promise<void> {
    try {
      await SearchHistoryModel.create({
        userId,
        query,
        filters,
        resultCount,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error recording search history:', error);
    }
  }

  /**
   * 获取热门搜索词
   */
  async getPopularSearches(limit = 10): Promise<PopularSearch[]> {
    try {
      const cacheKey = `${SearchService.CACHE_KEYS.POPULAR_SEARCHES}:${limit}`;
      
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const popular = await SearchHistoryModel.getPopularSearches(limit);
      const result = popular.map((item: any) => ({
        keyword: item.keyword,
        count: item.count,
        trend: 'stable' as const // 简化实现
      }));

      if (redis.isReady()) {
        await redis.set(cacheKey, JSON.stringify(result), SearchService.CACHE_TTL);
      }

      return result;
    } catch (error) {
      logger.error('Error getting popular searches:', error);
      return [];
    }
  }

  /**
   * 构建缓存键
   */
  private buildCacheKey(request: SearchRequest): string {
    const { query, filters = {} } = request;
    const key = `${SearchService.CACHE_KEYS.SEARCH_RESULT}:${JSON.stringify({ query, filters })}`;
    return key.substring(0, 250); // Redis键长度限制
  }
}
