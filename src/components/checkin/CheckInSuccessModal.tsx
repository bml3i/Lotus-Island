'use client';

import { useEffect, useState } from 'react';
import { CheckInReward } from '@/types';

interface CheckInSuccessModalProps {
  isVisible: boolean;
  reward: CheckInReward | null;
  onClose: () => void;
  autoCloseDelay?: number;
}

export function CheckInSuccessModal({ 
  isVisible, 
  reward, 
  onClose, 
  autoCloseDelay = 3000 
}: CheckInSuccessModalProps) {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    if (isVisible && reward) {
      setAnimationPhase('enter');
      
      // 进入动画完成后显示内容
      const showTimer = setTimeout(() => {
        setAnimationPhase('show');
      }, 100);

      // 自动关闭
      const closeTimer = setTimeout(() => {
        setAnimationPhase('exit');
        setTimeout(onClose, 300);
      }, autoCloseDelay);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [isVisible, reward, onClose, autoCloseDelay]);

  if (!isVisible || !reward) {
    return null;
  }

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        transition-all duration-300 ease-out
        ${animationPhase === 'enter' ? 'bg-black bg-opacity-0' : 'bg-black bg-opacity-50'}
        ${animationPhase === 'exit' ? 'bg-black bg-opacity-0' : ''}
      `}
      onClick={onClose}
    >
      <div 
        className={`
          bg-white rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl
          transition-all duration-500 ease-out transform
          ${animationPhase === 'enter' ? 'scale-50 opacity-0 rotate-12' : ''}
          ${animationPhase === 'show' ? 'scale-100 opacity-100 rotate-0' : ''}
          ${animationPhase === 'exit' ? 'scale-75 opacity-0 -rotate-6' : ''}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 成功图标 */}
        <div className="relative mb-6">
          <div className={`
            w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full 
            flex items-center justify-center shadow-lg transition-all duration-700 ease-out
            ${animationPhase === 'show' ? 'animate-bounce' : ''}
          `}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {/* 光环效果 */}
          <div className={`
            absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-green-300
            transition-all duration-1000 ease-out
            ${animationPhase === 'show' ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}
          `}></div>
          
          {/* 粒子效果 */}
          {animationPhase === 'show' && (
            <>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`
                    absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping
                    ${i === 0 ? 'top-0 left-1/2 transform -translate-x-1/2' : ''}
                    ${i === 1 ? 'top-1/2 right-0 transform -translate-y-1/2' : ''}
                    ${i === 2 ? 'bottom-0 left-1/2 transform -translate-x-1/2' : ''}
                    ${i === 3 ? 'top-1/2 left-0 transform -translate-y-1/2' : ''}
                    ${i === 4 ? 'top-2 right-2' : ''}
                    ${i === 5 ? 'bottom-2 left-2' : ''}
                  `}
                  style={{
                    animationDelay: `${i * 100}ms`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </>
          )}
        </div>
        
        {/* 成功文本 */}
        <h3 className={`
          text-2xl font-bold text-gray-900 mb-3 transition-all duration-500 ease-out
          ${animationPhase === 'show' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          签到成功！
        </h3>
        
        {/* 奖励信息 */}
        <p className={`
          text-gray-600 mb-6 transition-all duration-500 ease-out delay-100
          ${animationPhase === 'show' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          恭喜您获得奖励
        </p>
        
        {/* 奖励展示 */}
        <div className={`
          flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 
          rounded-xl border border-green-200 mb-6 transition-all duration-500 ease-out delay-200
          ${animationPhase === 'show' ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}
        `}>
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-green-700">
            +{reward.quantity} {reward.itemName}
          </span>
        </div>

        {/* 关闭提示 */}
        <p className={`
          text-xs text-gray-400 transition-all duration-500 ease-out delay-300
          ${animationPhase === 'show' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          点击任意位置关闭
        </p>

        {/* 进度条 */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
          <div 
            className={`
              h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full
              transition-all duration-300 ease-linear
              ${animationPhase === 'show' ? 'w-0' : 'w-full'}
            `}
            style={{
              animation: animationPhase === 'show' ? `shrink ${autoCloseDelay}ms linear` : 'none'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}