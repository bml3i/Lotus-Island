'use client';

import { useRouter } from 'next/navigation';
import { useAuth, withAuth } from '@/contexts/AuthContext';
import { MobileLayout, MobileCard, MobileGrid } from '@/components/ui/MobileLayout';
import { TouchButton } from '@/components/ui/TouchFeedback';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function DashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>
    );
  }

  const activities = [
    {
      id: 'backpack',
      title: '我的背包',
      description: '查看和使用你的物品',
      icon: '🎒',
      color: 'from-blue-500 to-blue-600',
      route: '/backpack'
    },
    {
      id: 'checkin',
      title: '每日签到',
      description: '签到获得莲子奖励',
      icon: '✅',
      color: 'from-green-500 to-green-600',
      route: '/checkin'
    },
    {
      id: 'exchange',
      title: '物品兑换',
      description: '用物品兑换有用的奖励',
      icon: '🔄',
      color: 'from-emerald-500 to-emerald-600',
      route: '/exchange'
    },
    {
      id: 'activities',
      title: '活动广场',
      description: '参与各种有趣的活动',
      icon: '🎪',
      color: 'from-purple-500 to-purple-600',
      route: '/activities'
    }
  ];

  const headerActions = (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-gray-600 truncate max-w-20 sm:max-w-none">
        {user?.username}
      </span>
      <TouchButton
        onClick={handleLogout}
        variant="outline"
        size="sm"
        className="text-red-600 border-red-300 hover:bg-red-50"
      >
        登出
      </TouchButton>
    </div>
  );

  return (
    <MobileLayout
      title="莲花岛"
      headerActions={headerActions}
      className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
    >
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <MobileCard className="text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-3xl">🪷</span>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">欢迎回来！</h2>
          <p className="text-blue-100 text-sm">
            开始你的好习惯培养之旅
          </p>
        </MobileCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <MobileCard className="text-center" padding="sm">
            <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
            <div className="text-xs text-gray-600">今日签到</div>
          </MobileCard>
          <MobileCard className="text-center" padding="sm">
            <div className="text-2xl font-bold text-green-600 mb-1">0</div>
            <div className="text-xs text-gray-600">莲子余额</div>
          </MobileCard>
        </div>

        {/* Activities Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 px-1">
            功能导航
          </h3>
          <MobileGrid minItemWidth={140} gap={16}>
            {activities.map((activity) => (
              <MobileCard
                key={activity.id}
                onClick={() => router.push(activity.route)}
                className="text-center hover:shadow-lg transition-all duration-200 active:scale-95"
                interactive
              >
                <div className={`
                  w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center
                  bg-gradient-to-br ${activity.color} shadow-lg
                `}>
                  <span className="text-xl">{activity.icon}</span>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                  {activity.title}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {activity.description}
                </p>
              </MobileCard>
            ))}
          </MobileGrid>
        </div>

        {/* Recent Activity */}
        <MobileCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">最近活动</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              查看全部
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-900">今日签到完成</p>
                <p className="text-gray-500 text-xs">获得 5 个莲子</p>
              </div>
              <span className="text-gray-400 text-xs">刚刚</span>
            </div>
            
            <div className="text-center py-4 text-gray-500 text-sm">
              暂无更多活动记录
            </div>
          </div>
        </MobileCard>

        {/* Tips */}
        <MobileCard className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-yellow-600">💡</span>
            </div>
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">每日提醒</h4>
              <p className="text-sm text-yellow-700">
                记得每天签到获取莲子，坚持好习惯培养！
              </p>
            </div>
          </div>
        </MobileCard>

        {/* Bottom spacing for mobile */}
        <div className="h-4"></div>
      </div>
    </MobileLayout>
  );
}

export default withAuth(DashboardPage);