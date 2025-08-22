'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 如果已经认证，重定向到相应页面
  useEffect(() => {
    if (isAuthenticated && user) {
      // 使用 replace 而不是 push 来避免返回到登录页面
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleLoginSuccess = (token: string, userData: { id: string; username: string; role: string; createdAt: string; updatedAt: string }) => {
    // 使用 AuthContext 的 login 方法来更新状态
    login(token, {
      id: userData.id,
      username: userData.username,
      role: userData.role as 'admin' | 'user',
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    });
    // 不需要手动重定向，useEffect 会处理
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">🪷</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">莲花岛</h1>
            <p className="text-gray-600">好习惯培养系统</p>
          </div>

          {/* Login Form */}
          <LoginForm 
            onSuccess={handleLoginSuccess}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
      </div>
    </div>
  );
}