import { useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import { API_BASE_URL } from '../config/Api';

/**
 * Hook to keep the backend server alive by pinging it every 5 minutes
 * Prevents Render.com cold start delays on iOS and other devices
 */
export const useBackendWakeup = () => {
  useEffect(() => {
    // First ping immediately on app load
    const wakeupBackend = async () => {
      try {
        await axiosInstance.get(`${API_BASE_URL}/wakeup`, { 
          timeout: 5000 // Quick timeout for ping
        });
        console.log('✅ Backend wakeup successful');
      } catch (err) {
        console.warn('⚠️ Backend wakeup failed (non-critical):', err.message);
        // Non-critical - don't throw, just log
      }
    };

    // Ping immediately on mount
    wakeupBackend();

    // Set up interval to ping every 5 minutes (300,000 ms)
    const interval = setInterval(wakeupBackend, 5 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);
};
