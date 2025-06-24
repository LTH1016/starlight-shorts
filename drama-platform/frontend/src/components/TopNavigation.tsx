import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  Settings,
  LogOut,
  Crown,
  List,
  Trophy,
  Grid3X3,
  Search,
  Heart
} from 'lucide-react';

interface TopNavigationProps {
  onLoginClick?: () => void;
  onHomeClick?: () => void;
  onDiscoverClick?: () => void;
  onCategoryClick?: () => void;
  onRankingClick?: () => void;
  onFavoriteClick?: () => void;
  onProfileClick?: () => void;
  onSearch?: (query: string) => void;
  className?: string;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  onLoginClick,
  onCategoryClick,
  onRankingClick,
  onFavoriteClick,
  onProfileClick,
  onSearch,
  className = ''
}) => {
  const { user, isAuthenticated, logout } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className={`bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-primary">短剧平台</h1>

          {/* 导航链接 */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onCategoryClick}
              className="text-sm"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              分类
            </Button>
            <Button
              variant="ghost"
              onClick={onRankingClick}
              className="text-sm"
            >
              <Trophy className="w-4 h-4 mr-2" />
              榜单
            </Button>
            <Button
              variant="ghost"
              onClick={onFavoriteClick}
              className="text-sm"
            >
              <Heart className="w-4 h-4 mr-2" />
              收藏
            </Button>
            <Button
              variant="ghost"
              onClick={onProfileClick}
              className="text-sm"
            >
              <User className="w-4 h-4 mr-2" />
              我的
            </Button>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索短剧、演员或标签..."
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearch?.(e.currentTarget.value);
                }
              }}
            />
          </div>
        </div>

        {/* 用户区域 */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.nickname || user.username} />
                    <AvatarFallback>
                      {(user.nickname || user.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.nickname || user.username}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                
                {/* VIP状态 */}
                {user.vipLevel !== 'none' && (
                  <>
                    <DropdownMenuItem>
                      <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                      <span className="text-yellow-600">
                        {user.vipLevel === 'basic' && 'VIP会员'}
                        {user.vipLevel === 'premium' && '超级VIP'}
                        {user.vipLevel === 'ultimate' && '至尊VIP'}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>个人中心</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>设置</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onLoginClick} size="sm">
              登录
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
