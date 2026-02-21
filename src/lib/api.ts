// API Base URL using environment variables
// Uses VITE_API_BASE_URL env variable - set this in your .env file
// For local development: can be empty (uses proxy) or set to http://127.0.0.1:8000
// For production: set to your Render backend URL

const getApiBaseUrl = (): string => {
  // Check if VITE_API_BASE_URL is set
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  // If no env var is set:
  // - In production build (import.meta.env.PROD is true), use relative URLs
  // - In development, use the proxy (/api prefix)
  if (import.meta.env.PROD) {
    return ''; // Production: use relative URLs
  }
  
  return '/api'; // Development: use Vite proxy
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to make API calls
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  return response;
};
