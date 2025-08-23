import { useState, useEffect } from 'react';
import { Activity } from '@/types';

export interface UseActivitiesOptions {
  type?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useActivities(options: UseActivitiesOptions = {}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { type, autoRefresh = false, refreshInterval = 30000 } = options;

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = type 
        ? `/api/activities?type=${encodeURIComponent(type)}`
        : '/api/activities';
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '获取活动列表失败');
      }

      setActivities(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  const refreshActivities = () => {
    fetchActivities();
  };

  useEffect(() => {
    fetchActivities();
  }, [type]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchActivities, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  return {
    activities,
    loading,
    error,
    refresh: refreshActivities
  };
}

export function useActivity(id: string) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/activities/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '获取活动详情失败');
      }

      setActivity(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取活动详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [id]);

  return {
    activity,
    loading,
    error,
    refresh: fetchActivity
  };
}