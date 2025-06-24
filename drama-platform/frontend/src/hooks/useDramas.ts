import { useState, useEffect, useMemo } from 'react';
import { Drama, DramaData, FilterOptions } from '@/types/drama';

export const useDramas = () => {
  const [dramaData, setDramaData] = useState<DramaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDramas = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/dramas.json');
        if (!response.ok) {
          throw new Error('Failed to fetch drama data');
        }
        const data: DramaData = await response.json();
        setDramaData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDramas();
  }, []);

  return { dramaData, loading, error };
};

export const useFilteredDramas = (filters: FilterOptions) => {
  const { dramaData } = useDramas();

  const filteredDramas = useMemo(() => {
    if (!dramaData) return [];

    let result = dramaData.dramas;

    // 根据类型筛选
    switch (filters.type) {
      case 'hot':
        result = result.filter(drama => drama.isHot);
        break;
      case 'new':
        result = result.filter(drama => drama.isNew);
        break;
      case 'category':
        if (filters.categoryId) {
          result = result.filter(drama => drama.category === filters.categoryId);
        }
        break;
      default:
        break;
    }

    // 搜索筛选
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(drama => 
        drama.title.toLowerCase().includes(query) ||
        drama.description.toLowerCase().includes(query) ||
        drama.tags.some(tag => tag.toLowerCase().includes(query)) ||
        drama.actors.some(actor => actor.toLowerCase().includes(query))
      );
    }

    return result;
  }, [dramaData, filters]);

  return filteredDramas;
};

export const useDramaById = (id: string) => {
  const { dramaData } = useDramas();

  const drama = useMemo(() => {
    return dramaData?.dramas.find(d => d.id === id) || null;
  }, [dramaData, id]);

  return drama;
};

export const useRecommendations = () => {
  const { dramaData } = useDramas();

  const recommendations = useMemo(() => {
    if (!dramaData) return { hot: [], new: [], trending: [] };

    const getRecommendedDramas = (ids: string[]) => 
      ids.map(id => dramaData.dramas.find(d => d.id === id)).filter(Boolean) as Drama[];

    return {
      hot: getRecommendedDramas(dramaData.recommendations.hot),
      new: getRecommendedDramas(dramaData.recommendations.new),
      trending: getRecommendedDramas(dramaData.recommendations.trending),
    };
  }, [dramaData]);

  return recommendations;
};
