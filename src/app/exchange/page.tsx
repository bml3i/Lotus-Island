'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ExchangeRules } from '@/components/exchange/ExchangeRules';

export default function ExchangePage() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // 处理兑换成功后的刷新
  const handleExchangeSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">请先登录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="返回首页"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">返回</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">物品兑换</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                欢迎，{user.username}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">兑换规则</h2>
              <p className="text-sm text-gray-600">
                使用你的物品兑换其他有用的奖励，选择合适的兑换规则进行兑换。
              </p>
            </div>
            
            <ExchangeRules 
              key={refreshKey} 
              onExchangeSuccess={handleExchangeSuccess} 
            />
          </div>
        </div>
      </div>

      {/* 移动端底部间距 */}
      <div className="h-16 sm:hidden"></div>
    </div>
  );
}