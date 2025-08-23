'use client';

import { useState, useEffect } from 'react';
import { useOnlineStatus } from '@/hooks/useServiceWorker';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showIndicator, setShowIndicator] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setHasBeenOffline(true);
      setShowIndicator(true);
    } else if (hasBeenOffline) {
      // Show "back online" message briefly
      setShowIndicator(true);
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, hasBeenOffline]);

  if (!showIndicator) return null;

  return (
    <div className={`
      fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium transition-all duration-300
      ${isOnline 
        ? 'bg-green-500 text-white' 
        : 'bg-orange-500 text-white'
      }
    `}>
      <div className="flex items-center justify-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-200' : 'bg-orange-200'}`} />
        <span>
          {isOnline ? '网络已恢复' : '网络连接中断，正在使用离线模式'}
        </span>
      </div>
    </div>
  );
}

// Install prompt component
export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as { standalone?: boolean }).standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      return; // Already installed
    }

    // Show install prompt after some time
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 30000); // Show after 30 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleInstall = () => {
    // This would trigger the install prompt
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember user dismissed it
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 sm:max-w-sm sm:left-auto sm:right-4">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🪷</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            安装莲花岛应用
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            添加到主屏幕，获得更好的使用体验
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
            >
              安装
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-gray-500 text-xs hover:text-gray-700 transition-colors"
            >
              稍后
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}