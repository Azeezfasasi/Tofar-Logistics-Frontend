import axios from 'axios';

// Create axios instance with default timeout
export const axiosInstance = axios.create({
  timeout: 45000, // 45 second timeout for iOS cold start on Render.com
});

// Request interceptor - add token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set timeout if not already set
    if (!config.timeout) {
      config.timeout = 45000; // Increased for iOS
    }
    
    // Add cache-busting headers for iOS
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    
    // Create AbortController for proper timeout handling on iOS
    if (!config.signal) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      config.signal = controller.signal;
      config._timeoutId = timeoutId;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle retries and errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Clear the timeout
    if (response.config._timeoutId) {
      clearTimeout(response.config._timeoutId);
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Clear the timeout
    if (config?._timeoutId) {
      clearTimeout(config._timeoutId);
    }
    
    // Log the error for debugging
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.warn('🔴 Request timeout - possible iOS network issue', {
        url: config?.url,
        timeout: config?.timeout,
        userAgent: navigator.userAgent
      });
    }
    
    // Skip retries for wakeup endpoint (no point in retrying a cold start ping)
    const isWakeupRequest = config?.url?.includes('/api/wakeup');
    if (isWakeupRequest) {
      return Promise.reject(error);
    }
    
    // Retry logic for network errors (but not for wakeup or auth errors)
    if (!config || !config.retry) {
      config.retry = 0;
    }
    
    // Retry up to 3 times for network errors (but not for 400/401/403 errors)
    if (error.response?.status >= 500 || error.code === 'ECONNABORTED' || !error.response) {
      config.retry += 1;
      
      if (config.retry <= 3) { // Max 3 retries (4 total attempts)
        console.log(`🔄 Retrying request (attempt ${config.retry + 1}/4): ${config.url}`);
        
        // Exponential backoff: 2s, 4s, 8s (longer for iOS)
        const delay = Math.min(2000 * Math.pow(2, config.retry - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return axiosInstance(config);
      }
    }
    
    // Handle 401 Unauthorized - clear auth and redirect
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
