// Get API base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8100/api';

// Helper function to get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to handle fetch responses
const handleResponse = async (response) => {
  let data;
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  
  if (!response.ok) {
    const error = new Error(data.message || data.detail || `HTTP error! status: ${response.status}`);
    error.response = {
      status: response.status,
      statusText: response.statusText,
      data: data
    };
    throw error;
  }
  
  return { data, status: response.status, statusText: response.statusText };
};

// Helper function to handle API errors consistently
export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        // Bad Request - often validation errors
        if (data && typeof data === 'object') {
          // Extract specific field errors
          const fieldErrors = [];
          Object.keys(data).forEach(field => {
            if (Array.isArray(data[field])) {
              fieldErrors.push(`${field}: ${data[field].join(', ')}`);
            } else {
              fieldErrors.push(`${field}: ${data[field]}`);
            }
          });
          return { 
            error: fieldErrors.length > 0 ? fieldErrors.join('; ') : 'Validation failed.',
            errors: data 
          };
        }
        return { error: data.message || data.detail || 'Bad request.' };
      case 401:
        // Token expired or invalid - redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        return { error: 'Authentication required. Please log in again.' };
      case 403:
        return { error: 'Access denied. You do not have permission to perform this action.' };
      case 404:
        return { error: 'The requested resource was not found.' };
      case 422:
        return { 
          error: 'Validation failed.', 
          errors: data.errors || data 
        };
      case 500:
        return { error: 'A server error occurred. Please try again later.' };
      default:
        return { 
          error: data.message || data.detail || 'An unexpected error occurred.' 
        };
    }
  } else {
    return { 
      error: 'Network error. Please check your internet connection and try again.' 
    };
  }
};

// Helper function to build query parameters
export const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  return searchParams.toString();
};

// API Client object with common HTTP methods
const apiClient = {
  // GET request
  async get(url, options = {}) {
    const { params, ...fetchOptions } = options;
    let fullUrl = `${API_BASE_URL}${url}`;
    
    if (params) {
      const queryString = buildQueryParams(params);
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: getAuthHeaders(),
      ...fetchOptions,
    });
    
    return handleResponse(response);
  },

  // POST request
  async post(url, data = null, options = {}) {
    const defaultHeaders = getAuthHeaders();
    const headers = { ...defaultHeaders, ...options.headers };
    
    // Don't JSON.stringify FormData objects
    const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : null);
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body,
      ...options,
    });
    
    return handleResponse(response);
  },

  // PUT request
  async put(url, data = null, options = {}) {
    const defaultHeaders = getAuthHeaders();
    const headers = { ...defaultHeaders, ...options.headers };
    
    // Don't JSON.stringify FormData objects
    const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : null);
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers,
      body,
      ...options,
    });
    
    return handleResponse(response);
  },

  // PATCH request
  async patch(url, data = null, options = {}) {
    const defaultHeaders = getAuthHeaders();
    const headers = { ...defaultHeaders, ...options.headers };
    
    // Don't JSON.stringify FormData objects
    const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : null);
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers,
      body,
      ...options,
    });
    
    return handleResponse(response);
  },

  // DELETE request
  async delete(url, options = {}) {
    const defaultHeaders = getAuthHeaders();
    const headers = { ...defaultHeaders, ...options.headers };
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers,
      ...options,
    });
    
    return handleResponse(response);
  }
};

export default apiClient;
