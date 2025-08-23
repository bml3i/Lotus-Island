'use client';

import { useRouter } from 'next/navigation';
import { withAuth } from '@/contexts/AuthContext';
import { ActivityList } from '@/components/activities';
import { useActivitiesData } from '@/hooks/useActivitiesData';

function ActivitiesPage() {
  const router = useRouter();
  const { activities, loading, error, refetch } = useActivitiesData();

  const handleNavigate = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-3 sm:mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xl sm:text-2xl">🎪</span>
              <h1 className="ml-2 text-lg sm:text-xl font-semibold text-gray-900">活动广场</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:py-6 sm:px-0">
          <ActivityList
            activities={activities}
            loading={loading}
            error={error}
            onRetry={refetch}
            onNavigate={handleNavigate}
          />
        </div>
      </main>
    </div>
  );
}

export default withAuth(ActivitiesPage);