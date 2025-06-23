import React, { useState, useMemo } from 'react';
import { Drama } from '@/types/drama';
import { useDramas } from '@/hooks/useDramas';
import { DramaCard } from '@/components/DramaCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Star, 
  Eye, 
  Calendar,
  Trophy,
  Crown,
  Medal,
  Award,
  ArrowLeft,
  Flame
} from 'lucide-react';

interface RankingPageProps {
  onDramaClick?: (drama: Drama) => void;
  onBack?: () => void;
  className?: string;
}

type RankingType = 'hot' | 'rating' | 'views' | 'new' | 'trending';

export const RankingPage: React.FC<RankingPageProps> = ({
  onDramaClick,
  onBack,
  className = ''
}) => {
  const { dramaData, loading } = useDramas();
  const [activeRanking, setActiveRanking] = useState<RankingType>('hot');

  // 生成各种榜单数据
  const rankings = useMemo(() => {
    if (!dramaData) return {};

    const dramas = dramaData.dramas;

    return {
      hot: dramas
        .filter(d => d.isHot)
        .sort((a, b) => {
          // 综合热度：评分 * 观看量 * 热门权重
          const aScore = a.rating * parseFloat(a.views.replace('万', '')) * 1.5;
          const bScore = b.rating * parseFloat(b.views.replace('万', '')) * 1.5;
          return bScore - aScore;
        }),
      
      rating: dramas
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 20),
      
      views: dramas
        .sort((a, b) => {
          const aViews = parseFloat(a.views.replace('万', ''));
          const bViews = parseFloat(b.views.replace('万', ''));
          return bViews - aViews;
        })
        .slice(0, 20),
      
      new: dramas
        .filter(d => d.isNew)
        .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()),
      
      trending: dramas
        .sort((a, b) => {
          // 趋势算法：最近发布 + 高评分 + 观看量
          const now = new Date().getTime();
          const aDate = new Date(a.releaseDate).getTime();
          const bDate = new Date(b.releaseDate).getTime();
          
          const aRecency = Math.max(0, 30 - (now - aDate) / (1000 * 60 * 60 * 24)); // 30天内的新鲜度
          const bRecency = Math.max(0, 30 - (now - bDate) / (1000 * 60 * 60 * 24));
          
          const aScore = a.rating * parseFloat(a.views.replace('万', '')) * (1 + aRecency / 30);
          const bScore = b.rating * parseFloat(b.views.replace('万', '')) * (1 + bRecency / 30);
          
          return bScore - aScore;
        })
        .slice(0, 20)
    };
  }, [dramaData]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (!dramaData) {
    return <div className="flex items-center justify-center min-h-screen">加载失败</div>;
  }

  const getRankingIcon = (type: RankingType) => {
    switch (type) {
      case 'hot': return <Flame className="w-5 h-5" />;
      case 'rating': return <Star className="w-5 h-5" />;
      case 'views': return <Eye className="w-5 h-5" />;
      case 'new': return <Calendar className="w-5 h-5" />;
      case 'trending': return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getRankingTitle = (type: RankingType) => {
    switch (type) {
      case 'hot': return '热门榜';
      case 'rating': return '评分榜';
      case 'views': return '观看榜';
      case 'new': return '新剧榜';
      case 'trending': return '趋势榜';
    }
  };

  const getRankingDescription = (type: RankingType) => {
    switch (type) {
      case 'hot': return '最受欢迎的热门短剧';
      case 'rating': return '评分最高的优质短剧';
      case 'views': return '观看量最多的短剧';
      case 'new': return '最新上线的短剧';
      case 'trending': return '当前最具话题性的短剧';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
  };

  const currentRankingData = rankings[activeRanking] || [];

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* 头部导航 */}
        {onBack && (
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <h1 className="text-2xl font-bold">排行榜</h1>
          </div>
        )}

        {/* 榜单选择 */}
        <Tabs value={activeRanking} onValueChange={(value) => setActiveRanking(value as RankingType)} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            {(['hot', 'rating', 'views', 'new', 'trending'] as RankingType[]).map((type) => (
              <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                {getRankingIcon(type)}
                <span className="hidden sm:inline">{getRankingTitle(type)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* 榜单内容 */}
          {(['hot', 'rating', 'views', 'new', 'trending'] as RankingType[]).map((type) => (
            <TabsContent key={type} value={type}>
              {/* 榜单头部信息 */}
              <Card className="p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    {getRankingIcon(type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{getRankingTitle(type)}</h2>
                    <p className="text-muted-foreground">{getRankingDescription(type)}</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="secondary">
                      共 {rankings[type]?.length || 0} 部
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* 榜单列表 */}
              {currentRankingData.length > 0 ? (
                <div className="space-y-4">
                  {/* 前三名特殊显示 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {currentRankingData.slice(0, 3).map((drama, index) => (
                      <Card key={drama.id} className="p-4 relative overflow-hidden">
                        {/* 排名徽章 */}
                        <div className="absolute top-2 left-2 z-10">
                          {getRankIcon(index + 1)}
                        </div>
                        
                        {/* 短剧卡片 */}
                        <DramaCard
                          drama={drama}
                          onClick={onDramaClick}
                          className="border-0 shadow-none"
                        />
                        
                        {/* 排名信息 */}
                        <div className="mt-3 text-center">
                          <div className="text-sm text-muted-foreground">
                            {type === 'rating' && `评分 ${drama.rating}`}
                            {type === 'views' && `观看 ${drama.views}`}
                            {type === 'hot' && '热门推荐'}
                            {type === 'new' && '最新上线'}
                            {type === 'trending' && '热门趋势'}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* 其余排名列表显示 */}
                  {currentRankingData.length > 3 && (
                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-4">完整榜单</h3>
                      <div className="space-y-3">
                        {currentRankingData.slice(3).map((drama, index) => (
                          <div
                            key={drama.id}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => onDramaClick?.(drama)}
                          >
                            {/* 排名 */}
                            <div className="flex-shrink-0 w-8 text-center">
                              <span className="text-lg font-bold text-muted-foreground">
                                {index + 4}
                              </span>
                            </div>

                            {/* 海报 */}
                            <div className="flex-shrink-0">
                              <img
                                src={drama.poster}
                                alt={drama.title}
                                className="w-12 h-16 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.src = '/images/placeholder.jpg';
                                }}
                              />
                            </div>

                            {/* 信息 */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{drama.title}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {drama.description}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span>{drama.category}</span>
                                <span>{drama.episodes}集</span>
                                <span>{drama.status}</span>
                              </div>
                            </div>

                            {/* 数据 */}
                            <div className="flex-shrink-0 text-right">
                              <div className="text-sm font-medium">
                                {type === 'rating' && `${drama.rating}分`}
                                {type === 'views' && drama.views}
                                {(type === 'hot' || type === 'trending') && `${drama.rating}分`}
                                {type === 'new' && new Date(drama.releaseDate).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {type !== 'views' && drama.views}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">暂无榜单数据</p>
                  <p className="text-sm text-muted-foreground">请稍后再试</p>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* 底部安全距离 */}
        <div className="h-20" />
      </div>
    </div>
  );
};
