import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Reply, MoreHorizontal, Flag, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

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

interface CommentSectionProps {
  dramaId: string;
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => void;
  onLikeComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onReportComment: (commentId: string) => void;
  currentUserId?: string;
}

const CommentItem: React.FC<{
  comment: Comment;
  onReply: (commentId: string, content: string) => void;
  onLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onReport: (commentId: string) => void;
  currentUserId?: string;
  isReply?: boolean;
}> = ({ comment, onReply, onLike, onDelete, onReport, currentUserId, isReply = false }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`${isReply ? 'ml-12 mt-3' : 'mb-6'}`}>
      <div className="flex space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.avatar} />
          <AvatarFallback>{comment.username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white">{comment.username}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">{formatTime(comment.createdAt)}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {currentUserId === comment.userId ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            删除评论
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认删除</AlertDialogTitle>
                            <AlertDialogDescription>
                              确定要删除这条评论吗？此操作无法撤销。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(comment.id)}>
                              删除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <DropdownMenuItem onClick={() => onReport(comment.id)}>
                        <Flag className="w-4 h-4 mr-2" />
                        举报
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed">{comment.content}</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(comment.id)}
              className={`h-8 px-2 ${comment.isLiked ? 'text-pink-500' : 'text-gray-400'} hover:text-pink-500`}
            >
              <Heart className={`w-4 h-4 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
              {comment.likes > 0 && <span className="text-xs">{comment.likes}</span>}
            </Button>
            
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="h-8 px-2 text-gray-400 hover:text-white"
              >
                <Reply className="w-4 h-4 mr-1" />
                <span className="text-xs">回复</span>
              </Button>
            )}
          </div>
          
          {showReplyForm && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder={`回复 @${comment.username}`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(false)}
                >
                  取消
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  回复
                </Button>
              </div>
            </div>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onLike={onLike}
                  onDelete={onDelete}
                  onReport={onReport}
                  currentUserId={currentUserId}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CommentSection: React.FC<CommentSectionProps> = ({
  dramaId,
  comments,
  onAddComment,
  onLikeComment,
  onDeleteComment,
  onReportComment,
  currentUserId
}) => {
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes'>('newest');

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const handleReply = (parentId: string, content: string) => {
    onAddComment(content, parentId);
  };

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'likes':
        return b.likes - a.likes;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          评论 ({comments.length})
        </h3>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white"
        >
          <option value="newest">最新</option>
          <option value="oldest">最早</option>
          <option value="likes">最热</option>
        </select>
      </div>
      
      {/* 评论输入框 */}
      <div className="mb-6">
        <Textarea
          placeholder="写下你的评论..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px] bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
        <div className="flex justify-end mt-3">
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className="bg-pink-600 hover:bg-pink-700"
          >
            发表评论
          </Button>
        </div>
      </div>
      
      {/* 评论列表 */}
      <div className="space-y-4">
        {sortedComments.length > 0 ? (
          sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onLike={onLikeComment}
              onDelete={onDeleteComment}
              onReport={onReportComment}
              currentUserId={currentUserId}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>还没有评论，来发表第一条评论吧！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
