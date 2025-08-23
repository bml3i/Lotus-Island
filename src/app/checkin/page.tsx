'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckInProvider } from '@/contexts/CheckInContext';
import { CheckInStatus as CheckInStatusType, CheckInReward } from '@/types';
import { CheckInStatus } from '@/components/checkin/CheckInStatus';
import { CheckInButton } from '@/components/checkin/CheckInButton';
import { CheckInSuccessModal } from '@/components/checkin/CheckInSuccessModal';

export default function CheckInPage() {
  const { user } = useAuth();
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatusType | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastReward, setLastReward] = useState<CheckInReward | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 处理签到成功
  const handleCheckInSuccess = (reward: CheckInReward) => {
    setLastReward(reward);
    setShowSuccess(true);
    setError(null);
    // 不需要手动刷新状态，CheckInButton会自动更新状态
  };

  // 处理签到错误
  const handleCheckInError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // 处理状态变化
  const handleStatusChange = (status: CheckInStatusType) => {
    setCheckInStatus(status);
  };

  // 关闭成功模态框
  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setLastReward(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">请先登录</p>
        </div>
      </div>
    );
  }

  return (
    <CheckInProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 页面头部 - 移动端优化 */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">每日签到</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs sm:text-sm text-gray-600 truncate max-w-24 sm:max-w-none">
                {user.username}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 - 移动端优化 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* 签到状态卡片 */}
        <CheckInStatus 
          onStatusChange={handleStatusChange}
          className="mb-6"
          showLastCheckIn={true}
        />

        {/* 主签到卡片 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 text-center">
            {/* 主要签到区域 */}
            <div className="mb-8">
              {/* 大图标 */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 relative">
                <div className={`
                  w-full h-full rounded-full flex items-center justify-center shadow-2xl transition-all duration-500
                  ${checkInStatus?.canCheckIn 
                    ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 animate-pulse' 
                    : 'bg-gradient-to-br from-gray-300 via-gray-400 to-slate-500'
                  }
                `}>
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {checkInStatus?.canCheckIn ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </div>
                
                {/* 光环效果 */}
                {checkInStatus?.canCheckIn && (
                  <div className="absolute inset-0 w-full h-full rounded-full border-4 border-green-300 animate-ping opacity-75"></div>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                {checkInStatus?.canCheckIn ? '今日签到' : '今日已签到'}
              </h2>
              
              <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
                {checkInStatus?.canCheckIn 
                  ? '点击下方按钮完成今日签到，获得奖励！' 
                  : '您今天已经完成签到，明天再来吧！'
                }
              </p>
            </div>

            {/* 签到按钮 */}
            <div className="mb-8">
              <CheckInButton
                onSuccess={handleCheckInSuccess}
                onError={handleCheckInError}
                size="lg"
                fullWidth={true}
                className="shadow-xl"
              />
            </div>



            {/* 奖励信息卡片 */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-100 shadow-inner">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">签到奖励</h3>
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-sm sm:text-lg font-medium">每日可获得 5 个莲子</span>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-inner">
                <div className="flex items-center justify-center space-x-2 text-red-600">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 成功动画模态框 */}
      <CheckInSuccessModal
        isVisible={showSuccess}
        reward={lastReward}
        onClose={handleCloseSuccess}
        autoCloseDelay={3000}
      />

        {/* 移动端底部安全区域 */}
        <div className="h-8 sm:h-4"></div>
      </div>
    </CheckInProvider>
  );
}