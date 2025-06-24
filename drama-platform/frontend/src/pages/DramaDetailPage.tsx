import React, { useState, useEffect } from 'react';
import { Heart, Play, Star, Calendar, Clock, Eye, Share2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import VideoPlayer from '../components/VideoPlayer';
import CommentSection from '../components/CommentSection';
import SocialShare from '../components/SocialShare';
import { useDramas } from '../hooks/useDramas';

interface Episode {
  id: string;
  number: number;
  title: string;
  duration: number;
  videoUrl: string;
  thumbnail?: string;
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
  parentId?: string;
}

const DramaDetailPage: React.FC = () => {
  // 暂时使用第一个短剧作为示例，实际应用中会从路由参数获取
  const { dramaData, loading, error } = useDramas();
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [watchProgress, setWatchProgress] = useState<Record<string, number>>({});

  const dramas = dramaData?.dramas || [];
  const drama = dramas[0]; // 暂时使用第一个短剧

  const toggleFavorite = (id: string) => {
    // 暂时的收藏功能实现
    console.log('Toggle favorite for drama:', id);
  };

  // 调试信息
  console.log('DramaDetailPage - dramaData:', dramaData);
  console.log('DramaDetailPage - dramas:', dramas);
  console.log('DramaDetailPage - drama:', drama);
  console.log('DramaDetailPage - loading:', loading);
  console.log('DramaDetailPage - error:', error);

  // 模拟剧集数据
  const episodes: Episode[] = drama ? Array.from({ length: 12 }, (_, i) => ({
    id: `${drama.id}-ep-${i + 1}`,
    number: i + 1,
    title: `第${i + 1}集`,
    duration: 25 * 60, // 25分钟
    videoUrl: `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`,
    thumbnail: drama.poster
  })) : [];

  // 模拟评论数据
  useEffect(() => {
    if (drama) {
      const mockComments: Comment[] = [
        {
          id: '1',
          userId: 'user1',
          username: '剧迷小王',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
          content: '这部剧真的太好看了！剧情紧凑，演员演技也很棒，强烈推荐！',
          likes: 15,
          isLiked: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          replies: [
            {
              id: '1-1',
              userId: 'user2',
              username: '追剧达人',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
              content: '同感！特别是男主的演技，真的很有代入感',
              likes: 3,
              isLiked: true,
              createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              parentId: '1'
            }
          ]
        },
        {
          id: '2',
          userId: 'user3',
          username: '电视剧爱好者',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
          content: '画面质感很棒，制作很用心。期待后续剧情发展！',
          likes: 8,
          isLiked: false,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ];
      setComments(mockComments);
    }
  }, [drama]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载失败: {error}</div>
      </div>
    );
  }

  if (!dramaData || !dramas.length) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">
          {!dramaData ? '数据未加载' : '没有短剧数据'}
          <br />
          <small>dramaData: {JSON.stringify(!!dramaData)}</small>
          <br />
          <small>dramas length: {dramas.length}</small>
        </div>
      </div>
    );
  }

  if (!drama) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">短剧未找到</div>
      </div>
    );
  }

  const handleEpisodeChange = (index: number) => {
    setCurrentEpisodeIndex(index);
  };

  const handleProgressUpdate = (episodeId: string, progress: number) => {
    setWatchProgress(prev => ({
      ...prev,
      [episodeId]: progress
    }));
  };

  const handleAddComment = (content: string, parentId?: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: 'current-user',
      username: '当前用户',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
      content,
      likes: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      parentId
    };

    if (parentId) {
      // 添加回复
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newComment]
          };
        }
        return comment;
      }));
    } else {
      // 添加新评论
      setComments(prev => [newComment, ...prev]);
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        };
      }
      // 处理回复的点赞
      if (comment.replies) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                isLiked: !reply.isLiked,
                likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
              };
            }
            return reply;
          })
        };
      }
      return comment;
    }));
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => {
      if (comment.id === commentId) return false;
      if (comment.replies) {
        comment.replies = comment.replies.filter(reply => reply.id !== commentId);
      }
      return true;
    }));
  };

  const handleReportComment = (commentId: string) => {
    // 实现举报功能
    console.log('举报评论:', commentId);
  };

  const currentEpisode = episodes[currentEpisodeIndex];
  const savedProgress = currentEpisode ? watchProgress[currentEpisode.id] || 0 : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 视频播放器 */}
        <div className="mb-8">
          <VideoPlayer
            episodes={episodes}
            currentEpisodeIndex={currentEpisodeIndex}
            onEpisodeChange={handleEpisodeChange}
            onProgressUpdate={handleProgressUpdate}
            autoPlay={false}
            savedProgress={savedProgress}
          />
        </div>

        {/* 短剧信息 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{drama.title}</h1>
                <div className="flex items-center space-x-4 text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span>{drama.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{drama.views}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>2024</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>共{episodes.length}集</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <SocialShare
                  title={drama.title}
                  description={drama.description}
                  imageUrl={drama.poster}
                  hashtags={['短剧', ...drama.tags.slice(0, 2)]}
                />
                <Button
                  onClick={() => toggleFavorite(drama.id)}
                  variant="outline"
                  className="hover:bg-pink-600 hover:text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  收藏
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {drama.tags.map((tag, index) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>

            <p className="text-gray-300 leading-relaxed mb-6">
              {drama.description}
            </p>

            {/* 剧集列表 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">剧集列表</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {episodes.map((episode, index) => (
                  <Button
                    key={episode.id}
                    onClick={() => setCurrentEpisodeIndex(index)}
                    variant={index === currentEpisodeIndex ? "default" : "outline"}
                    className={`h-12 ${index === currentEpisodeIndex ? 'bg-pink-600 hover:bg-pink-700' : ''}`}
                  >
                    {episode.number}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* 侧边栏 - 推荐短剧 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">相关推荐</h3>
            <div className="space-y-4">
              {dramas.slice(0, 5).map((relatedDrama) => (
                <div key={relatedDrama.id} className="flex space-x-3">
                  <img
                    src={relatedDrama.poster}
                    alt={relatedDrama.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">
                      {relatedDrama.title}
                    </h4>
                    <div className="flex items-center text-xs text-gray-400">
                      <Star className="w-3 h-3 text-yellow-500 mr-1" />
                      <span>{relatedDrama.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 评论区 */}
        <CommentSection
          dramaId={drama.id}
          comments={comments}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          onDeleteComment={handleDeleteComment}
          onReportComment={handleReportComment}
          currentUserId="current-user"
        />
      </div>
    </div>
  );
};

export default DramaDetailPage;
