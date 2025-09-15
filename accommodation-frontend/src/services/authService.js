import apiClient, { handleApiError } from './apiClient';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Login user with email and password
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} User data and token
   */
  async login(credentials) {
    try {
      // Convert email to username field for Django backend
      const loginData = {
        username: credentials.email || credentials.username,
        password: credentials.password
      };
      const response = await apiClient.post('/auth/login/', loginData);
      const { tokens, user } = response.data;
      
      // Store authentication data
      if (tokens) {
        localStorage.setItem('token', tokens.access);
        localStorage.setItem('refreshToken', tokens.refresh);
      }
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        data: {
          token: tokens?.access,
          refreshToken: tokens?.refresh,
          user
        }
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register/', userData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Logout current user
   * @returns {Promise<Object>} Logout result
   */
  async logout() {
    try {
      // Call logout endpoint if available
      await apiClient.post('/auth/logout/');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    }
  },

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} New token data
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/token/refresh/', {
        refresh: refreshToken
      });

      const { access, refresh: newRefresh } = response.data;
      
      // Update stored tokens
      localStorage.setItem('token', access);
      if (newRefresh) {
        localStorage.setItem('refreshToken', newRefresh);
      }
      
      return {
        success: true,
        data: {
          token: access,
          refreshToken: newRefresh
        }
      };
    } catch (error) {
      // If refresh fails, clear tokens and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} Current user data
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/profile/');
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Verify if current token is valid by making a simple authenticated request
   * @returns {Promise<Object>} Token verification result
   */
  async verifyToken() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      // Simply try to get current user to verify token
      const response = await apiClient.get('/profile/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - { old_password, new_password }
   * @returns {Promise<Object>} Password change result
   */
  async changePassword(passwordData) {
    try {
      const response = await apiClient.post('/auth/change-password/', passwordData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset request result
   */
  async requestPasswordReset(email) {
    try {
      const response = await apiClient.post('/auth/password-reset/', { email });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Confirm password reset
   * @param {Object} resetData - { token, new_password }
   * @returns {Promise<Object>} Reset confirmation result
   */
  async confirmPasswordReset(resetData) {
    try {
      const response = await apiClient.post('/auth/password-reset-confirm/', resetData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  /**
   * Get stored user data
   * @returns {Object|null} User data or null
   */
  getStoredUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  },

  /**
   * Get stored authentication token
   * @returns {string|null} Token or null
   */
  getStoredToken() {
    return localStorage.getItem('token');
  }
};

export default authService;
