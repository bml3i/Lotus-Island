'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Activity } from '@/types';

interface ActivityContextType {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refreshActivities: () => Promise<void>;
  getActivityByType: (type: string) => Activity[];
  getActiveActivities: () => Activity[];
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

interface ActivityProviderProps {
  children: ReactNode;
}

export function ActivityProvider({ children }: ActivityProviderProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/activities');
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

  const getActivityByType = (type: string): Activity[] => {
    return activities.filter(activity => activity.type === type && activity.isActive);
  };

  const getActiveActivities = (): Activity[] => {
    return activities.filter(activity => activity.isActive);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const value: ActivityContextType = {
    activities,
    loading,
    error,
    refreshActivities: fetchActivities,
    getActivityByType,
    getActiveActivities
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivityContext() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivityContext must be used within an ActivityProvider');
  }
  return context;
}