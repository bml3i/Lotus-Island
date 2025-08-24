'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
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
  const lastFetchTimeRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(true);

  // 防抖：避免频繁调用API
  const FETCH_COOLDOWN = 10000; // 10秒防抖

  // 核心API调用函数
  const performFetch = useCallback(async (force = false) => {
    if (!mountedRef.current || !isAuthenticated || !token) {
      return;
    }

    const now = Date.now();

    // 防抖检查
    if (!force && now - lastFetchTimeRef.current < FETCH_COOLDOWN) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      lastFetchTimeRef.current = now;

      const response = await fetch('/api/activities/checkin/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('获取签到状态失败');
      }

      const result = await response.json();

      if (mountedRef.current) {
        if (result.success) {
          setStatus(result.data);
        } else {
          setError(result.error || '获取签到状态失败');
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : '网络错误');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [token, isAuthenticated]);

  const refreshStatus = useCallback(async () => {
    await performFetch(true);
  }, [performFetch]);

  const updateStatus = useCallback((newStatus: CheckInStatus) => {
    if (mountedRef.current) {
      setStatus(newStatus);
    }
  }, []);

  // 初始化
  useEffect(() => {
    mountedRef.current = true;

    if (isAuthenticated && token) {
      performFetch(true);
    } else {
      setLoading(false);
      setError(isAuthenticated ? null : '请先登录');
    }

    return () => {
      mountedRef.current = false;
    };
  }, [isAuthenticated, token]); // 只依赖认证状态

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