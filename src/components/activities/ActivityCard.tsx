'use client';

import { Activity } from '@/types';

interface ActivityCardProps {
  activity: Activity;
  onNavigate: (route: string) => void;
}

export default function ActivityCard({ activity, onNavigate }: ActivityCardProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'checkin':
        return '📅';
      case 'exchange':
        return '🔄';
      default:
        return '🎯';
    }
  };

  const getActivityRoute = (type: string) => {
    switch (type) {
      case 'checkin':
        return '/checkin';
      case 'exchange':
        return '/exchange';
      default:
        return '#';
    }
  };

  const getActivityDescription = (activity: Activity) => {
    const config = (activity.config as Record<string, unknown>) || {};
    switch (activity.type) {
      case 'checkin':
        return `每日签到获得 ${(config.reward as number) || 5} 个莲子`;
      case 'exchange':
        return `用 ${(config.fromQuantity as number) || 10} 个莲子兑换奖励`;
      default:
        return activity.name;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'checkin':
        return 'from-green-400 to-green-600';
      case 'exchange':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-purple-400 to-purple-600';
    }
  };

  const handleClick = () => {
    const route = getActivityRoute(activity.type);
    if (route !== '#' && activity.isActive) {
      onNavigate(route);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 active:scale-95">
      {/* Activity Header with Gradient */}
      <div className={`bg-gradient-to-r ${getActivityColor(activity.type)} p-4 sm:p-6`}>
        <div className="flex items-center justify-between">
          <div className="text-2xl sm:text-3xl">
            {getActivityIcon(activity.type)}
          </div>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            activity.isActive 
              ? 'bg-white bg-opacity-20 text-white' 
              : 'bg-black bg-opacity-20 text-white'
          }`}>
            {activity.isActive ? '进行中' : '已结束'}
          </div>
        </div>
      </div>

      {/* Activity Content */}
      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
          {activity.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {getActivityDescription(activity)}
        </p>
        
        <button
          onClick={handleClick}
          disabled={!activity.isActive}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 touch-manipulation ${
            activity.isActive
              ? `bg-gradient-to-r ${getActivityColor(activity.type)} hover:shadow-lg text-white transform hover:scale-105 active:scale-95`
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {activity.isActive ? '立即参与' : '活动已结束'}
        </button>
      </div>
    </div>
  );
}