import React, { useState, useMemo } from 'react';
import { Drama, Category } from '@/types/drama';
import { useDramas, useFilteredDramas } from '@/hooks/useDramas';
import { DramaCard } from '@/components/DramaCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Grid3X3, 
  List,
  Calendar,
  Star,
  Eye,
  TrendingUp,
  Filter,
  ArrowLeft
} from 'lucide-react';

interface CategoryPageProps {
  selectedCategory?: string | null;
  onDramaClick?: (drama: Drama) => void;
  onBack?: () => void;
  className?: string;
}

type SortOption = 'latest' | 'rating' | 'views' | 'trending';
type ViewMode = 'grid' | 'list';

export const CategoryPage: React.FC<CategoryPageProps> = ({
  selectedCategory = null,
  onDramaClick,
  onBack,
  className = ''
}) => {
  const { dramaData, loading } = useDramas();
  const [currentCategory, setCurrentCategory] = useState<string | null>(selectedCategory);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filteredDramas = useFilteredDramas({
    type: currentCategory ? 'category' : 'all',
    categoryId: currentCategory || undefined,
  });

  // 排序逻辑
  const sortedDramas = useMemo(() => {
    const sorted = [...filteredDramas];
    
    switch (sortBy) {
      case 'latest':
        return sorted.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'views':
        return sorted.sort((a, b) => {
          const aViews = parseFloat(a.views.replace('万', ''));
          const bViews = parseFloat(b.views.replace('万', ''));
          return bViews - aViews;
        });
      case 'trending':
        return sorted.sort((a, b) => {
          const aScore = a.rating * (a.isHot ? 1.5 : 1) * parseFloat(a.views.replace('万', ''));
          const bScore = b.rating * (b.isHot ? 1.5 : 1) * parseFloat(b.views.replace('万', ''));
          return bScore - aScore;
        });
      default:
        return sorted;
    }
  }, [filteredDramas, sortBy]);

  // 分类统计
  const categoryStats = useMemo(() => {
    if (!dramaData) return {};
    
    const stats: Record<string, { count: number; avgRating: number; totalViews: number }> = {};
    
    dramaData.categories.forEach(category => {
      const categoryDramas = dramaData.dramas.filter(d => d.category === category.id);
      const totalViews = categoryDramas.reduce((sum, d) => sum + parseFloat(d.views.replace('万', '')), 0);
      const avgRating = categoryDramas.length > 0 
        ? categoryDramas.reduce((sum, d) => sum + d.rating, 0) / categoryDramas.length 
        : 0;
      
      stats[category.id] = {
        count: categoryDramas.length,
        avgRating: Math.round(avgRating * 10) / 10,
        totalViews: Math.round(totalViews * 10) / 10
      };
    });
    
    return stats;
  }, [dramaData]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (!dramaData) {
    return <div className="flex items-center justify-center min-h-screen">加载失败</div>;
  }

  const currentCategoryData = currentCategory 
    ? dramaData.categories.find(c => c.id === currentCategory)
    : null;

  const getSortIcon = (option: SortOption) => {
    switch (option) {
      case 'latest': return <Calendar className="w-4 h-4" />;
      case 'rating': return <Star className="w-4 h-4" />;
      case 'views': return <Eye className="w-4 h-4" />;
      case 'trending': return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'latest': return '最新上线';
      case 'rating': return '评分最高';
      case 'views': return '观看最多';
      case 'trending': return '综合热度';
    }
  };

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
            <h1 className="text-2xl font-bold">分类浏览</h1>
          </div>
        )}

        {/* 分类选择器 */}
        <Card className="p-4 mb-6 bg-card/50 backdrop-blur-sm">
          <h2 className="text-lg font-semibold mb-3">选择分类</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* 全部分类 */}
            <div
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                currentCategory === null
                  ? 'border-pink-500 bg-pink-500/10 shadow-md'
                  : 'border-gray-700 bg-gray-800/50 hover:border-pink-400 hover:bg-pink-500/5'
              }`}
              onClick={() => setCurrentCategory(null)}
            >
              <div className="text-center">
                <div className="text-sm font-medium text-white">全部</div>
                <div className="text-xs text-gray-400 mt-1">
                  {dramaData.dramas.length} 部
                </div>
              </div>
            </div>

            {/* 各个分类 */}
            {dramaData.categories.map((category) => {
              const stats = categoryStats[category.id] || { count: 0, avgRating: 0, totalViews: 0 };
              return (
                <div
                  key={category.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                    currentCategory === category.id
                      ? 'border-pink-500 bg-pink-500/10 shadow-md'
                      : 'border-gray-700 bg-gray-800/50 hover:border-pink-400 hover:bg-pink-500/5'
                  }`}
                  onClick={() => setCurrentCategory(category.id)}
                >
                  <div className="text-center">
                    <div
                      className="w-6 h-6 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="text-sm font-medium text-white">{category.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {stats.count} 部 · {stats.avgRating}分
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 当前分类信息 */}
        {currentCategoryData && (
          <Card
            className="p-4 mb-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-l-4"
            style={{ borderLeftColor: currentCategoryData.color }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold mb-2 text-white">{currentCategoryData.name}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span>共 {categoryStats[currentCategoryData.id]?.count || 0} 部短剧</span>
                  <span>平均评分 {categoryStats[currentCategoryData.id]?.avgRating || 0}</span>
                  <span>总观看量 {categoryStats[currentCategoryData.id]?.totalViews || 0}万</span>
                </div>
              </div>
              <Badge
                className="text-white font-medium px-3 py-1"
                style={{ backgroundColor: currentCategoryData.color }}
              >
                {currentCategoryData.name}
              </Badge>
            </div>
          </Card>
        )}

        {/* 排序和视图控制 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                {(['latest', 'rating', 'views', 'trending'] as SortOption[]).map((option) => (
                  <SelectItem key={option} value={option}>
                    <div className="flex items-center gap-2">
                      {getSortIcon(option)}
                      {getSortLabel(option)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 结果统计 */}
        <div className="mb-6">
          <div className="text-sm text-muted-foreground">
            找到 <span className="font-medium text-foreground">{sortedDramas.length}</span> 部短剧
            {currentCategoryData && (
              <span className="ml-2">
                · 分类: <span className="font-medium" style={{ color: currentCategoryData.color }}>
                  {currentCategoryData.name}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* 短剧列表 */}
        {sortedDramas.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
              : 'space-y-4'
          }>
            {sortedDramas.map((drama) => (
              <DramaCard
                key={drama.id}
                drama={drama}
                onClick={onDramaClick}
                className={viewMode === 'list' ? 'flex flex-row' : ''}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground mb-4">
              <Grid3X3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">该分类暂无短剧</p>
              <p className="text-sm">试试其他分类或查看全部短剧</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentCategory(null)}
            >
              查看全部短剧
            </Button>
          </Card>
        )}

        {/* 底部安全距离 */}
        <div className="h-20" />
      </div>
    </div>
  );
};
