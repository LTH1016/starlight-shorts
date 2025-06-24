import { body, param, query } from 'express-validator';
import { UserRole, UserStatus } from '../types/user';

// 更新用户信息验证规则
export const updateUserValidation = [
  body('nickname')
    .optional()
    .isLength({ max: 50 })
    .withMessage('昵称长度不能超过50个字符')
    .trim(),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('个人简介长度不能超过500个字符')
    .trim(),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('性别必须是 male、female 或 other'),
  
  body('birthday')
    .optional()
    .isISO8601()
    .withMessage('生日格式不正确')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      if (age < 0 || age > 150) {
        throw new Error('年龄必须在0-150岁之间');
      }
      return true;
    }),
  
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('地址长度不能超过100个字符')
    .trim(),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('头像必须是有效的URL'),
  
  body('preferences.favoriteGenres')
    .optional()
    .isArray()
    .withMessage('喜欢的类型必须是数组'),
  
  body('preferences.favoriteGenres.*')
    .optional()
    .isString()
    .withMessage('类型必须是字符串'),
  
  body('preferences.language')
    .optional()
    .isString()
    .withMessage('语言必须是字符串'),
  
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('邮件通知设置必须是布尔值'),
  
  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('推送通知设置必须是布尔值'),
  
  body('preferences.notifications.newDramas')
    .optional()
    .isBoolean()
    .withMessage('新剧通知设置必须是布尔值'),
  
  body('preferences.notifications.recommendations')
    .optional()
    .isBoolean()
    .withMessage('推荐通知设置必须是布尔值')
];

// 更新用户状态验证规则
export const updateUserStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('用户ID格式不正确'),
  
  body('status')
    .isIn(Object.values(UserStatus))
    .withMessage(`状态必须是以下值之一: ${Object.values(UserStatus).join(', ')}`)
];

// 更新用户角色验证规则
export const updateUserRoleValidation = [
  param('id')
    .isMongoId()
    .withMessage('用户ID格式不正确'),
  
  body('role')
    .isIn(Object.values(UserRole))
    .withMessage(`角色必须是以下值之一: ${Object.values(UserRole).join(', ')}`)
];

// 用户ID验证规则
export const userIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('用户ID格式不正确')
];

// 用户列表查询验证规则
export const userListValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须是1-100之间的整数'),
  
  query('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage(`角色必须是以下值之一: ${Object.values(UserRole).join(', ')}`),
  
  query('status')
    .optional()
    .isIn(Object.values(UserStatus))
    .withMessage(`状态必须是以下值之一: ${Object.values(UserStatus).join(', ')}`),
  
  query('search')
    .optional()
    .isString()
    .withMessage('搜索关键词必须是字符串')
    .isLength({ max: 100 })
    .withMessage('搜索关键词长度不能超过100个字符'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'lastLoginAt', 'username', 'email'])
    .withMessage('排序字段必须是 createdAt、lastLoginAt、username 或 email'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('排序方向必须是 asc 或 desc'),
  
  query('createdAfter')
    .optional()
    .isISO8601()
    .withMessage('创建时间起始日期格式不正确'),
  
  query('createdBefore')
    .optional()
    .isISO8601()
    .withMessage('创建时间结束日期格式不正确'),
  
  query('lastLoginAfter')
    .optional()
    .isISO8601()
    .withMessage('最后登录时间格式不正确')
];

// 搜索用户验证规则
export const searchUsersValidation = [
  query('q')
    .notEmpty()
    .withMessage('搜索关键词不能为空')
    .isString()
    .withMessage('搜索关键词必须是字符串')
    .isLength({ min: 1, max: 100 })
    .withMessage('搜索关键词长度必须在1-100个字符之间'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('限制数量必须是1-50之间的整数')
];
