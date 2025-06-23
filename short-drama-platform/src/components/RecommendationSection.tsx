import React from 'react';
import { Drama } from '@/types/drama';
import { DramaCard } from './DramaCard';
import { Button } from '@/components/ui/button';
import { ChevronRight, TrendingUp, Sparkles, Flame } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RecommendationSectionProps {
  title: string;
  dramas: Drama[];
  icon?: React.ReactNode;
  onDramaClick?: (drama: Drama) => void;
  onSeeMore?: () => void;
  className?: string;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  title,
  dramas,
  icon,
  onDramaClick,
  onSeeMore,
  className = ''
}) => {
  if (dramas.length === 0) return null;

  return (
    <section className={`${className}`}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary">{icon}</div>}
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>
        
        {onSeeMore && (
          <Button
            variant="ghost"
            onClick={onSeeMore}
            className="text-primary hover:text-primary/90 p-2"
          >
            查看更多
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {/* 横向滚动的短剧列表 */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {dramas.map((drama) => (
            <div key={drama.id} className="flex-shrink-0 w-48">
              <DramaCard
                drama={drama}
                onClick={onDramaClick}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </section>
  );
};

// 预定义的推荐区块组件
export const HotRecommendation: React.FC<Omit<RecommendationSectionProps, 'title' | 'icon'>> = (props) => (
  <RecommendationSection
    {...props}
    title="🔥 热门短剧"
    icon={<Flame className="w-5 h-5" />}
  />
);

export const NewRecommendation: React.FC<Omit<RecommendationSectionProps, 'title' | 'icon'>> = (props) => (
  <RecommendationSection
    {...props}
    title="✨ 最新上线"
    icon={<Sparkles className="w-5 h-5" />}
  />
);

export const TrendingRecommendation: React.FC<Omit<RecommendationSectionProps, 'title' | 'icon'>> = (props) => (
  <RecommendationSection
    {...props}
    title="📈 趋势榜单"
    icon={<TrendingUp className="w-5 h-5" />}
  />
);
