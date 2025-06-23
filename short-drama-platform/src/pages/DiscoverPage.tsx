import React, { useState } from 'react';
import { Drama } from '@/types/drama';
import { useDramas, useFilteredDramas } from '@/hooks/useDramas';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { DramaCard } from '@/components/DramaCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Filter, 
  Grid3X3, 
  List,
  SortAsc,
  SortDesc,
  Calendar,
  Star,
  Eye,
  TrendingUp
} from 'lucide-react';

interface DiscoverPageProps {
  onDramaClick?: (drama: Drama) => void;
  className?: string;
}

type SortOption = 'latest' | 'rating' | 'views' | 'trending';
type ViewMode = 'grid' | 'list';

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  onDramaClick,
  className = ''
}) => {
  const { dramaData, loading } = useDramas();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filteredDramas = useFilteredDramas({
    type: selectedCategory ? 'category' : 'all',
    categoryId: selectedCategory || undefined,
    searchQuery: searchQuery || undefined,
  });

  // 排序逻辑
  const sortedDramas = React.useMemo(() => {
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
          // 综合热度排序：结合评分、观看量、是否热门等
          const aScore = a.rating * (a.isHot ? 1.5 : 1) * parseFloat(a.views.replace('万', ''));
          const bScore = b.rating * (b.isHot ? 1.5 : 1) * parseFloat(b.views.replace('万', ''));
          return bScore - aScore;
        });
      default:
        return sorted;
    }
  }, [filteredDramas, sortBy]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (!dramaData) {
    return <div className="flex items-center justify-center min-h-screen">加载失败</div>;
  }

  const getSortIcon = (option: SortOption) => {
    switch (option) {
      case 'latest':
        return <Calendar className="w-4 h-4" />;
      case 'rating':
        return <Star className="w-4 h-4" />;
      case 'views':
        return <Eye className="w-4 h-4" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'latest':
        return '最新上线';
      case 'rating':
        return '评分最高';
      case 'views':
        return '观看最多';
      case 'trending':
        return '综合热度';
    }
  };

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* 搜索栏 */}
        <SearchBar
          onSearch={setSearchQuery}
          hotTags={dramaData.hotTags}
          className="mb-6"
        />

        {/* 筛选和排序控制栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>

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

        {/* 筛选面板 */}
        {showFilters && (
          <Card className="p-4 mb-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">按分类筛选</h4>
                <CategoryFilter
                  categories={dramaData.categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>

              {/* 标签筛选 */}
              <div>
                <h4 className="font-medium mb-3">热门标签</h4>
                <div className="flex flex-wrap gap-2">
                  {dramaData.hotTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                      onClick={() => setSearchQuery(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 结果统计 */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            找到 <span className="font-medium text-foreground">{sortedDramas.length}</span> 部短剧
            {selectedCategory && (
              <span className="ml-2">
                · 分类: <span className="font-medium text-primary">
                  {dramaData.categories.find(c => c.id === selectedCategory)?.name}
                </span>
              </span>
            )}
            {searchQuery && (
              <span className="ml-2">
                · 搜索: <span className="font-medium text-primary">"{searchQuery}"</span>
              </span>
            )}
          </div>

          {(selectedCategory || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}
            >
              清除筛选
            </Button>
          )}
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
              <p className="text-lg mb-2">暂无符合条件的短剧</p>
              <p className="text-sm">试试调整筛选条件或搜索其他关键词</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}
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
