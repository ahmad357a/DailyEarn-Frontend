import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3005',
  withCredentials: true, // Important for cross-domain cookie handling
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for session-based authentication
api.interceptors.request.use(
  (config) => {
    // Session-based auth relies on cookies, no need for Authorization headers
    // Just ensure credentials are included (already configured globally)
    
    // Debugging information
    if (import.meta.env.DEV) {
      console.debug(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
      console.debug(`With credentials: ${config.withCredentials}`);
      console.debug(`Current cookies:`, document.cookie);
    }
    
    // Ensure withCredentials is always true for all requests
    config.withCredentials = true;
    
    // Add extra headers to ensure CORS compatibility
    config.headers.set('Accept', 'application/json');
    config.headers.set('Content-Type', 'application/json');
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development mode
    if (import.meta.env.DEV) {
      console.debug(`Response from ${response.config.url}:`, response.status);
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (error.response) {
      console.error(`Error ${error.response.status} from ${error.config?.url}:`, error.response.data);
      
      if (error.response.status === 401) {
        // Handle unauthorized access - session expired or not authenticated
        console.warn('Unauthorized request detected. Session may be expired.');
        
        // Check for specific error message from server
        const errorMessage = error.response.data?.error || 'Authentication failed';
        console.warn(`Auth error details: ${errorMessage}`);
        
        // Only redirect if we're not already on login/auth pages
        const currentPath = window.location.pathname;
        const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/'];
        
        if (!authPaths.includes(currentPath)) {
          console.log(`Redirecting from ${currentPath} to login page`);
          // Redirect to login with return path
          window.location.href = `/login?returnTo=${encodeURIComponent(currentPath)}`;
        }
      } else if (error.response.status >= 500) {
        console.error('Server error:', error.response.status, error.response.data);
      }
    } else if (error.request) {
      // Check if it's a CORS or network error
      const isCorsError = error.message?.includes('CORS') || 
                         error.message?.includes('Access-Control-Allow-Origin') ||
                         error.code === 'ERR_NETWORK' ||
                         error.code === 'ERR_FAILED' ||
                         (error.request && error.request.status === 0);
      
      if (isCorsError) {
        console.error('CORS or Network error detected:', {
          message: error.message,
          code: error.code,
          status: error.request?.status,
          config_url: error.config?.url,
          baseURL: error.config?.baseURL
        });
        
        // Create a more descriptive error for CORS issues
        const corsError = new Error('Network connection failed. This might be due to CORS policy or server unavailability.');
        corsError.name = 'CORSError';
        return Promise.reject(corsError);
      }
      
      // Request was made but no response received
      console.error('Network error - no response received:', error.request);
    } else {
      // Something else caused the error
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
