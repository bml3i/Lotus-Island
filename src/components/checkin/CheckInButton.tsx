'use client';

import { useState, useRef } from 'react';
import { CheckInResponse } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckIn } from '@/contexts/CheckInContext';

interface CheckInButtonProps {
  onSuccess?: (reward: { itemName: string; quantity: number }) => void;
  onError?: (error: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  showRipple?: boolean;
}

export function CheckInButton({ 
  onSuccess, 
  onError, 
  className = '',
  size = 'md',
  variant = 'primary',
  fullWidth = false,
  showRipple = true
}: CheckInButtonProps) {
  const { token } = useAuth();
  const { status: checkInStatus, loading, updateStatus } = useCheckIn();
  const [checking, setChecking] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  // 尺寸样式映射
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]'
  };

  // 变体样式映射
  const getVariantClasses = (canCheckIn: boolean, isChecking: boolean) => {
    if (!canCheckIn || isChecking) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300';
    }

    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl border-transparent';
      case 'secondary':
        return 'bg-white text-green-600 border-green-500 hover:bg-green-50 shadow-md hover:shadow-lg';
      case 'outline':
        return 'bg-transparent text-green-600 border-green-500 hover:bg-green-50 hover:border-green-600';
      default:
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl border-transparent';
    }
  };

  // 创建涟漪效果
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!showRipple || !buttonRef.current) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = {
      id: rippleIdRef.current++,
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // 移除涟漪效果
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };



  // 执行签到
  const handleCheckIn = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    // 如果用户今日已签到，显示提示信息
    if (checkInStatus?.hasCheckedInToday) {
      onError?.('您今日已经签到过了，请明天再来！');
      return;
    }

    if (!checkInStatus?.canCheckIn || checking) {
      return;
    }

    // 创建涟漪效果
    createRipple(event);

    setChecking(true);

    try {
      // 添加触觉反馈 (移动端)
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      if (!token) {
        onError?.('请先登录');
        return;
      }

      const response = await fetch('/api/activities/checkin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        const checkInData = result.data as CheckInResponse;
        
        // 更新签到状态
        if (checkInStatus) {
          updateStatus({
            ...checkInStatus,
            canCheckIn: false,
            hasCheckedInToday: true,
            lastCheckIn: checkInData.checkInTime
          });
        }

        // 成功触觉反馈
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }

        onSuccess?.(checkInData.reward);
      } else {
        // 错误触觉反馈
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
        onError?.(result.error || '签到失败');
      }
    } catch (err) {
      // 错误触觉反馈
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      onError?.(err instanceof Error ? err.message : '网络错误');
    } finally {
      setChecking(false);
    }
  };



  if (loading) {
    return (
      <button 
        disabled 
        className={`
          ${sizeClasses[size]} rounded-xl font-medium transition-all duration-300 border-2
          bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
      >
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          <span>加载中...</span>
        </div>
      </button>
    );
  }

  const canCheckIn = checkInStatus?.canCheckIn && !checking;

  return (
    <button
      ref={buttonRef}
      onClick={handleCheckIn}
      disabled={!canCheckIn}
      type="button"
      className={`
        ${sizeClasses[size]} rounded-xl font-medium transition-all duration-300 transform border-2 relative overflow-hidden
        ${getVariantClasses(checkInStatus?.canCheckIn || false, checking)}
        ${canCheckIn ? 'hover:scale-105 active:scale-95 focus:ring-4 focus:ring-green-200' : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      {/* 涟漪效果 */}
      {showRipple && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white bg-opacity-30 rounded-full animate-ping pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '600ms'
          }}
        />
      ))}



      {/* 按钮内容 */}
      <div className="relative z-10 flex items-center justify-center space-x-2">
        {checking ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            <span>签到中...</span>
          </>
        ) : canCheckIn ? (
          <>
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>立即签到</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>已签到</span>
          </>
        )}
      </div>

      {/* 移动端触摸指示器 - 暂时禁用 */}
      {/* {canCheckIn && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
      )} */}
    </button>
  );
}