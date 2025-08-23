'use client';

import { useEffect } from 'react';
import { CheckInStatus as CheckInStatusType } from '@/types';
import { useCheckIn } from '@/contexts/CheckInContext';

interface CheckInStatusProps {
  onStatusChange?: (status: CheckInStatusType) => void;
  className?: string;
  showLastCheckIn?: boolean;
}

export function CheckInStatus({ 
  onStatusChange, 
  className = '',
  showLastCheckIn = true 
}: CheckInStatusProps) {
  const { status, loading, error, refreshStatus } = useCheckIn();

  // 当状态变化时通知父组件
  useEffect(() => {
    if (status) {
      onStatusChange?.(status);
    }
  }, [status, onStatusChange]);



  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center justify-center space-x-3 p-6 bg-gray-100 rounded-xl">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="space-y-2">
            <div className="w-24 h-4 bg-gray-300 rounded"></div>
            <div className="w-32 h-3 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">获取状态失败</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
          <button
            onClick={refreshStatus}
            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors duration-200 active:scale-95 transform"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className={`
        p-6 rounded-xl border transition-all duration-300 transform hover:scale-[1.02]
        ${status.canCheckIn 
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-green-100' 
          : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 shadow-gray-100'
        } shadow-lg
      `}>
        <div className="flex items-center space-x-4">
          {/* 状态图标 */}
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
            ${status.canCheckIn 
              ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-200' 
              : 'bg-gradient-to-br from-gray-400 to-slate-500 shadow-lg shadow-gray-200'
            }
          `}>
            {status.canCheckIn ? (
              <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          {/* 状态信息 */}
          <div className="flex-1 min-w-0">
            <h3 className={`
              text-lg font-semibold transition-colors duration-300
              ${status.canCheckIn ? 'text-green-800' : 'text-gray-700'}
            `}>
              {status.canCheckIn ? '可以签到' : '今日已签到'}
            </h3>
            
            <p className={`
              text-sm transition-colors duration-300
              ${status.canCheckIn ? 'text-green-600' : 'text-gray-500'}
            `}>
              {status.canCheckIn 
                ? '点击签到按钮完成今日签到' 
                : '您今天已经完成签到了'
              }
            </p>

            {/* 上次签到时间 */}
            {showLastCheckIn && status.lastCheckIn && (
              <p className="text-xs text-gray-400 mt-1">
                上次签到: {new Date(status.lastCheckIn).toLocaleString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>

          {/* 状态指示器 */}
          <div className={`
            w-3 h-3 rounded-full transition-all duration-300
            ${status.canCheckIn 
              ? 'bg-green-400 animate-pulse shadow-lg shadow-green-300' 
              : 'bg-gray-400'
            }
          `}></div>
        </div>

        {/* 移动端触摸反馈 */}
        <div className="mt-4 sm:hidden">
          <div className={`
            h-1 rounded-full transition-all duration-300
            ${status.canCheckIn 
              ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
              : 'bg-gradient-to-r from-gray-300 to-slate-400'
            }
          `}></div>
        </div>
      </div>
    </div>
  );
}

