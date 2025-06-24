export interface Drama {
  id: string;
  title: string;
  description: string;
  poster: string;
  category: string;
  tags: string[];
  rating: number;
  views: string;
  duration: string;
  episodes: number;
  status: string;
  actors: string[];
  releaseDate: string;
  isHot: boolean;
  isNew: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface DramaData {
  categories: Category[];
  dramas: Drama[];
  hotTags: string[];
  recommendations: {
    hot: string[];
    new: string[];
    trending: string[];
  };
}

export type FilterType = 'all' | 'hot' | 'new' | 'category';

export interface FilterOptions {
  type: FilterType;
  categoryId?: string;
  searchQuery?: string;
}
