import { body, param } from 'express-validator';

// 注册验证规则
export const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  
  body('email')
    .isEmail()
    .withMessage('邮箱格式不正确')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度不能少于6个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个小写字母、一个大写字母和一个数字'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('密码确认不匹配');
      }
      return true;
    }),
  
  body('nickname')
    .optional()
    .isLength({ max: 50 })
    .withMessage('昵称长度不能超过50个字符')
    .trim()
];

// 登录验证规则
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('邮箱格式不正确')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('密码不能为空'),
  
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('记住我必须是布尔值')
];

// 刷新令牌验证规则
export const refreshTokenValidation = [
  body('refreshToken')
    .optional()
    .isString()
    .withMessage('刷新令牌必须是字符串')
];

// 验证令牌验证规则
export const verifyTokenValidation = [
  body('token')
    .notEmpty()
    .withMessage('令牌不能为空')
    .isString()
    .withMessage('令牌必须是字符串')
];

// 检查用户名验证规则
export const checkUsernameValidation = [
  param('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线')
];

// 检查邮箱验证规则
export const checkEmailValidation = [
  param('email')
    .isEmail()
    .withMessage('邮箱格式不正确')
    .normalizeEmail()
];
