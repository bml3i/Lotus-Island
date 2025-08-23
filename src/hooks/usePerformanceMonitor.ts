'use client';

import { useEffect, useRef, useState } from 'react';
import { performanceUtils, networkUtils } from '@/lib/mobile-utils';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  connectionType: string;
  isSlowConnection: boolean;
  memoryUsage?: number;
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const renderStartRef = useRef<number>(Date.now());

  useEffect(() => {
    const measurePerformance = () => {
      const loadTime = Date.now() - startTimeRef.current;
      const renderTime = Date.now() - renderStartRef.current;
      
      const connectionType = networkUtils.getConnectionType();
      const isSlowConnection = networkUtils.isSlowConnection();
      
      // Memory usage (if available)
      let memoryUsage: number | undefined;
      if ('memory' in performance) {
        const memory = (performance as { memory?: { usedJSHeapSize: number } }).memory;
        memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : undefined; // MB
      }

      setMetrics({
        loadTime,
        renderTime,
        connectionType,
        isSlowConnection,
        memoryUsage
      });
    };

    // Measure after component mount
    const timer = setTimeout(measurePerformance, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return metrics;
}

// Hook for monitoring scroll performance
export function useScrollPerformance() {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const handleScroll = performanceUtils.throttle(() => {
      setIsScrolling(true);
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    }, 16); // 60fps

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return { isScrolling };
}

// Hook for network status monitoring
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [connectionType, setConnectionType] = useState(networkUtils.getConnectionType());
  const [isSlowConnection, setIsSlowConnection] = useState(networkUtils.isSlowConnection());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    const handleConnectionChange = () => {
      setConnectionType(networkUtils.getConnectionType());
      setIsSlowConnection(networkUtils.isSlowConnection());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for connection changes
    const connection = (navigator as { connection?: { addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void } }).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isSlowConnection
  };
}

// Hook for viewport size monitoring
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false
  });

  useEffect(() => {
    const handleResize = performanceUtils.throttle(() => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768
      });
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

// Hook for battery status (if available)
export function useBatteryStatus() {
  const [batteryStatus, setBatteryStatus] = useState<{
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
  } | null>(null);

  useEffect(() => {
    const getBatteryInfo = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as { getBattery?: () => Promise<{ level: number; charging: boolean; chargingTime: number; dischargingTime: number; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void }> }).getBattery?.();
          
          if (battery) {
            const updateBatteryInfo = () => {
              setBatteryStatus({
                level: battery.level,
                charging: battery.charging,
                chargingTime: battery.chargingTime,
                dischargingTime: battery.dischargingTime
              });
            };

            updateBatteryInfo();
            
            battery.addEventListener('chargingchange', updateBatteryInfo);
            battery.addEventListener('levelchange', updateBatteryInfo);
            
            return () => {
              battery.removeEventListener('chargingchange', updateBatteryInfo);
              battery.removeEventListener('levelchange', updateBatteryInfo);
            };
          }
        } catch (error) {
          console.warn('Battery API not available:', error);
        }
      }
    };

    getBatteryInfo();
  }, []);

  return batteryStatus;
}