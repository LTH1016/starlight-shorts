import React, { useState } from 'react';
import { Drama } from '@/types/drama';
import { useDramas, useRecommendations } from '@/hooks/useDramas';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { HotRecommendation, NewRecommendation, TrendingRecommendation } from '@/components/RecommendationSection';
import { DramaCard } from '@/components/DramaCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Flame,
  Sparkles,
  TrendingUp,
  Play,
  Star,
  Clock
} from 'lucide-react';

interface HomePageProps {
  onDramaClick?: (drama: Drama) => void;
  onCategoryChange?: (categoryId: string | null) => void;
  onSearch?: (query: string) => void;
  onCategoryClick?: () => void;
  onRankingClick?: () => void;
  className?: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  onDramaClick,
  onCategoryChange,
  onSearch,
  onCategoryClick,
  onRankingClick,
  className = ''
}) => {
  const { dramaData, loading } = useDramas();
  const recommendations = useRecommendations();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  if (loading) {
    return <HomePageSkeleton />;
  }

  if (!dramaData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">加载失败，请重试</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            重新加载
          </Button>
        </div>
      </div>
    );
  }

  // 获取精选短剧（热门短剧的前几个）
  const featuredDrama = recommendations.hot[0];

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="container mx-auto px-4 py-6 space-y-8">

        {/* 精选推荐横幅 */}
        {featuredDrama && (
          <Card className="relative overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30">
            <div className="flex items-center p-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    编辑推荐
                  </Badge>
                  {featuredDrama.isHot && (
                    <Badge variant="destructive">
                      <Flame className="w-3 h-3 mr-1" />
                      热门
                    </Badge>
                  )}
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {featuredDrama.title}
                  </h2>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {featuredDrama.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{featuredDrama.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{featuredDrama.duration}</span>
                  </div>
                  <span>{featuredDrama.episodes}集</span>
                </div>

                <Button 
                  onClick={() => onDramaClick?.(featuredDrama)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Play className="w-4 h-4 mr-2" fill="currentColor" />
                  立即观看
                </Button>
              </div>

              <div className="hidden sm:block flex-shrink-0 ml-6">
                <img
                  src={featuredDrama.poster}
                  alt={featuredDrama.title}
                  className="w-32 h-44 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </Card>
        )}



        {/* 分类筛选 */}
        <CategoryFilter
          categories={dramaData.categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* 推荐区块 */}
        <div className="space-y-12">
          {/* 热门短剧 */}
          <HotRecommendation
            dramas={recommendations.hot}
            onDramaClick={onDramaClick}
            onSeeMore={onRankingClick}
          />

          {/* 最新上线 */}
          <NewRecommendation
            dramas={recommendations.new}
            onDramaClick={onDramaClick}
            onSeeMore={onRankingClick}
          />

          {/* 趋势榜单 */}
          <TrendingRecommendation
            dramas={recommendations.trending}
            onDramaClick={onDramaClick}
            onSeeMore={onRankingClick}
          />
        </div>

        {/* 全部短剧网格 */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6">全部短剧</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {dramaData.dramas
              .filter(drama => !selectedCategory || drama.category === selectedCategory)
              .map((drama) => (
                <DramaCard
                  key={drama.id}
                  drama={drama}
                  onClick={onDramaClick}
                />
              ))}
          </div>
        </section>

        {/* 底部安全距离 */}
        <div className="h-20" />
      </div>
    </div>
  );
};

// 加载骨架屏
const HomePageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* 搜索栏骨架 */}
      <Skeleton className="h-12 w-full rounded-xl" />
      
      {/* 精选推荐骨架 */}
      <Skeleton className="h-48 w-full rounded-lg" />
      
      {/* 分类筛选骨架 */}
      <div className="flex gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      
      {/* 推荐区块骨架 */}
      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, cardIndex) => (
              <div key={cardIndex} className="flex-shrink-0 w-48 space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
