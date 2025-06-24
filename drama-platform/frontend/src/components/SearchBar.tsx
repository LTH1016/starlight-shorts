import React, { useState, useEffect } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  hotTags?: string[];
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "搜索短剧、演员或标签...",
  hotTags = [],
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // 从localStorage获取最近搜索
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // 保存到最近搜索
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      
      onSearch(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setQuery('');
    onSearch('');
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    handleSearch(tag);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className={`relative ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
            }
          }}
          className="pl-10 pr-12 py-3 bg-muted/50 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:bg-card focus:border-primary/50 transition-all"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto w-auto hover:bg-muted rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* 搜索建议面板 */}
      {showSuggestions && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowSuggestions(false)}
          />
          
          {/* 建议内容 */}
          <Card className="absolute top-full left-0 right-0 mt-2 p-4 bg-card border-border shadow-lg z-50">
            {/* 热门标签 */}
            {hotTags.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">热门搜索</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hotTags.slice(0, 8).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 最近搜索 */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">最近搜索</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="text-xs text-muted-foreground hover:text-foreground p-1 h-auto"
                  >
                    清除
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 6).map((search, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleTagClick(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 空状态 */}
            {hotTags.length === 0 && recentSearches.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">开始搜索发现精彩短剧</p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
