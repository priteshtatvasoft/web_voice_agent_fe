// Base API service for handling all HTTP requests

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
  token?: string;
  isFormData?: boolean;
}

/**
 * Generic request function to handle all API calls
 */
async function request<T>(
  endpoint: string,
  method: HttpMethod = 'GET',
  data: any = null,
  options: RequestOptions = {}
): Promise<T> {
  const { token, isFormData, ...customConfig } = options;
  
  const headers: HeadersInit = {};
  
  // Set content type to JSON if not FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Add authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
    credentials: 'include', // Include cookies in requests
  };

  // Add body if not a GET or HEAD request
  if (method !== 'GET' && data) {
    config.body = isFormData ? data : JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    const responseData = await response.json();
    
    if (!response.ok) {
      const error = new Error(responseData.message || 'Something went wrong');
      // Attach response data to error object for error handling
      (error as any).response = responseData;
      (error as any).status = response.status;
      throw error;
    }

    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      // Handle network errors
      if (error.name === 'TypeError') {
        throw new Error('Network error. Please check your connection.');
      }
    }
    throw error;
  }
}

// Helper functions for different HTTP methods
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, 'GET', null, options),
  
  post: <T>(endpoint: string, data: any, options?: RequestOptions) => 
    request<T>(endpoint, 'POST', data, options),
  
  put: <T>(endpoint: string, data: any, options?: RequestOptions) => 
    request<T>(endpoint, 'PUT', data, options),
  
  patch: <T>(endpoint: string, data: any, options?: RequestOptions) => 
    request<T>(endpoint, 'PATCH', data, options),
  
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, 'DELETE', null, options),
  
  // Helper for file uploads
  upload: <T>(endpoint: string, formData: FormData, options?: RequestOptions) =>
    request<T>(endpoint, 'POST', formData, { ...options, isFormData: true }),
};

export default api;
