import { Router } from 'express';
import { DramaController } from '../controllers/DramaController';
import { query, param } from 'express-validator';

const router = Router();
const dramaController = new DramaController();

// 验证中间件
const validateDramaQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是大于0的整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须是1-100之间的整数'),
  query('category').optional().isString().trim().withMessage('分类必须是字符串'),
  query('tags').optional().isString().withMessage('标签必须是字符串'),
  query('status').optional().isIn(['updating', 'completed', 'coming_soon']).withMessage('状态值无效'),
  query('isHot').optional().isBoolean().withMessage('热门标志必须是布尔值'),
  query('isNew').optional().isBoolean().withMessage('最新标志必须是布尔值'),
  query('minRating').optional().isFloat({ min: 0, max: 10 }).withMessage('最低评分必须是0-10之间的数字'),
  query('maxRating').optional().isFloat({ min: 0, max: 10 }).withMessage('最高评分必须是0-10之间的数字'),
  query('sortBy').optional().isIn(['createdAt', 'rating', 'viewCount', 'releaseDate']).withMessage('排序字段无效'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('排序方向必须是asc或desc'),
  query('search').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('搜索关键词长度必须是1-100个字符')
];

const validateDramaId = [
  param('id').isMongoId().withMessage('短剧ID格式无效')
];

const validateSearchQuery = [
  query('q').isString().trim().isLength({ min: 1, max: 100 }).withMessage('搜索关键词长度必须是1-100个字符'),
  query('category').optional().isString().trim().withMessage('分类必须是字符串'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须是1-100之间的整数')
];

const validateLimitQuery = [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('数量限制必须是1-50之间的整数')
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Drama:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 短剧ID
 *         title:
 *           type: string
 *           description: 短剧标题
 *         description:
 *           type: string
 *           description: 短剧描述
 *         poster:
 *           type: string
 *           description: 海报图片URL
 *         category:
 *           type: string
 *           description: 分类
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 标签列表
 *         rating:
 *           type: number
 *           description: 评分
 *         viewCount:
 *           type: number
 *           description: 观看次数
 *         duration:
 *           type: string
 *           description: 时长
 *         episodes:
 *           type: number
 *           description: 集数
 *         status:
 *           type: string
 *           enum: [updating, completed, coming_soon]
 *           description: 状态
 *         actors:
 *           type: array
 *           items:
 *             type: string
 *           description: 演员列表
 *         releaseDate:
 *           type: string
 *           format: date
 *           description: 发布日期
 *         isHot:
 *           type: boolean
 *           description: 是否热门
 *         isNew:
 *           type: boolean
 *           description: 是否最新
 */

/**
 * @swagger
 * /api/v1/dramas:
 *   get:
 *     summary: 获取短剧列表
 *     tags: [Dramas]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: 每页数量
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 分类筛选
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 成功获取短剧列表
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
 *                   type: object
 *                   properties:
 *                     dramas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Drama'
 *                     pagination:
 *                       type: object
 */
router.get('/', validateDramaQuery, dramaController.getDramas);

/**
 * @swagger
 * /api/v1/dramas/search:
 *   get:
 *     summary: 搜索短剧
 *     tags: [Dramas]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 搜索成功
 */
router.get('/search', validateSearchQuery, dramaController.searchDramas);

/**
 * @swagger
 * /api/v1/dramas/recommendations:
 *   get:
 *     summary: 获取推荐短剧
 *     tags: [Dramas]
 *     responses:
 *       200:
 *         description: 成功获取推荐
 */
router.get('/recommendations', dramaController.getRecommendations);

/**
 * @swagger
 * /api/v1/dramas/hot:
 *   get:
 *     summary: 获取热门短剧
 *     tags: [Dramas]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: 数量限制
 *     responses:
 *       200:
 *         description: 成功获取热门短剧
 */
router.get('/hot', validateLimitQuery, dramaController.getHotDramas);

/**
 * @swagger
 * /api/v1/dramas/new:
 *   get:
 *     summary: 获取最新短剧
 *     tags: [Dramas]
 */
router.get('/new', validateLimitQuery, dramaController.getNewDramas);

/**
 * @swagger
 * /api/v1/dramas/trending:
 *   get:
 *     summary: 获取趋势短剧
 *     tags: [Dramas]
 */
router.get('/trending', validateLimitQuery, dramaController.getTrendingDramas);

/**
 * @swagger
 * /api/v1/dramas/{id}:
 *   get:
 *     summary: 获取短剧详情
 *     tags: [Dramas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 短剧ID
 *     responses:
 *       200:
 *         description: 成功获取短剧详情
 *       404:
 *         description: 短剧不存在
 */
router.get('/:id', validateDramaId, dramaController.getDramaById);

/**
 * @swagger
 * /api/v1/dramas/{id}/view:
 *   post:
 *     summary: 增加观看次数
 *     tags: [Dramas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 短剧ID
 *     responses:
 *       200:
 *         description: 观看次数更新成功
 */
router.post('/:id/view', validateDramaId, dramaController.incrementViewCount);

export default router;
