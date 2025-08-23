'use client';

import { useState } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { Activity } from '@/types';
import { ActivityService } from '@/lib/services/activity-service';

interface ActivityManagerProps {
  onActivitySelect?: (activity: Activity) => void;
}

export default function ActivityManager({ onActivitySelect }: ActivityManagerProps) {
  const { activities, loading, error, refresh } = useActivities();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    onActivitySelect?.(activity);
  };

  const handleToggleStatus = async (activity: Activity) => {
    try {
      await fetch(`/api/activities/${activity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !activity.isActive
        })
      });
      refresh();
    } catch (error) {
      console.error('切换活动状态失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">错误: {error}</p>
        <button 
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">活动配置管理</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          创建新活动
        </button>
      </div>

      <div className="grid gap-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedActivity?.id === activity.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleActivityClick(activity)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{activity.name}</h3>
                <p className="text-gray-600">类型: {activity.type}</p>
                <p className="text-sm text-gray-500 mt-1">
                  创建时间: {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {activity.isActive ? '活跃' : '禁用'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(activity);
                  }}
                  className={`px-3 py-1 rounded text-sm ${
                    activity.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {activity.isActive ? '禁用' : '启用'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          暂无活动配置
        </div>
      )}
    </div>
  );
}