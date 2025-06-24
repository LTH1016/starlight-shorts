import { Router } from 'express';
import { SearchController } from '../controllers/SearchController';
import { authenticate, optionalAuth, logUserActivity } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';
import {
  searchValidation,
  suggestionsValidation,
  popularSearchesValidation,
  recommendationValidation,
  similarRecommendationValidation,
  rankingValidation,
  categoryRankingValidation,
  updatePreferencesValidation
} from '../validators/searchValidators';

const router = Router();
const searchController = new SearchController();

// 搜索相关路由
router.get('/', 
  generalLimiter,
  optionalAuth, // 可选认证，用于个性化搜索
  searchValidation,
  logUserActivity('search'),
  searchController.search
);

router.get('/suggestions', 
  generalLimiter,
  suggestionsValidation,
  searchController.getSuggestions
);

router.get('/popular', 
  generalLimiter,
  popularSearchesValidation,
  searchController.getPopularSearches
);

// 推荐相关路由
router.get('/recommendations/:type', 
  generalLimiter,
  optionalAuth,
  recommendationValidation,
  logUserActivity('get_recommendations'),
  searchController.getRecommendations
);

router.get('/recommendations/personalized/me', 
  authenticate,
  logUserActivity('get_personalized_recommendations'),
  searchController.getPersonalizedRecommendations
);

router.get('/recommendations/similar/:dramaId', 
  generalLimiter,
  similarRecommendationValidation,
  logUserActivity('get_similar_recommendations'),
  searchController.getSimilarRecommendations
);

// 榜单相关路由
router.get('/rankings/:type', 
  generalLimiter,
  rankingValidation,
  searchController.getRanking
);

router.get('/rankings/:type/categories', 
  generalLimiter,
  categoryRankingValidation,
  searchController.getCategoryRankings
);

router.get('/rankings/:type/trends', 
  generalLimiter,
  rankingValidation,
  searchController.getRankingTrends
);

// 用户偏好相关路由
router.get('/preferences', 
  authenticate,
  searchController.getUserPreferences
);

router.post('/preferences', 
  authenticate,
  updatePreferencesValidation,
  logUserActivity('update_preferences'),
  searchController.updateUserPreferences
);

export default router;
