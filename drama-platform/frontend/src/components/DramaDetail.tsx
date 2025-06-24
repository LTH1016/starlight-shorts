import React, { useState } from 'react';
import { 
  Play, 
  Heart, 
  Share2, 
  Star, 
  Eye, 
  Calendar, 
  Clock, 
  Film,
  ArrowLeft,
  Download,
  MessageCircle
} from 'lucide-react';
import { Drama } from '@/types/drama';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DramaDetailProps {
  drama: Drama;
  onBack?: () => void;
  onPlay?: (drama: Drama) => void;
  className?: string;
}

export const DramaDetail: React.FC<DramaDetailProps> = ({
  drama,
  onBack,
  onPlay,
  className = ''
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: drama.title,
          text: drama.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('分享取消');
      }
    } else {
      // 降级到复制链接
      navigator.clipboard.writeText(window.location.href);
      // 这里可以显示提示消息
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handlePlay = () => {
    onPlay?.(drama);
  };

  // 生成剧集列表
  const episodes = Array.from({ length: drama.episodes }, (_, i) => i + 1);

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* 返回按钮 */}
      {onBack && (
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      )}

      <ScrollArea className="h-full">
        {/* 海报和基本信息 */}
        <div className="relative">
          {/* 背景模糊海报 */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={drama.poster}
              alt=""
              className="w-full h-full object-cover scale-110 blur-xl opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>

          {/* 内容 */}
          <div className="relative p-6 pt-12">
            <div className="flex gap-6 mb-6">
              {/* 海报 */}
              <div className="flex-shrink-0">
                <img
                  src={drama.poster}
                  alt={drama.title}
                  className="w-32 h-44 object-cover rounded-xl shadow-lg"
                />
              </div>

              {/* 基本信息 */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground mb-2">{drama.title}</h1>
                
                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {drama.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* 统计信息 */}
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{drama.rating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{drama.views}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    <span>{drama.episodes}集</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{drama.duration}</span>
                  </div>
                </div>

                {/* 状态 */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge 
                    variant={drama.status === '完结' ? 'default' : 'secondary'}
                    className={drama.status === '完结' ? 'bg-green-600' : 'bg-orange-600'}
                  >
                    {drama.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(drama.releaseDate).toLocaleDateString('zh-CN')} 上线
                  </span>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 mb-6">
              <Button onClick={handlePlay} className="flex-1 h-12 text-lg font-medium">
                <Play className="w-5 h-5 mr-2" fill="currentColor" />
                立即播放
              </Button>
              
              <Button
                variant="outline"
                onClick={toggleFavorite}
                className={`px-4 h-12 ${isFavorited ? 'text-red-500 border-red-500' : ''}`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
              
              <Button variant="outline" onClick={handleShare} className="px-4 h-12">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* 详细信息区域 */}
        <div className="px-6 space-y-6">
          {/* 剧情简介 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">剧情简介</h3>
            <p className="text-muted-foreground leading-relaxed">{drama.description}</p>
          </Card>

          {/* 演员表 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">主要演员</h3>
            <div className="flex flex-wrap gap-2">
              {drama.actors.map((actor, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {actor}
                </Badge>
              ))}
            </div>
          </Card>

          {/* 选集 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">选集播放</h3>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
              {episodes.map((episode) => (
                <Button
                  key={episode}
                  variant={selectedEpisode === episode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedEpisode(episode)}
                  className="aspect-square p-0 text-sm"
                >
                  {episode}
                </Button>
              ))}
            </div>
          </Card>

          {/* 评论区域 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">评论区</h3>
              <Button variant="ghost" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                发表评论
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* 示例评论 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-medium">
                    用
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">用户123456</span>
                      <span className="text-xs text-muted-foreground">2小时前</span>
                    </div>
                    <p className="text-sm text-muted-foreground">这部剧真的太好看了！剧情紧凑，演员演技在线，强烈推荐！</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-medium">
                    小
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">小仙女</span>
                      <span className="text-xs text-muted-foreground">5小时前</span>
                    </div>
                    <p className="text-sm text-muted-foreground">男主好帅啊，女主也很漂亮，cp感十足💕</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 底部安全距离 */}
          <div className="h-20" />
        </div>
      </ScrollArea>
    </div>
  );
};
