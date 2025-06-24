import { Category } from '../models/Category';
import { ICategory } from '../types/drama';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';

export class CategoryService {
  private static readonly CACHE_TTL = 3600; // 1小时
  private static readonly CACHE_KEYS = {
    ACTIVE_CATEGORIES: 'categories:active',
    ALL_CATEGORIES: 'categories:all',
    CATEGORY_STATS: 'categories:stats'
  };

  /**
   * 获取所有活跃分类
   */
  async getActiveCategories(): Promise<ICategory[]> {
    try {
      const cacheKey = CategoryService.CACHE_KEYS.ACTIVE_CATEGORIES;
      
      // 尝试从缓存获取
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('Active categories retrieved from cache');
          return JSON.parse(cached);
        }
      }

      const categories = await Category.find({ isActive: true })
        .sort({ sortOrder: 1, name: 1 })
        .lean()
        .exec();

      // 缓存结果
      if (redis.isReady()) {
        await redis.set(cacheKey, JSON.stringify(categories), CategoryService.CACHE_TTL);
      }

      return categories as ICategory[];
    } catch (error) {
      logger.error('Error getting active categories:', error);
      throw error;
    }
  }

  /**
   * 获取所有分类（包括非活跃的）
   */
  async getAllCategories(): Promise<ICategory[]> {
    try {
      const cacheKey = CategoryService.CACHE_KEYS.ALL_CATEGORIES;
      
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('All categories retrieved from cache');
          return JSON.parse(cached);
        }
      }

      const categories = await Category.find()
        .sort({ sortOrder: 1, name: 1 })
        .lean()
        .exec();

      if (redis.isReady()) {
        await redis.set(cacheKey, JSON.stringify(categories), CategoryService.CACHE_TTL);
      }

      return categories as ICategory[];
    } catch (error) {
      logger.error('Error getting all categories:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取分类
   */
  async getCategoryById(id: string): Promise<ICategory | null> {
    try {
      const category = await Category.findById(id).lean().exec();
      return category as ICategory;
    } catch (error) {
      logger.error(`Error getting category ${id}:`, error);
      throw error;
    }
  }

  /**
   * 创建新分类
   */
  async createCategory(categoryData: Partial<ICategory>): Promise<ICategory> {
    try {
      const category = new Category(categoryData);
      const savedCategory = await category.save();

      // 清除缓存
      await this.clearCache();

      logger.info(`Category created: ${savedCategory.name}`);
      return savedCategory.toObject() as ICategory;
    } catch (error) {
      logger.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * 更新分类
   */
  async updateCategory(id: string, updateData: Partial<ICategory>): Promise<ICategory | null> {
    try {
      const category = await Category.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).lean().exec();

      if (category) {
        // 清除缓存
        await this.clearCache();
        logger.info(`Category updated: ${category.name}`);
      }

      return category as ICategory;
    } catch (error) {
      logger.error(`Error updating category ${id}:`, error);
      throw error;
    }
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const category = await Category.findById(id);
      if (!category) {
        return false;
      }

      await category.deleteOne();
      
      // 清除缓存
      await this.clearCache();
      
      logger.info(`Category deleted: ${category.name}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }

  /**
   * 获取分类统计信息
   */
  async getCategoryStats(): Promise<any[]> {
    try {
      const cacheKey = CategoryService.CACHE_KEYS.CATEGORY_STATS;
      
      if (redis.isReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('Category stats retrieved from cache');
          return JSON.parse(cached);
        }
      }

      const stats = await (Category as any).getCategoryStats();

      if (redis.isReady()) {
        await redis.set(cacheKey, JSON.stringify(stats), CategoryService.CACHE_TTL);
      }

      return stats;
    } catch (error) {
      logger.error('Error getting category stats:', error);
      throw error;
    }
  }

  /**
   * 更新分类排序
   */
  async updateCategorySortOrder(updates: Array<{ id: string; sortOrder: number }>): Promise<void> {
    try {
      const bulkOps = updates.map(update => ({
        updateOne: {
          filter: { _id: update.id },
          update: { sortOrder: update.sortOrder, updatedAt: new Date() }
        }
      }));

      await Category.bulkWrite(bulkOps);
      
      // 清除缓存
      await this.clearCache();
      
      logger.info('Category sort order updated');
    } catch (error) {
      logger.error('Error updating category sort order:', error);
      throw error;
    }
  }

  /**
   * 切换分类状态
   */
  async toggleCategoryStatus(id: string): Promise<ICategory | null> {
    try {
      const category = await Category.findById(id);
      if (!category) {
        return null;
      }

      category.isActive = !category.isActive;
      category.updatedAt = new Date();
      await category.save();

      // 清除缓存
      await this.clearCache();

      logger.info(`Category ${category.name} status toggled to ${category.isActive ? 'active' : 'inactive'}`);
      return category.toObject() as ICategory;
    } catch (error) {
      logger.error(`Error toggling category status ${id}:`, error);
      throw error;
    }
  }

  /**
   * 清除所有分类相关缓存
   */
  private async clearCache(): Promise<void> {
    if (!redis.isReady()) {
      return;
    }

    try {
      const keys = Object.values(CategoryService.CACHE_KEYS);
      for (const key of keys) {
        await redis.del(key);
      }
      logger.debug('Category cache cleared');
    } catch (error) {
      logger.error('Error clearing category cache:', error);
    }
  }
}
