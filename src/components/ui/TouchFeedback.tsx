'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { touchUtils } from '@/lib/mobile-utils';

interface TouchFeedbackProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  hapticFeedback?: boolean;
  rippleEffect?: boolean;
  pressScale?: number;
  longPressDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function TouchFeedback({
  children,
  onPress,
  onLongPress,
  disabled = false,
  hapticFeedback = true,
  rippleEffect = true,
  pressScale = 0.95,
  longPressDelay = 500,
  className = '',
  style = {}
}: TouchFeedbackProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const elementRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const rippleIdRef = useRef(0);

  // Create ripple effect
  const createRipple = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (!rippleEffect || !elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const newRipple: Ripple = {
      id: rippleIdRef.current++,
      x: x - size / 2,
      y: y - size / 2,
      size
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  }, [rippleEffect]);

  // Handle press start
  const handlePressStart = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (disabled) return;

    setIsPressed(true);
    createRipple(event);

    // Haptic feedback
    if (hapticFeedback && touchUtils.isTouch()) {
      touchUtils.vibrate(10);
    }

    // Long press timer
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        if (hapticFeedback && touchUtils.isTouch()) {
          touchUtils.vibrate([50, 25, 50]);
        }
        onLongPress();
        setIsPressed(false);
      }, longPressDelay);
    }
  }, [disabled, createRipple, hapticFeedback, onLongPress, longPressDelay]);

  // Handle press end
  const handlePressEnd = useCallback(() => {
    if (disabled) return;

    setIsPressed(false);

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = undefined;
    }

    // Trigger press callback
    if (onPress) {
      onPress();
    }
  }, [disabled, onPress]);

  // Handle press cancel
  const handlePressCancel = useCallback(() => {
    setIsPressed(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = undefined;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const combinedStyle: React.CSSProperties = {
    ...style,
    transform: isPressed ? `scale(${pressScale})` : 'scale(1)',
    transition: 'transform 0.1s ease-out',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    cursor: disabled ? 'default' : 'pointer'
  };

  return (
    <div
      ref={elementRef}
      className={`relative overflow-hidden ${className}`}
      style={combinedStyle}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressCancel}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressCancel}
    >
      {children}
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute bg-white bg-opacity-30 rounded-full pointer-events-none animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            animationDuration: '600ms'
          }}
        />
      ))}
    </div>
  );
}

// Enhanced button with touch feedback
interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
}

export function TouchButton({
  children,
  onClick,
  onLongPress,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = ''
}: TouchButtonProps) {
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs min-h-[28px]',
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[52px]',
    xl: 'px-8 py-4 text-xl min-h-[60px]'
  };

  const variantClasses = {
    primary: 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600',
    secondary: 'bg-gray-500 text-white border-gray-500 hover:bg-gray-600',
    outline: 'bg-transparent text-blue-500 border-blue-500 hover:bg-blue-50',
    ghost: 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100'
  };

  const isDisabled = disabled || loading;

  return (
    <TouchFeedback
      onPress={onClick}
      onLongPress={onLongPress}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg border-2 transition-colors
        ${sizeClasses[size]}
        ${isDisabled 
          ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' 
          : variantClasses[variant]
        }
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>加载中...</span>
        </div>
      ) : (
        children
      )}
    </TouchFeedback>
  );
}