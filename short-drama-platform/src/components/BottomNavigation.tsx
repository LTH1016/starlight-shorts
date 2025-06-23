import React from 'react';
import { Home, Search, Heart, User, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type NavigationTab = 'home' | 'discover' | 'favorite' | 'profile';

interface BottomNavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  className?: string;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: '首页',
    icon: <Home className="w-5 h-5" />,
    activeIcon: <Home className="w-5 h-5" fill="currentColor" />,
  },
  {
    id: 'discover',
    label: '发现',
    icon: <Grid3X3 className="w-5 h-5" />,
    activeIcon: <Grid3X3 className="w-5 h-5" fill="currentColor" />,
  },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <nav className={`
      fixed bottom-0 left-0 right-0 z-50 
      bg-card/80 backdrop-blur-md border-t border-border
      px-4 py-2 safe-area-pb
      ${className}
    `}>
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange(item.id)}
              className={`
                flex flex-col items-center gap-1 p-2 h-auto min-w-0 flex-1
                transition-all duration-200
                ${isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <div className={`
                transition-transform duration-200
                ${isActive ? 'scale-110' : 'scale-100'}
              `}>
                {isActive ? item.activeIcon : item.icon}
              </div>
              <span className={`
                text-xs font-medium
                ${isActive ? 'text-primary' : 'text-muted-foreground'}
              `}>
                {item.label}
              </span>
              
              {/* 活跃指示器 */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </Button>
          );
        })}
      </div>
    </nav>
  );
};
