import React from 'react';
import { Play, Heart, Star, Eye, Share2, MessageCircle } from 'lucide-react';
import { Drama } from '@/types/drama';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SocialShare from './SocialShare';

interface DramaCardProps {
  drama: Drama;
  onClick?: (drama: Drama) => void;
  className?: string;
}

export const DramaCard: React.FC<DramaCardProps> = ({ drama, onClick, className = '' }) => {
  const handleClick = () => {
    onClick?.(drama);
  };

  return (
    <div 
      className={`group relative bg-card rounded-xl overflow-hidden border border-border drama-card-hover cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* 海报图片 */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={drama.poster}
          alt={drama.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* 播放按钮覆盖层 */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button 
            size="lg" 
            className="rounded-full bg-primary hover:bg-primary/90 text-white border-2 border-white/20"
          >
            <Play className="w-6 h-6 ml-1" fill="currentColor" />
          </Button>
        </div>

        {/* 状态标签 */}
        <div className="absolute top-3 left-3 flex gap-2">
          {drama.isHot && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white border-0">
              🔥 热播
            </Badge>
          )}
          {drama.isNew && (
            <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
              ✨ 新剧
            </Badge>
          )}
        </div>

        {/* 时长 */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="secondary" className="bg-black/60 text-white border-0">
            {drama.duration}
          </Badge>
        </div>

        {/* 分享按钮 */}
        <div className="absolute top-2 right-2">
          <div onClick={(e) => e.stopPropagation()}>
            <SocialShare
              title={drama.title}
              description={drama.description}
              imageUrl={drama.poster}
              hashtags={['短剧', ...drama.tags.slice(0, 2)]}
              size="sm"
            />
          </div>
        </div>

        {/* 渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 video-overlay" />
      </div>

      {/* 内容信息 */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-drama-primary mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {drama.title}
        </h3>
        
        <p className="text-sm text-drama-secondary mb-3 line-clamp-2">
          {drama.description}
        </p>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1 mb-3">
          {drama.tags.slice(0, 3).map((tag, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-xs border-primary/30 text-primary bg-primary/10"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* 统计信息 */}
        <div className="flex items-center justify-between text-sm text-drama-secondary">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{drama.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="font-medium">{drama.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">{Math.floor(Math.random() * 100) + 10}</span>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:text-red-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // 处理收藏逻辑
            }}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        {/* 演员信息 */}
        <div className="mt-2 text-xs text-drama-secondary">
          主演: {drama.actors.join(' / ')}
        </div>
      </div>
    </div>
  );
};
