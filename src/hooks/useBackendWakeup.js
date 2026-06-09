import { useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import { API_BASE_URL } from '../config/Api';

/**
 * Hook to keep the backend server alive by pinging it every 3 minutes
 * Prevents Render.com cold start delays on iOS and other devices
 * Uses AbortController for proper timeout handling on iOS
 */
export const useBackendWakeup = () => {
  useEffect(() => {
    const wakeupBackend = async (isInitial = false) => {
      const controller = new AbortController();
      // First request: 45s timeout, subsequent: 15s timeout
      const timeoutMs = isInitial ? 45000 : 15000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        await axiosInstance.get(`${API_BASE_URL}/wakeup`, { 
          signal: controller.signal,
          timeout: timeoutMs,
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        console.log('✅ Backend wakeup successful');
      } catch (err) {
        console.warn('⚠️ Backend wakeup failed (retrying):', err.message);
        // Retry once on initial load if failed
        if (isInitial && err.code !== 'ERR_CANCELED') {
          setTimeout(() => wakeupBackend(false), 3000);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // Ping immediately on mount (with longer timeout for cold start)
    wakeupBackend(true);

    // Set up interval to ping every 3 minutes (180,000 ms) - more aggressive for iOS
    const interval = setInterval(() => wakeupBackend(false), 3 * 60 * 1000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(interval);
    };
  }, []);
};
