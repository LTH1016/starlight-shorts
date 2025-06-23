import React, { useState, useEffect } from 'react';
import { Drama } from '@/types/drama';
import { useDramas } from '@/hooks/useDramas';
import { DramaCard } from '@/components/DramaCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Clock, 
  Play,
  Trash2,
  Grid3X3,
  Calendar
} from 'lucide-react';

interface FavoritePageProps {
  onDramaClick?: (drama: Drama) => void;
  className?: string;
}

interface WatchHistory {
  dramaId: string;
  watchedAt: Date;
  progress: number; // 观看进度 0-100
  currentEpisode: number;
}

export const FavoritePage: React.FC<FavoritePageProps> = ({
  onDramaClick,
  className = ''
}) => {
  const { dramaData } = useDramas();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);

  useEffect(() => {
    // 从localStorage加载收藏和观看历史
    const savedFavorites = localStorage.getItem('favorites');
    const savedHistory = localStorage.getItem('watchHistory');
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    if (savedHistory) {
      setWatchHistory(JSON.parse(savedHistory).map((item: any) => ({
        ...item,
        watchedAt: new Date(item.watchedAt)
      })));
    }
  }, []);

  const favoriteDramas = React.useMemo(() => {
    if (!dramaData) return [];
    return dramaData.dramas.filter(drama => favorites.includes(drama.id));
  }, [dramaData, favorites]);

  const historyDramas = React.useMemo(() => {
    if (!dramaData) return [];
    const historyWithDetails = watchHistory
      .map(history => ({
        ...history,
        drama: dramaData.dramas.find(d => d.id === history.dramaId)
      }))
      .filter(item => item.drama)
      .sort((a, b) => b.watchedAt.getTime() - a.watchedAt.getTime());
    
    return historyWithDetails;
  }, [dramaData, watchHistory]);

  const removeFavorite = (dramaId: string) => {
    const updated = favorites.filter(id => id !== dramaId);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setWatchHistory([]);
    localStorage.removeItem('watchHistory');
  };

  const formatProgress = (progress: number) => {
    if (progress >= 100) return '已看完';
    if (progress >= 80) return '即将看完';
    if (progress >= 50) return '已过半';
    if (progress >= 20) return '刚开始';
    return '未开始';
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  };

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="favorites" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              我的收藏
              {favorites.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {favorites.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              观看历史
              {watchHistory.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {watchHistory.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* 收藏列表 */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">我的收藏</h2>
              {favorites.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFavorites([]);
                    localStorage.removeItem('favorites');
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清空收藏
                </Button>
              )}
            </div>

            {favoriteDramas.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {favoriteDramas.map((drama) => (
                  <div key={drama.id} className="relative group">
                    <DramaCard
                      drama={drama}
                      onClick={onDramaClick}
                    />
                    
                    {/* 移除收藏按钮 */}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto w-auto rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(drama.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-2">暂无收藏</h3>
                <p className="text-muted-foreground mb-4">收藏喜欢的短剧，方便随时观看</p>
                <Button onClick={() => window.location.href = '/'}>
                  去发现好剧
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* 观看历史 */}
          <TabsContent value="history" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">观看历史</h2>
              {watchHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearHistory}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清空历史
                </Button>
              )}
            </div>

            {historyDramas.length > 0 ? (
              <div className="space-y-4">
                {historyDramas.map((item) => (
                  <Card 
                    key={`${item.dramaId}-${item.watchedAt.getTime()}`}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => item.drama && onDramaClick?.(item.drama)}
                  >
                    <div className="flex items-center gap-4">
                      {/* 海报缩略图 */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.drama?.poster}
                          alt={item.drama?.title}
                          className="w-16 h-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* 信息 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground mb-1 line-clamp-1">
                          {item.drama?.title}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{getTimeAgo(item.watchedAt)}</span>
                          </div>
                          <span>第{item.currentEpisode}集</span>
                          <Badge variant="secondary" className="text-xs">
                            {formatProgress(item.progress)}
                          </Badge>
                        </div>

                        {/* 进度条 */}
                        <div className="w-full bg-muted rounded-full h-1">
                          <div 
                            className="bg-primary h-1 rounded-full transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* 继续观看按钮 */}
                      <Button size="sm" className="flex-shrink-0">
                        <Play className="w-4 h-4 mr-1" />
                        继续观看
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-2">暂无观看历史</h3>
                <p className="text-muted-foreground mb-4">开始观看短剧，系统会自动记录您的观看进度</p>
                <Button onClick={() => window.location.href = '/'}>
                  开始观看
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* 底部安全距离 */}
        <div className="h-20" />
      </div>
    </div>
  );
};
