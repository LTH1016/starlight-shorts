import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { 
  authenticate, 
  requireAdmin, 
  requireModerator, 
  requireOwnerOrAdmin,
  logUserActivity 
} from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';
import {
  updateUserValidation,
  updateUserStatusValidation,
  updateUserRoleValidation,
  userIdValidation,
  userListValidation,
  searchUsersValidation
} from '../validators/userValidators';

const router = Router();
const userController = new UserController();

// 公开路由
router.get('/search', 
  generalLimiter,
  searchUsersValidation,
  userController.searchUsers
);

// 需要认证的路由
router.get('/me/profile',
  authenticate,
  userController.getProfile
);

router.put('/me/profile', 
  authenticate,
  updateUserValidation,
  logUserActivity('update_profile'),
  userController.updateProfile
);

router.get('/me/sessions', 
  authenticate,
  userController.getMySessions
);

// 管理员或版主权限路由
router.get('/', 
  authenticate,
  requireModerator,
  userListValidation,
  userController.getUsers
);

router.get('/stats', 
  authenticate,
  requireModerator,
  userController.getUserStats
);

router.get('/:id', 
  authenticate,
  requireOwnerOrAdmin,
  userIdValidation,
  userController.getUserById
);

router.put('/:id', 
  authenticate,
  requireOwnerOrAdmin,
  userIdValidation,
  updateUserValidation,
  logUserActivity('update_user'),
  userController.updateUser
);

router.get('/:id/sessions', 
  authenticate,
  requireOwnerOrAdmin,
  userIdValidation,
  userController.getUserSessions
);

// 仅管理员权限路由
router.put('/:id/status', 
  authenticate,
  requireAdmin,
  updateUserStatusValidation,
  logUserActivity('update_user_status'),
  userController.updateUserStatus
);

router.put('/:id/role', 
  authenticate,
  requireAdmin,
  updateUserRoleValidation,
  logUserActivity('update_user_role'),
  userController.updateUserRole
);

router.delete('/:id', 
  authenticate,
  requireAdmin,
  userIdValidation,
  logUserActivity('delete_user'),
  userController.deleteUser
);

export default router;
