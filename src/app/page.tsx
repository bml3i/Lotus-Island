'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // 根据用户角色重定向
        if (user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        // 未认证用户重定向到登录页
        window.location.href = '/login';
      }
    }
  }, [isAuthenticated, isLoading, user]);

  // 显示加载状态
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">🪷</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">莲花岛</h1>
        <p className="text-gray-600 mb-6">好习惯培养系统</p>
        
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        ) : (
          <p className="text-gray-600">正在重定向...</p>
        )}
      </div>
    </div>
  );
}
