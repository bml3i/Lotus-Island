'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { CheckInStatus } from '@/types';
import { useAuth } from './AuthContext';

interface CheckInContextType {
  status: CheckInStatus | null;
  loading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
  updateStatus: (newStatus: CheckInStatus) => void;
}

const CheckInContext = createContext<CheckInContextType | undefined>(undefined);

interface CheckInProviderProps {
  children: ReactNode;
}

export function CheckInProvider({ children }: CheckInProviderProps) {
  const { token, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<CheckInStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // 防抖：避免频繁调用API
  const FETCH_COOLDOWN = 5000; // 5秒内不重复调用

  const fetchStatus = useCallback(async (force = false) => {
    const now = Date.now();
    
    // 如果不是强制刷新且在冷却时间内，跳过请求
    if (!force && now - lastFetchTime < FETCH_COOLDOWN) {
      return;
    }

    if (!isAuthenticated || !token) {
      setError('请先登录');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLastFetchTime(now);

      const response = await fetch('/api/activities/checkin/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('获取签到状态失败');
      }

      const result = await response.json();
      
      if (result.success) {
        setStatus(result.data);
      } else {
        setError(result.error || '获取签到状态失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated, lastFetchTime]);

  const refreshStatus = useCallback(async () => {
    await fetchStatus(true); // 强制刷新
  }, [fetchStatus]);

  const updateStatus = useCallback((newStatus: CheckInStatus) => {
    setStatus(newStatus);
  }, []);

  // 初始化时获取状态
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchStatus(true);
    }
  }, [isAuthenticated, token, fetchStatus]); // 添加fetchStatus依赖

  const value: CheckInContextType = {
    status,
    loading,
    error,
    refreshStatus,
    updateStatus,
  };

  return (
    <CheckInContext.Provider value={value}>
      {children}
    </CheckInContext.Provider>
  );
}

export function useCheckIn(): CheckInContextType {
  const context = useContext(CheckInContext);
  if (context === undefined) {
    throw new Error('useCheckIn must be used within a CheckInProvider');
  }
  return context;
}