import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Heart, 
  Clock, 
  Film, 
  Wifi, 
  AlertCircle,
  FileX,
  Users,
  MessageCircle
} from 'lucide-react';

interface EmptyStateProps {
  type?: 'search' | 'favorites' | 'history' | 'dramas' | 'offline' | 'error' | 'comments' | 'users' | 'custom';
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const defaultConfigs = {
  search: {
    icon: <Search className="w-12 h-12 opacity-50" />,
    title: '没有找到相关内容',
    description: '试试调整搜索关键词或筛选条件'
  },
  favorites: {
    icon: <Heart className="w-12 h-12 opacity-50" />,
    title: '还没有收藏任何短剧',
    description: '发现喜欢的短剧就收藏起来吧'
  },
  history: {
    icon: <Clock className="w-12 h-12 opacity-50" />,
    title: '暂无观看记录',
    description: '开始观看短剧，这里会显示您的观看历史'
  },
  dramas: {
    icon: <Film className="w-12 h-12 opacity-50" />,
    title: '暂无短剧',
    description: '该分类下还没有短剧，请稍后再来看看'
  },
  offline: {
    icon: <Wifi className="w-12 h-12 opacity-50" />,
    title: '网络连接失败',
    description: '请检查您的网络连接后重试'
  },
  error: {
    icon: <AlertCircle className="w-12 h-12 opacity-50" />,
    title: '出现了一些问题',
    description: '请稍后重试或联系客服'
  },
  comments: {
    icon: <MessageCircle className="w-12 h-12 opacity-50" />,
    title: '还没有评论',
    description: '成为第一个发表评论的人吧'
  },
  users: {
    icon: <Users className="w-12 h-12 opacity-50" />,
    title: '暂无用户',
    description: '还没有找到相关用户'
  },
  custom: {
    icon: <FileX className="w-12 h-12 opacity-50" />,
    title: '暂无内容',
    description: '这里还没有任何内容'
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'custom',
  title,
  description,
  icon,
  action,
  className
}) => {
  const config = defaultConfigs[type];
  
  const finalIcon = icon || config.icon;
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;

  return (
    <Card className={cn('p-12 text-center', className)}>
      <div className="flex flex-col items-center space-y-4">
        {/* 图标 */}
        <div className="text-muted-foreground">
          {finalIcon}
        </div>

        {/* 标题 */}
        <h3 className="text-lg font-medium text-foreground">
          {finalTitle}
        </h3>

        {/* 描述 */}
        <p className="text-sm text-muted-foreground max-w-sm">
          {finalDescription}
        </p>

        {/* 操作按钮 */}
        {action && (
          <Button
            onClick={action.onClick}
            variant="outline"
            className="mt-4"
          >
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  );
};

interface EmptyStateInlineProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export const EmptyStateInline: React.FC<EmptyStateInlineProps> = ({
  icon = <FileX className="w-8 h-8 opacity-50" />,
  title,
  description,
  className
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
      <div className="text-muted-foreground mb-3">
        {icon}
      </div>
      <h4 className="font-medium text-foreground mb-1">
        {title}
      </h4>
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};
