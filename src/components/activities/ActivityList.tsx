'use client';

import { Activity } from '@/types';
import ActivityCard from './ActivityCard';

interface ActivityListProps {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onNavigate: (route: string) => void;
}

export default function ActivityList({ 
  activities, 
  loading, 
  error, 
  onRetry, 
  onNavigate 
}: ActivityListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载活动中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          重新加载
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🎪</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无活动</h3>
        <p className="text-gray-600">目前没有可参与的活动，请稍后再来看看！</p>
      </div>
    );
  }

  // 分离活跃和非活跃活动
  const activeActivities = activities.filter(activity => activity.isActive);
  const inactiveActivities = activities.filter(activity => !activity.isActive);

  return (
    <div className="space-y-8">
      {/* 活跃活动 */}
      {activeActivities.length > 0 && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">正在进行的活动</h2>
            <p className="text-gray-600">参与这些精彩活动，获得丰厚奖励！</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {activeActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}

      {/* 非活跃活动 */}
      {inactiveActivities.length > 0 && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">已结束的活动</h2>
            <p className="text-gray-500">这些活动已经结束，敬请期待新的活动！</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {inactiveActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}