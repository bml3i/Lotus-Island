import { useState, useEffect } from 'react';
import { Activity } from '@/types';

interface UseActivitiesDataReturn {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useActivitiesData(): UseActivitiesDataReturn {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/activities');
      const data = await response.json();
      
      if (data.success) {
        setActivities(data.data || []);
      } else {
        setError(data.message || '获取活动列表失败');
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities
  };
}