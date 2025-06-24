import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate, logUserActivity } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  verifyTokenValidation,
  checkUsernameValidation,
  checkEmailValidation
} from '../validators/authValidators';

const router = Router();
const authController = new AuthController();

// 公开路由
router.post('/register', 
  generalLimiter,
  registerValidation,
  logUserActivity('user_register'),
  authController.register
);

router.post('/login', 
  generalLimiter,
  loginValidation,
  logUserActivity('user_login'),
  authController.login
);

router.post('/refresh-token', 
  generalLimiter,
  refreshTokenValidation,
  authController.refreshToken
);

router.post('/verify-token', 
  generalLimiter,
  verifyTokenValidation,
  authController.verifyToken
);

router.get('/check-username/:username', 
  generalLimiter,
  checkUsernameValidation,
  authController.checkUsername
);

router.get('/check-email/:email', 
  generalLimiter,
  checkEmailValidation,
  authController.checkEmail
);

// 需要认证的路由
router.post('/logout', 
  authenticate,
  logUserActivity('user_logout'),
  authController.logout
);

router.post('/logout-all', 
  authenticate,
  logUserActivity('user_logout_all'),
  authController.logoutAll
);

router.get('/profile', 
  authenticate,
  authController.getProfile
);

export default router;
