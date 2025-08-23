'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ItemSelector } from '@/components/backpack/ItemSelector';
import { UsageHistory } from '@/components/backpack/UsageHistory';
import { MobileLayout } from '@/components/ui/MobileLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function BackpackPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'items' | 'history'>('items');
  const [refreshKey, setRefreshKey] = useState(0);

  // 处理使用成功后的刷新
  const handleUseSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">请先登录</p>
        </div>
      </div>
    );
  }

  const headerActions = (
    <span className="text-sm text-gray-600 truncate max-w-20 sm:max-w-none">
      {user.username}
    </span>
  );

  const bottomNavigation = (
    <div className="grid grid-cols-2 sm:hidden">
      <button
        onClick={() => setActiveTab('items')}
        className={`flex flex-col items-center justify-center py-3 px-4 text-xs font-medium transition-colors ${
          activeTab === 'items'
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        物品管理
      </button>
      
      <button
        onClick={() => setActiveTab('history')}
        className={`flex flex-col items-center justify-center py-3 px-4 text-xs font-medium transition-colors ${
          activeTab === 'history'
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        使用历史
      </button>
    </div>
  );

  return (
    <MobileLayout
      title="我的背包"
      showBackButton
      backUrl="/dashboard"
      headerActions={headerActions}
      bottomNavigation={bottomNavigation}
    >
      {/* 标签页导航 - 桌面端 */}
      <div className="bg-white border-b border-gray-200 hidden sm:block">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('items')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'items'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>物品管理</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>使用历史</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="p-4 space-y-4">
        {activeTab === 'items' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">物品选择与使用</h2>
              <p className="text-sm text-gray-600">
                选择背包中的物品进行使用，每次只能选择一种物品。
              </p>
            </div>
            
            <ItemSelector 
              key={refreshKey} 
              onUseSuccess={handleUseSuccess} 
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <UsageHistory key={refreshKey} limit={20} />
          </div>
        )}
      </div>
    </MobileLayout>
  );
}