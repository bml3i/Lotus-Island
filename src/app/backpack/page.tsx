'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ItemSelector } from '@/components/backpack/ItemSelector';
import { UsageHistory } from '@/components/backpack/UsageHistory';

export default function BackpackPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'items' | 'history'>('items');
  const [refreshKey, setRefreshKey] = useState(0);

  // 处理使用成功后的刷新
  const handleUseSuccess = () => {
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
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">我的背包</h1>
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

      {/* 标签页导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
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
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <UsageHistory key={refreshKey} limit={20} />
            </div>
          </div>
        )}
      </div>

      {/* 底部导航（移动端） */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden">
        <div className="grid grid-cols-2">
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
      </div>

      {/* 移动端底部间距 */}
      <div className="h-16 sm:hidden"></div>
    </div>
  );
}