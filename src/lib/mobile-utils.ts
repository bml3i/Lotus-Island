/**
 * Mobile optimization utilities
 */

// Touch and gesture utilities
export const touchUtils = {
  // Add haptic feedback for mobile devices
  vibrate: (pattern: number | number[] = 50) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  },

  // Prevent zoom on double tap for specific elements
  preventZoom: (element: HTMLElement) => {
    element.style.touchAction = 'manipulation';
    (element.style as CSSStyleDeclaration & { webkitTouchCallout?: string; webkitUserSelect?: string }).webkitTouchCallout = 'none';
    (element.style as CSSStyleDeclaration & { webkitTouchCallout?: string; webkitUserSelect?: string }).webkitUserSelect = 'none';
  },

  // Check if device is mobile
  isMobile: () => {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Check if device supports touch
  isTouch: () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Get safe area insets for devices with notches
  getSafeAreaInsets: () => {
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
    };
  }
};

// Performance utilities
export const performanceUtils = {
  // Debounce function for touch events
  debounce: <T extends (...args: unknown[]) => unknown>(func: T, wait: number): T => {
    let timeout: NodeJS.Timeout;
    return ((...args: unknown[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T;
  },

  // Throttle function for scroll events
  throttle: <T extends (...args: unknown[]) => unknown>(func: T, limit: number): T => {
    let inThrottle: boolean;
    return ((...args: unknown[]) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  },

  // Lazy load images
  lazyLoadImage: (img: HTMLImageElement, src: string) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = src;
          img.classList.remove('opacity-0');
          img.classList.add('opacity-100');
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  },

  // Preload critical resources
  preloadResource: (href: string, as: string = 'fetch') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
};

// Responsive utilities
export const responsiveUtils = {
  // Get current breakpoint
  getCurrentBreakpoint: () => {
    if (typeof window === 'undefined') return 'md';
    const width = window.innerWidth;
    if (width < 640) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    return 'xl';
  },

  // Check if current viewport is mobile
  isMobileViewport: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  },

  // Get optimal grid columns based on screen size
  getOptimalColumns: (itemWidth: number = 150, gap: number = 16) => {
    if (typeof window === 'undefined') return 2;
    const containerWidth = window.innerWidth - 32; // Account for padding
    return Math.floor((containerWidth + gap) / (itemWidth + gap));
  }
};

// Network utilities for mobile optimization
export const networkUtils = {
  // Check connection type
  getConnectionType: () => {
    if (typeof navigator === 'undefined') return 'unknown';
    const connection = (navigator as { connection?: { effectiveType?: string } }).connection;
    return connection?.effectiveType || 'unknown';
  },

  // Check if on slow connection
  isSlowConnection: () => {
    if (typeof navigator === 'undefined') return false;
    const connection = (navigator as { connection?: { effectiveType?: string } }).connection;
    return connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
  },

  // Retry with exponential backoff
  retryWithBackoff: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i === maxRetries) break;
        
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
};

// Animation utilities optimized for mobile
export const animationUtils = {
  // Create smooth transitions with reduced motion support
  createTransition: (property: string, duration: number = 300, easing: string = 'ease-out') => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return prefersReducedMotion 
      ? 'none' 
      : `${property} ${duration}ms ${easing}`;
  },

  // Animate element with requestAnimationFrame
  animate: (
    element: HTMLElement,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions = { duration: 300, easing: 'ease-out' }
  ) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Apply final state immediately
      const finalFrame = keyframes[keyframes.length - 1];
      Object.assign(element.style, finalFrame);
      return Promise.resolve();
    }
    
    return element.animate(keyframes, options).finished;
  }
};