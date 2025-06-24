import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { body, param } from 'express-validator';

const router = Router();
const categoryController = new CategoryController();

// 验证中间件
const validateCategoryId = [
  param('id').isMongoId().withMessage('分类ID格式无效')
];

const validateCategoryCreate = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('分类名称长度必须是1-50个字符'),
  body('color')
    .isString()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('颜色格式必须是有效的十六进制颜色代码'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('描述长度不能超过200个字符'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('排序值必须是非负整数'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('活跃状态必须是布尔值')
];

const validateCategoryUpdate = [
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('分类名称长度必须是1-50个字符'),
  body('color')
    .optional()
    .isString()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('颜色格式必须是有效的十六进制颜色代码'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('描述长度不能超过200个字符'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('排序值必须是非负整数'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('活跃状态必须是布尔值')
];

const validateSortOrderUpdate = [
  body('updates')
    .isArray()
    .withMessage('更新数据必须是数组'),
  body('updates.*.id')
    .isMongoId()
    .withMessage('分类ID格式无效'),
  body('updates.*.sortOrder')
    .isInt({ min: 0 })
    .withMessage('排序值必须是非负整数')
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 分类ID
 *         name:
 *           type: string
 *           description: 分类名称
 *         color:
 *           type: string
 *           description: 分类颜色
 *         description:
 *           type: string
 *           description: 分类描述
 *         sortOrder:
 *           type: number
 *           description: 排序值
 *         isActive:
 *           type: boolean
 *           description: 是否活跃
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 */

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: 获取活跃分类列表
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: 成功获取分类列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
router.get('/', categoryController.getActiveCategories);

/**
 * @swagger
 * /api/v1/categories/all:
 *   get:
 *     summary: 获取所有分类列表（管理员用）
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: 成功获取所有分类
 */
router.get('/all', categoryController.getAllCategories);

/**
 * @swagger
 * /api/v1/categories/stats:
 *   get:
 *     summary: 获取分类统计信息
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: 成功获取分类统计
 */
router.get('/stats', categoryController.getCategoryStats);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: 创建新分类
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *                 description: 分类名称
 *               color:
 *                 type: string
 *                 description: 分类颜色（十六进制）
 *               description:
 *                 type: string
 *                 description: 分类描述
 *               sortOrder:
 *                 type: number
 *                 description: 排序值
 *               isActive:
 *                 type: boolean
 *                 description: 是否活跃
 *     responses:
 *       201:
 *         description: 分类创建成功
 *       400:
 *         description: 参数验证失败
 *       409:
 *         description: 分类名称已存在
 */
router.post('/', validateCategoryCreate, categoryController.createCategory);

/**
 * @swagger
 * /api/v1/categories/sort-order:
 *   put:
 *     summary: 更新分类排序
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     sortOrder:
 *                       type: number
 *     responses:
 *       200:
 *         description: 排序更新成功
 */
router.put('/sort-order', validateSortOrderUpdate, categoryController.updateSortOrder);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: 获取分类详情
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 分类ID
 *     responses:
 *       200:
 *         description: 成功获取分类详情
 *       404:
 *         description: 分类不存在
 */
router.get('/:id', validateCategoryId, categoryController.getCategoryById);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: 更新分类
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 分类ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               description:
 *                 type: string
 *               sortOrder:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 分类更新成功
 *       404:
 *         description: 分类不存在
 */
router.put('/:id', validateCategoryId, validateCategoryUpdate, categoryController.updateCategory);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: 删除分类
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 分类ID
 *     responses:
 *       200:
 *         description: 分类删除成功
 *       404:
 *         description: 分类不存在
 */
router.delete('/:id', validateCategoryId, categoryController.deleteCategory);

/**
 * @swagger
 * /api/v1/categories/{id}/toggle:
 *   patch:
 *     summary: 切换分类状态
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 分类ID
 *     responses:
 *       200:
 *         description: 状态切换成功
 *       404:
 *         description: 分类不存在
 */
router.patch('/:id/toggle', validateCategoryId, categoryController.toggleStatus);

export default router;
