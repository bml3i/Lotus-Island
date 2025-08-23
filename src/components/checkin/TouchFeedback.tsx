'use client';

import { ReactNode, useRef, useState, useCallback } from 'react';

interface TouchFeedbackProps {
  children: ReactNode;
  className?: string;
  onTap?: () => void;
  disabled?: boolean;
  hapticFeedback?: boolean;
  scaleOnPress?: boolean;
  rippleEffect?: boolean;
}

export function TouchFeedback({
  children,
  className = '',
  onTap,
  disabled = false,
  hapticFeedback = true,
  scaleOnPress = true,
  rippleEffect = true
}: TouchFeedbackProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);

  const createRipple = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (!rippleEffect || !containerRef.current || disabled) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    let x: number, y: number;
    
    if ('touches' in event) {
      // Touch event
      const touch = event.touches[0] || event.changedTouches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else {
      // Mouse event
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    const newRipple = {
      id: rippleIdRef.current++,
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  }, [rippleEffect, disabled]);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (disabled) return;
    
    setIsPressed(true);
    createRipple(event);
    
    // Haptic feedback
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [disabled, createRipple, hapticFeedback]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(false);
    
    if (onTap) {
      // Slight delay to show the press effect
      setTimeout(() => {
        onTap();
      }, 50);
    }
  }, [disabled, onTap]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    
    setIsPressed(true);
    createRipple(event);
  }, [disabled, createRipple]);

  const handleMouseUp = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(false);
    
    if (onTap) {
      onTap();
    }
  }, [disabled, onTap]);

  const handleMouseLeave = useCallback(() => {
    setIsPressed(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`
        relative overflow-hidden transition-all duration-150 ease-out
        ${scaleOnPress && isPressed ? 'scale-95' : 'scale-100'}
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${className}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      {children}
      
      {/* Ripple effects */}
      {rippleEffect && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white bg-opacity-30 rounded-full animate-ping pointer-events-none"
          style={{
            left: ripple.x - 15,
            top: ripple.y - 15,
            width: 30,
            height: 30,
            animationDuration: '600ms'
          }}
        />
      ))}
      
      {/* Press overlay */}
      {isPressed && (
        <div className="absolute inset-0 bg-black bg-opacity-10 pointer-events-none" />
      )}
    </div>
  );
}