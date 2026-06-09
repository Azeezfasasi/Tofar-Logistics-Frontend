import axios from 'axios';

// Create axios instance with default timeout
export const axiosInstance = axios.create({
  timeout: 15000, // 15 second timeout for all requests
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
      config.timeout = 15000;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle retries and errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Log the error for debugging
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.warn('🔴 Request timeout - iOS may have network issues', {
        url: config?.url,
        timeout: config?.timeout,
        device: navigator.userAgent
      });
    }
    
    // Retry logic for network errors
    if (!config || !config.retry) {
      config.retry = 0;
    }
    
    // Retry up to 3 times for network errors (but not for 400/401/403 errors)
    if (error.response?.status >= 500 || error.code === 'ECONNABORTED' || !error.response) {
      config.retry += 1;
      
      if (config.retry <= 2) { // Max 2 retries (3 total attempts)
        console.log(`🔄 Retrying request (attempt ${config.retry + 1}/3): ${config.url}`);
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.min(1000 * Math.pow(2, config.retry - 1), 5000);
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
