import React, { useState } from 'react';
import { Drama } from '@/types/drama';
import { AuthProvider } from '@/contexts/AuthContext';
import { TopNavigation } from '@/components/TopNavigation';
import DramaDetailPage from '@/pages/DramaDetailPage';
import { HomePage } from '@/pages/HomePage';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { FavoritePage } from '@/pages/FavoritePage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { RankingPage } from '@/pages/RankingPage';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import './App.css';

type AppPage = 'main' | 'login' | 'register' | 'category' | 'ranking';
type NavigationTab = 'home' | 'discover' | 'favorite' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('main');
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [selectedDrama, setSelectedDrama] = useState<Drama | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleDramaClick = (drama: Drama) => {
    setSelectedDrama(drama);
  };

  const handleBackFromDetail = () => {
    setSelectedDrama(null);
  };

  const handlePlay = (drama: Drama) => {
    // 这里可以实现实际的播放逻辑
    console.log('播放短剧:', drama.title);
    
    // 模拟添加到观看历史
    const watchHistory = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const newHistoryItem = {
      dramaId: drama.id,
      watchedAt: new Date().toISOString(),
      progress: Math.floor(Math.random() * 100),
      currentEpisode: Math.floor(Math.random() * drama.episodes) + 1
    };
    
    // 移除旧的同剧集记录，添加新记录
    const updatedHistory = [
      newHistoryItem,
      ...watchHistory.filter((item: any) => item.dramaId !== drama.id)
    ].slice(0, 50); // 最多保存50条记录
    
    localStorage.setItem('watchHistory', JSON.stringify(updatedHistory));
  };

  const handleTabChange = (tab: NavigationTab) => {
    setActiveTab(tab);
    setSelectedDrama(null); // 切换tab时关闭详情页
  };

  const renderCurrentPage = () => {
    // 非主页面
    if (currentPage === 'login') {
      return (
        <LoginPage
          onBack={() => setCurrentPage('main')}
          onSwitchToRegister={() => setCurrentPage('register')}
          onLoginSuccess={() => setCurrentPage('main')}
        />
      );
    }

    if (currentPage === 'register') {
      return (
        <RegisterPage
          onBack={() => setCurrentPage('main')}
          onSwitchToLogin={() => setCurrentPage('login')}
          onRegisterSuccess={() => setCurrentPage('main')}
        />
      );
    }

    if (currentPage === 'category') {
      return (
        <CategoryPage
          selectedCategory={selectedCategory}
          onDramaClick={handleDramaClick}
          onBack={() => setCurrentPage('main')}
        />
      );
    }

    if (currentPage === 'ranking') {
      return (
        <RankingPage
          onDramaClick={handleDramaClick}
          onBack={() => setCurrentPage('main')}
        />
      );
    }

    // 短剧详情页
    if (selectedDrama) {
      return (
        <div className="relative">
          <Button
            onClick={handleBackFromDetail}
            variant="ghost"
            className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
          >
            ← 返回
          </Button>
          <DramaDetailPage />
        </div>
      );
    }

    // 主应用页面
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onDramaClick={handleDramaClick}
            onCategoryChange={setSelectedCategory}
            onSearch={setSearchQuery}
            onCategoryClick={() => setCurrentPage('category')}
            onRankingClick={() => setCurrentPage('ranking')}
          />
        );
      case 'discover':
        return (
          <DiscoverPage
            onDramaClick={handleDramaClick}
          />
        );
      case 'favorite':
        return (
          <FavoritePage
            onDramaClick={handleDramaClick}
          />
        );
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage onDramaClick={handleDramaClick} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* 顶部导航栏 */}
        {currentPage === 'main' && !selectedDrama && (
          <TopNavigation
            onLoginClick={() => setCurrentPage('login')}
            onCategoryClick={() => setCurrentPage('category')}
            onRankingClick={() => setCurrentPage('ranking')}
            onFavoriteClick={() => setActiveTab('favorite')}
            onProfileClick={() => setActiveTab('profile')}
            onSearch={setSearchQuery}
          />
        )}

        {/* 主内容区域 */}
        <main>
          {renderCurrentPage()}
        </main>

        {/* 全局通知组件 */}
        <Toaster position="top-center" />
      </div>
    </AuthProvider>
  );
}

export default App;
