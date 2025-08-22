'use client';

import { useState } from 'react';
import { useAuth, withAuth } from '@/contexts/AuthContext';
import UserManagement from '@/components/admin/UserManagement';

type ActiveView = 'dashboard' | 'users' | 'items' | 'activities' | 'stats';

function AdminPage() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return <UserManagement onClose={() => setActiveView('dashboard')} />;
      case 'items':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">物品管理</h2>
            <p className="text-gray-600">物品管理功能正在开发中...</p>
            <button
              onClick={() => setActiveView('dashboard')}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              返回
            </button>
          </div>
        );
      case 'activities':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">活动配置</h2>
            <p className="text-gray-600">活动配置功能正在开发中...</p>
            <button
              onClick={() => setActiveView('dashboard')}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              返回
            </button>
          </div>
        );
      case 'stats':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">系统统计</h2>
            <p className="text-gray-600">系统统计功能正在开发中...</p>
            <button
              onClick={() => setActiveView('dashboard')}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              返回
            </button>
          </div>
        );
      default:
        return (
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">管理员控制台</h2>
              <p className="text-gray-600 mb-6">管理系统用户和配置</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">用户管理</h3>
                  <p className="text-gray-600 text-sm mb-4">创建、编辑和删除用户</p>
                  <button 
                    onClick={() => setActiveView('users')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
                  >
                    管理用户
                  </button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">物品管理</h3>
                  <p className="text-gray-600 text-sm mb-4">配置系统物品和奖励</p>
                  <button 
                    onClick={() => setActiveView('items')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
                  >
                    管理物品
                  </button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">活动配置</h3>
                  <p className="text-gray-600 text-sm mb-4">设置活动参数和规则</p>
                  <button 
                    onClick={() => setActiveView('activities')}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
                  >
                    配置活动
                  </button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">系统统计</h3>
                  <p className="text-gray-600 text-sm mb-4">查看系统使用统计</p>
                  <button 
                    onClick={() => setActiveView('stats')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
                  >
                    查看统计
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl">🪷</span>
              <h1 className="ml-2 text-xl font-semibold text-gray-900">莲花岛 - 管理后台</h1>
              {activeView !== 'dashboard' && (
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  ← 返回首页
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">管理员: {user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default withAuth(AdminPage, { requireAdmin: true });