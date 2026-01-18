import { useState, useEffect } from 'react';

/**
 * Hook to detect online/offline network status
 *
 * Returns:
 * - isOnline: boolean indicating current network status
 * - isOffline: boolean indicating if user is offline
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    // Check if navigator.onLine is available (it may not be in SSR)
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
  };
}

/**
 * Helper function to check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    errorMessage.includes('network') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('networkerror') ||
    errorMessage.includes('net::') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('aborted') ||
    errorMessage.includes('connection') ||
    !navigator.onLine
  );
}
