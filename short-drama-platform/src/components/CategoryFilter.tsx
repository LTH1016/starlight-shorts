import React from 'react';
import { Category } from '@/types/drama';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  className?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  className = ''
}) => {
  return (
    <div className={`${className}`}>
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-4">
          {/* 全部分类 */}
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className={`
              px-4 py-2 cursor-pointer transition-all duration-200 whitespace-nowrap
              ${selectedCategory === null
                ? 'bg-pink-500 text-white hover:bg-pink-600 border-pink-500'
                : 'bg-gray-800 text-gray-400 hover:bg-pink-500 hover:text-white border-gray-700'
              }
            `}
            onClick={() => onCategoryChange(null)}
          >
            全部
          </Badge>

          {/* 分类列表 */}
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`
                px-4 py-2 cursor-pointer transition-all duration-200 whitespace-nowrap
                ${selectedCategory === category.id
                  ? 'bg-pink-500 text-white hover:bg-pink-600 border-pink-500'
                  : 'bg-gray-800 text-gray-400 hover:bg-pink-500 hover:text-white border-gray-700'
                }
              `}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
