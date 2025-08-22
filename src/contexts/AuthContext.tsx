'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // 登录函数
  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('user_info', JSON.stringify(newUser));
  }, []);

  // 登出函数
  const logout = useCallback(async () => {
    try {
      // 调用登出API
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // 清除本地状态和存储
      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
    }
  }, [token]);

  // 刷新令牌
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!token) return false;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        login(result.data.token, result.data.user);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  }, [token, logout, login]);

  // 验证当前用户
  const verifyCurrentUser = async (storedToken: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setToken(storedToken);
        setUser(result.data.user);
        return true;
      } else {
        // 令牌无效，清除本地存储
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        return false;
      }
    } catch (error) {
      console.error('User verification error:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      return false;
    }
  };

  // 初始化认证状态
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user_info');

        if (storedToken && storedUser) {
          // 验证存储的令牌是否仍然有效
          const isValid = await verifyCurrentUser(storedToken);
          
          if (!isValid) {
            // 如果令牌无效，尝试使用存储的用户信息
            try {
              const parsedUser = JSON.parse(storedUser);
              // 这里可以添加额外的用户信息验证逻辑
              console.log('Stored user info found but token invalid:', parsedUser.username);
            } catch (error) {
              console.error('Error parsing stored user info:', error);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 自动刷新令牌（可选）
  useEffect(() => {
    if (!isAuthenticated) return;

    // 设置定期刷新令牌（例如每30分钟）
    const refreshInterval = setInterval(() => {
      refreshToken();
    }, 30 * 60 * 1000); // 30分钟

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, token, refreshToken]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义Hook用于使用认证上下文
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 高阶组件用于保护需要认证的页面
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: { requireAdmin?: boolean } = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // 重定向到登录页面
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    if (options.requireAdmin && user?.role !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">权限不足</h1>
            <p className="text-gray-600">您没有访问此页面的权限</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}