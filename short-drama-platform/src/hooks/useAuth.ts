import { useState, useEffect, createContext, useContext } from 'react';
import { User, AuthState, LoginRequest, RegisterRequest, AuthResponse } from '@/types/user';

// 模拟API调用
const mockAuthAPI = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 简单的模拟验证
    if (credentials.email === 'demo@example.com' && credentials.password === '123456') {
      const user: User = {
        id: 'user_001',
        username: 'demo_user',
        email: 'demo@example.com',
        nickname: '演示用户',
        avatar: '/images/avatar-placeholder.jpg',
        level: 5,
        points: 1250,
        vipLevel: 'premium',
        vipExpireDate: '2024-12-31',
        createdAt: '2024-01-01T00:00:00Z',
        lastLoginAt: new Date().toISOString()
      };
      
      return {
        user,
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresIn: 3600
      };
    }
    
    throw new Error('邮箱或密码错误');
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (data.password !== data.confirmPassword) {
      throw new Error('两次输入的密码不一致');
    }
    
    const user: User = {
      id: 'user_' + Date.now(),
      username: data.username,
      email: data.email,
      nickname: data.username,
      level: 1,
      points: 0,
      vipLevel: 'none',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    
    return {
      user,
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresIn: 3600
    };
  },

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟刷新token
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return {
        user,
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresIn: 3600
      };
    }
    
    throw new Error('刷新token失败');
  },

  async getCurrentUser(): Promise<User> {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    throw new Error('用户未登录');
  }
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // 初始化时检查本地存储的用户信息
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          const user = JSON.parse(storedUser);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: '初始化失败'
        });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await mockAuthAPI.login(credentials);
      
      // 存储到本地
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await mockAuthAPI.register(data);
      
      // 存储到本地
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '注册失败';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await mockAuthAPI.logout();
      
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    clearError
  };
};
