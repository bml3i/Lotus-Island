'use client';

import { useEffect } from 'react';
import { useServiceWorker, useOnlineStatus } from '@/hooks/useServiceWorker';
import { OfflineIndicator, InstallPrompt } from '@/components/ui/OfflineIndicator';

interface ServiceWorkerProviderProps {
  children: React.ReactNode;
}

export function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps) {
  const { isSupported, isRegistered, error } = useServiceWorker();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (isSupported && isRegistered) {
      console.log('Service Worker is active');
    }
    
    if (error) {
      console.error('Service Worker error:', error);
    }
  }, [isSupported, isRegistered, error]);

  // Show offline indicator
  useEffect(() => {
    if (!isOnline) {
      console.log('App is offline - cached content will be served');
    }
  }, [isOnline]);

  return (
    <>
      {children}
      <OfflineIndicator />
      <InstallPrompt />
    </>
  );
}