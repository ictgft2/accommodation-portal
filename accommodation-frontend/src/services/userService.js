import apiClient, { handleApiError, buildQueryParams } from './apiClient';

/**
 * User Service
 * Handles all user management and profile-related API calls
 */
export const userService = {
  // ============ USER MANAGEMENT OPERATIONS ============

  /**
   * Get list of users with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Users list with pagination info
   */
  async getUsers(params = {}) {
    try {
      const response = await apiClient.get('/auth/users/', { params });
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
   * Get specific user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User details
   */
  async getUser(userId) {
    try {
      const response = await apiClient.get(`/auth/users/${userId}/`);
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
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user data
   */
  async createUser(userData) {
    try {
      const response = await apiClient.post('/auth/users/', userData);
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
   * Update user information
   * @param {number} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user data
   */
  async updateUser(userId, userData) {
    try {
      const response = await apiClient.put(`/auth/users/${userId}/`, userData);
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
   * Partially update user information
   * @param {number} userId - User ID
   * @param {Object} userData - Partial user data
   * @returns {Promise<Object>} Updated user data
   */
  async patchUser(userId, userData) {
    try {
      const response = await apiClient.patch(`/auth/users/${userId}/`, userData);
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
   * Delete user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteUser(userId) {
    try {
      await apiClient.delete(`/auth/users/${userId}/`);
      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Bulk delete users
   * @param {Array} userIds - Array of user IDs
   * @returns {Promise<Object>} Bulk deletion result
   */
  async bulkDeleteUsers(userIds) {
    try {
      const response = await apiClient.post('/auth/users/bulk-delete/', {
        user_ids: userIds
      });
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

  // ============ PROFILE MANAGEMENT OPERATIONS ============

  /**
   * Get current user profile
   * @returns {Promise<Object>} Current user profile data
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/auth/profile/');
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
   * Update current user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile data
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/auth/profile/', profileData);
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
   * Upload user avatar
   * @param {File} avatarFile - Avatar image file
   * @returns {Promise<Object>} Upload result with avatar URL
   */
  async uploadAvatar(avatarFile) {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await apiClient.post('/auth/profile/avatar/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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
   * Remove user avatar
   * @returns {Promise<Object>} Removal result
   */
  async removeAvatar() {
    try {
      const response = await apiClient.delete('/auth/profile/avatar/');
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

  // ============ PASSWORD & SECURITY OPERATIONS ============

  /**
   * Change user password
   * @param {Object} passwordData - { old_password, new_password, confirm_password }
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
   * @param {Object} resetData - { token, new_password, confirm_password }
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

  // ============ USER SETTINGS OPERATIONS ============

  /**
   * Get user settings/preferences
   * @returns {Promise<Object>} User settings
   */
  async getSettings() {
    try {
      const response = await apiClient.get('/auth/settings/');
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
   * Update user settings/preferences
   * @param {Object} settings - Settings to update
   * @returns {Promise<Object>} Updated settings
   */
  async updateSettings(settings) {
    try {
      const response = await apiClient.put('/auth/settings/', settings);
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

  // ============ USER SEARCH & FILTERING ============

  /**
   * Search users by various criteria
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchUsers(searchParams) {
    try {
      const response = await apiClient.get('/auth/users/search/', { 
        params: searchParams 
      });
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
   * Get users by role
   * @param {string} role - User role to filter by
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Filtered users
   */
  async getUsersByRole(role, params = {}) {
    try {
      const queryParams = { ...params, role };
      const response = await apiClient.get('/auth/users/', { params: queryParams });
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

  // ============ USER ACTIVITY & LOGS ============

  /**
   * Get user activity log
   * @param {number} userId - User ID (optional, defaults to current user)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} User activity data
   */
  async getUserActivity(userId = null, params = {}) {
    try {
      const endpoint = userId 
        ? `/auth/users/${userId}/activity/`
        : '/auth/profile/activity/';
      
      const response = await apiClient.get(endpoint, { params });
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

  // ============ USER STATISTICS ============

  /**
   * Get user statistics for dashboard
   * @returns {Promise<Object>} User statistics
   */
  async getUserStatistics() {
    try {
      const response = await apiClient.get('/auth/users/statistics/');
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

  // ============ ROLE MANAGEMENT ============

  /**
   * Update user role (admin only)
   * @param {number} userId - User ID
   * @param {string} role - New role
   * @returns {Promise<Object>} Role update result
   */
  async updateUserRole(userId, role) {
    try {
      const response = await apiClient.patch(`/auth/users/${userId}/role/`, { role });
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
   * Get available roles
   * @returns {Promise<Object>} Available roles list
   */
  async getAvailableRoles() {
    try {
      // Roles are defined as choices in Django User model
      const roles = [
        { value: 'SuperAdmin', label: 'Super Admin' },
        { value: 'ServiceUnitAdmin', label: 'Service Unit Admin' },
        { value: 'Pastor', label: 'Pastor' },
        { value: 'Member', label: 'Member' }
      ];
      
      return {
        success: true,
        data: roles
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  }
};

export default userService;
