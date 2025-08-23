'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { touchUtils, responsiveUtils } from '@/lib/mobile-utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
  headerActions?: React.ReactNode;
  bottomNavigation?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function MobileLayout({
  children,
  title,
  showBackButton = false,
  backUrl,
  headerActions,
  bottomNavigation,
  className = '',
  headerClassName = '',
  contentClassName = ''
}: MobileLayoutProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [safeAreaInsets, setSafeAreaInsets] = useState({ top: 0, bottom: 0 });
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setIsScrolled(contentRef.current.scrollTop > 0);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Get safe area insets for devices with notches
  useEffect(() => {
    const updateSafeAreaInsets = () => {
      const insets = touchUtils.getSafeAreaInsets();
      setSafeAreaInsets(insets);
    };

    updateSafeAreaInsets();
    window.addEventListener('resize', updateSafeAreaInsets);
    return () => window.removeEventListener('resize', updateSafeAreaInsets);
  }, []);

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <div 
      className={`flex flex-col h-screen bg-gray-50 ${className}`}
      style={{ 
        paddingTop: safeAreaInsets.top,
        paddingBottom: bottomNavigation ? safeAreaInsets.bottom : 0
      }}
    >
      {/* Header */}
      <header 
        className={`
          bg-white border-b border-gray-200 transition-shadow duration-200 z-40 sticky top-0
          ${isScrolled ? 'shadow-md' : 'shadow-sm'}
          ${headerClassName}
        `}
      >
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left side - Back button and title */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="返回"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {title && (
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
            )}
          </div>

          {/* Right side - Actions */}
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main 
        ref={contentRef}
        className={`
          flex-1 overflow-y-auto overscroll-behavior-y-contain
          ${contentClassName}
        `}
        style={{
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {children}
      </main>

      {/* Bottom navigation */}
      {bottomNavigation && (
        <nav className="bg-white border-t border-gray-200 z-40">
          {bottomNavigation}
        </nav>
      )}
    </div>
  );
}

// Mobile-optimized grid component
interface MobileGridProps {
  children: React.ReactNode;
  minItemWidth?: number;
  gap?: number;
  className?: string;
}

export function MobileGrid({ 
  children, 
  minItemWidth = 150, 
  gap = 16, 
  className = '' 
}: MobileGridProps) {
  const [columns, setColumns] = useState(2);

  useEffect(() => {
    const updateColumns = () => {
      const optimalColumns = responsiveUtils.getOptimalColumns(minItemWidth, gap);
      setColumns(Math.max(1, Math.min(optimalColumns, 4))); // Limit between 1-4 columns
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [minItemWidth, gap]);

  return (
    <div 
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {children}
    </div>
  );
}

// Mobile-optimized card component
interface MobileCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export function MobileCard({
  children,
  onClick,
  className = '',
  padding = 'md',
  shadow = 'sm',
  interactive = false
}: MobileCardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const baseClasses = `
    bg-white rounded-lg border border-gray-200
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${interactive ? 'transition-all duration-200 active:scale-95' : ''}
    ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
    ${className}
  `;

  if (onClick) {
    return (
      <div
        className={baseClasses}
        onClick={onClick}
        style={{
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
}

// Pull-to-refresh component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshThreshold?: number;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  refreshThreshold = 80,
  className = ''
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRefreshing || !containerRef.current || containerRef.current.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, refreshThreshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= refreshThreshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  };

  const refreshProgress = Math.min(pullDistance / refreshThreshold, 1);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-y-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        WebkitOverflowScrolling: 'touch',
        transform: `translateY(${pullDistance * 0.5}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      {/* Pull indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-blue-50 z-10"
          style={{
            transform: `translateY(-100%) translateY(${pullDistance * 0.5}px)`,
            opacity: refreshProgress
          }}
        >
          <div className="flex items-center space-x-2 text-blue-600">
            <div 
              className={`w-5 h-5 border-2 border-blue-600 rounded-full ${
                isRefreshing ? 'animate-spin border-t-transparent' : ''
              }`}
              style={{
                transform: `rotate(${refreshProgress * 360}deg)`
              }}
            />
            <span className="text-sm font-medium">
              {isRefreshing ? '刷新中...' : pullDistance >= refreshThreshold ? '释放刷新' : '下拉刷新'}
            </span>
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
}