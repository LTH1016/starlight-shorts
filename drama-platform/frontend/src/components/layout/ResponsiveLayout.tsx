import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
  maxWidth = 'xl',
  padding = 'md'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 sm:px-4',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12'
  };

  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { default: 1, sm: 2, md: 3, lg: 4, xl: 6 },
  gap = 'md'
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const getColsClass = () => {
    const classes = ['grid'];
    
    if (cols.default) classes.push(`grid-cols-${cols.default}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div className={cn(
      getColsClass(),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal' | 'responsive';
  gap?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  className,
  direction = 'vertical',
  gap = 'md',
  align = 'stretch',
  justify = 'start'
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  };

  const directionClasses = {
    vertical: 'flex flex-col',
    horizontal: 'flex flex-row',
    responsive: 'flex flex-col sm:flex-row'
  };

  return (
    <div className={cn(
      directionClasses[direction],
      gapClasses[gap],
      alignClasses[align],
      justifyClasses[justify],
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveShowProps {
  children: React.ReactNode;
  on?: ('mobile' | 'tablet' | 'desktop')[];
  className?: string;
}

export const ResponsiveShow: React.FC<ResponsiveShowProps> = ({
  children,
  on = ['mobile', 'tablet', 'desktop'],
  className
}) => {
  const getVisibilityClasses = () => {
    const classes = [];
    
    // 默认隐藏
    classes.push('hidden');
    
    // 根据配置显示
    if (on.includes('mobile')) {
      classes.push('block');
      if (on.includes('tablet')) {
        classes.push('sm:block');
      } else {
        classes.push('sm:hidden');
      }
    } else {
      classes.push('sm:block');
    }
    
    if (on.includes('tablet')) {
      classes.push('md:block');
      if (!on.includes('desktop')) {
        classes.push('lg:hidden');
      }
    } else if (on.includes('desktop')) {
      classes.push('md:hidden lg:block');
    }
    
    if (on.includes('desktop')) {
      classes.push('lg:block');
    } else {
      classes.push('lg:hidden');
    }
    
    return classes.join(' ');
  };

  return (
    <div className={cn(getVisibilityClasses(), className)}>
      {children}
    </div>
  );
};

interface ResponsiveHideProps {
  children: React.ReactNode;
  on?: ('mobile' | 'tablet' | 'desktop')[];
  className?: string;
}

export const ResponsiveHide: React.FC<ResponsiveHideProps> = ({
  children,
  on = [],
  className
}) => {
  const getVisibilityClasses = () => {
    const classes = ['block']; // 默认显示
    
    if (on.includes('mobile')) {
      classes.push('hidden sm:block');
    }
    
    if (on.includes('tablet')) {
      classes.push('md:hidden lg:block');
    }
    
    if (on.includes('desktop')) {
      classes.push('lg:hidden');
    }
    
    return classes.join(' ');
  };

  return (
    <div className={cn(getVisibilityClasses(), className)}>
      {children}
    </div>
  );
};
