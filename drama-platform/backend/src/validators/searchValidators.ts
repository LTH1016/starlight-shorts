import { query, param, body } from 'express-validator';
import { SearchType, SortBy, SortOrder, RecommendationType, RankingType } from '../types/search';

// 搜索验证规则
export const searchValidation = [
  query('q')
    .notEmpty()
    .withMessage('搜索关键词不能为空')
    .isString()
    .withMessage('搜索关键词必须是字符串')
    .isLength({ min: 1, max: 200 })
    .withMessage('搜索关键词长度必须在1-200个字符之间')
    .trim(),
  
  query('type')
    .optional()
    .isIn(Object.values(SearchType))
    .withMessage(`搜索类型必须是以下值之一: ${Object.values(SearchType).join(', ')}`),
  
  query('category')
    .optional()
    .isString()
    .withMessage('分类必须是字符串')
    .isLength({ max: 50 })
    .withMessage('分类长度不能超过50个字符'),
  
  query('tags')
    .optional()
    .isString()
    .withMessage('标签必须是字符串'),
  
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('最低评分必须是0-10之间的数字'),
  
  query('maxRating')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('最高评分必须是0-10之间的数字'),
  
  query('minViewCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('最低观看数必须是非负整数'),
  
  query('maxViewCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('最高观看数必须是非负整数'),
  
  query('releaseDateFrom')
    .optional()
    .isISO8601()
    .withMessage('发布日期起始时间格式不正确'),
  
  query('releaseDateTo')
    .optional()
    .isISO8601()
    .withMessage('发布日期结束时间格式不正确'),
  
  query('isHot')
    .optional()
    .isBoolean()
    .withMessage('热门标记必须是布尔值'),
  
  query('isNew')
    .optional()
    .isBoolean()
    .withMessage('最新标记必须是布尔值'),
  
  query('sortBy')
    .optional()
    .isIn(Object.values(SortBy))
    .withMessage(`排序字段必须是以下值之一: ${Object.values(SortBy).join(', ')}`),
  
  query('sortOrder')
    .optional()
    .isIn(Object.values(SortOrder))
    .withMessage(`排序方向必须是以下值之一: ${Object.values(SortOrder).join(', ')}`),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须是1-100之间的整数')
];

// 搜索建议验证规则
export const suggestionsValidation = [
  query('q')
    .notEmpty()
    .withMessage('搜索关键词不能为空')
    .isString()
    .withMessage('搜索关键词必须是字符串')
    .isLength({ min: 2, max: 100 })
    .withMessage('搜索关键词长度必须在2-100个字符之间')
    .trim()
];

// 热门搜索验证规则
export const popularSearchesValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('限制数量必须是1-50之间的整数')
];

// 推荐类型验证规则
export const recommendationTypeValidation = [
  param('type')
    .isIn(Object.values(RecommendationType))
    .withMessage(`推荐类型必须是以下值之一: ${Object.values(RecommendationType).join(', ')}`)
];

// 推荐验证规则
export const recommendationValidation = [
  ...recommendationTypeValidation,
  
  query('dramaId')
    .optional()
    .isMongoId()
    .withMessage('短剧ID格式不正确'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('限制数量必须是1-50之间的整数'),
  
  query('excludeWatched')
    .optional()
    .isBoolean()
    .withMessage('排除已观看必须是布尔值'),
  
  query('categories')
    .optional()
    .isString()
    .withMessage('分类列表必须是字符串')
];

// 相似推荐验证规则
export const similarRecommendationValidation = [
  param('dramaId')
    .isMongoId()
    .withMessage('短剧ID格式不正确'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('限制数量必须是1-50之间的整数')
];

// 榜单类型验证规则
export const rankingTypeValidation = [
  param('type')
    .isIn(Object.values(RankingType))
    .withMessage(`榜单类型必须是以下值之一: ${Object.values(RankingType).join(', ')}`)
];

// 榜单验证规则
export const rankingValidation = [
  ...rankingTypeValidation,
  
  query('category')
    .optional()
    .isString()
    .withMessage('分类必须是字符串')
    .isLength({ max: 50 })
    .withMessage('分类长度不能超过50个字符'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('限制数量必须是1-100之间的整数')
];

// 分类榜单验证规则
export const categoryRankingValidation = [
  ...rankingTypeValidation,
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('限制数量必须是1-50之间的整数')
];

// 用户偏好更新验证规则
export const updatePreferencesValidation = [
  body('dramaId')
    .isMongoId()
    .withMessage('短剧ID格式不正确'),
  
  body('action')
    .isIn(['view', 'like', 'favorite', 'complete'])
    .withMessage('操作类型必须是 view、like、favorite 或 complete')
];
