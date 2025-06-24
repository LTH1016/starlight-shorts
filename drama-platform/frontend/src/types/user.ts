export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  nickname?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  bio?: string;
  level: number;
  points: number;
  vipLevel: 'none' | 'basic' | 'premium' | 'ultimate';
  vipExpireDate?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  inviteCode?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface WatchHistory {
  dramaId: string;
  watchedAt: string;
  progress: number;
  currentEpisode: number;
  totalEpisodes: number;
  lastWatchedTime: number; // 观看时长（秒）
}

export interface Favorite {
  dramaId: string;
  addedAt: string;
  category: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  autoPlay: boolean;
  playQuality: 'auto' | '720p' | '1080p' | '4k';
  subtitles: boolean;
  notifications: {
    newEpisodes: boolean;
    recommendations: boolean;
    system: boolean;
  };
}
