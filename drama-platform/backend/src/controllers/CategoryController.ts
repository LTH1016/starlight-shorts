import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';
import { ApiResponse } from '../types/drama';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  /**
   * 获取活跃分类列表
   */
  getActiveCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.categoryService.getActiveCategories();
      
      res.json(this.createSuccessResponse('获取分类列表成功', categories));
    } catch (error) {
      logger.error('Error in getActiveCategories:', error);
      res.status(500).json(this.createErrorResponse('服务器内部错误'));
    }
  };

  /**
   * 获取所有分类列表（管理员用）
   */
  getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.categoryService.getAllCategories();
      
      res.json(this.createSuccessResponse('获取所有分类成功', categories));
    } catch (error) {
      logger.error('Error in getAllCategories:', error);
      res.status(500).json(this.createErrorResponse('服务器内部错误'));
    }
  };

  /**
   * 根据ID获取分类详情
   */
  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json(this.createErrorResponse('分类ID不能为空'));
        return;
      }

      const category = await this.categoryService.getCategoryById(id);
      
      if (!category) {
        res.status(404).json(this.createErrorResponse('分类不存在'));
        return;
      }

      res.json(this.createSuccessResponse('获取分类详情成功', category));
    } catch (error) {
      logger.error('Error in getCategoryById:', error);
      res.status(500).json(this.createErrorResponse('服务器内部错误'));
    }
  };

  /**
   * 创建新分类
   */
  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(this.createErrorResponse('参数验证失败', errors.array()));
        return;
      }

      const categoryData = {
        name: req.body.name,
        color: req.body.color,
        description: req.body.description,
        sortOrder: req.body.sortOrder || 0,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true
      };

      const category = await this.categoryService.createCategory(categoryData);
      
      res.status(201).json(this.createSuccessResponse('分类创建成功', category));
    } catch (error: any) {
      logger.error('Error in createCategory:', error);

      if (error.code === 11000) {
        res.status(409).json(this.createErrorResponse('分类名称已存在'));
      } else {
        res.status(500).json(this.createErrorResponse('服务器内部错误'));
      }
    }
  };

  /**
   * 更新分类
   */
  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json(this.createErrorResponse('分类ID不能为空'));
        return;
      }

      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(this.createErrorResponse('参数验证失败', errors.array()));
        return;
      }

      const updateData = {
        name: req.body.name,
        color: req.body.color,
        description: req.body.description,
        sortOrder: req.body.sortOrder,
        isActive: req.body.isActive
      };

      // 移除undefined值
      Object.keys(updateData).forEach(key => {
        if ((updateData as any)[key] === undefined) {
          delete (updateData as any)[key];
        }
      });

      const category = await this.categoryService.updateCategory(id, updateData);
      
      if (!category) {
        res.status(404).json(this.createErrorResponse('分类不存在'));
        return;
      }

      res.json(this.createSuccessResponse('分类更新成功', category));
    } catch (error: any) {
      logger.error('Error in updateCategory:', error);

      if (error.code === 11000) {
        res.status(409).json(this.createErrorResponse('分类名称已存在'));
      } else {
        res.status(500).json(this.createErrorResponse('服务器内部错误'));
      }
    }
  };

  /**
   * 删除分类
   */
  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json(this.createErrorResponse('分类ID不能为空'));
        return;
      }

      const deleted = await this.categoryService.deleteCategory(id);
      
      if (!deleted) {
        res.status(404).json(this.createErrorResponse('分类不存在'));
        return;
      }

      res.json(this.createSuccessResponse('分类删除成功'));
    } catch (error: any) {
      logger.error('Error in deleteCategory:', error);
      res.status(500).json(this.createErrorResponse(error.message || '服务器内部错误'));
    }
  };

  /**
   * 获取分类统计信息
   */
  getCategoryStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.categoryService.getCategoryStats();
      
      res.json(this.createSuccessResponse('获取分类统计成功', stats));
    } catch (error) {
      logger.error('Error in getCategoryStats:', error);
      res.status(500).json(this.createErrorResponse('服务器内部错误'));
    }
  };

  /**
   * 更新分类排序
   */
  updateSortOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { updates } = req.body;
      
      if (!Array.isArray(updates)) {
        res.status(400).json(this.createErrorResponse('更新数据格式错误'));
        return;
      }

      await this.categoryService.updateCategorySortOrder(updates);
      
      res.json(this.createSuccessResponse('分类排序更新成功'));
    } catch (error) {
      logger.error('Error in updateSortOrder:', error);
      res.status(500).json(this.createErrorResponse('服务器内部错误'));
    }
  };

  /**
   * 切换分类状态
   */
  toggleStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json(this.createErrorResponse('分类ID不能为空'));
        return;
      }

      const category = await this.categoryService.toggleCategoryStatus(id);
      
      if (!category) {
        res.status(404).json(this.createErrorResponse('分类不存在'));
        return;
      }

      res.json(this.createSuccessResponse('分类状态更新成功', category));
    } catch (error) {
      logger.error('Error in toggleStatus:', error);
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
