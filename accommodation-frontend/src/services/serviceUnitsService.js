/**
 * Service Units API Service
 * Handles all service unit management API calls including CRUD operations,
 * member management, search, filtering, and statistics
 */

import apiClient, { handleApiError } from './apiClient';

export const serviceUnitsService = {
  /**
   * Get all service units with optional filtering and pagination
   * @param {Object} params - { page, pageSize, search, admin, sortBy, sortOrder }
   * @returns {Promise<Object>} Service units list with pagination info
   */
  async getServiceUnits(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('page_size', params.pageSize);
      if (params.search) queryParams.append('search', params.search);
      if (params.admin) queryParams.append('admin', params.admin);
      if (params.sortBy) queryParams.append('ordering', params.sortOrder === 'desc' ? `-${params.sortBy}` : params.sortBy);

      const response = await apiClient.get(`/service-units/?${queryParams.toString()}`);
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
   * Get a specific service unit by ID
   * @param {number} id - Service unit ID
   * @returns {Promise<Object>} Service unit details
   */
  async getServiceUnit(id) {
    try {
      const response = await apiClient.get(`/service-units/${id}/`);
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
   * Create a new service unit
   * @param {Object} serviceUnitData - { name, description, admin }
   * @returns {Promise<Object>} Created service unit
   */
  async createServiceUnit(serviceUnitData) {
    try {
      console.log('Creating service unit with data:', serviceUnitData);
      const response = await apiClient.post('/service-units/', serviceUnitData);
      console.log('Service unit created successfully:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Service unit created successfully'
      };
    } catch (error) {
      console.error('Service unit creation error:', error);
      console.error('Error response:', error.response?.data);
      const result = handleApiError(error);
      console.error('Processed error:', result);
      return {
        success: false,
        ...result
      };
    }
  },

  /**
   * Update an existing service unit
   * @param {number} id - Service unit ID
   * @param {Object} serviceUnitData - Updated service unit data
   * @returns {Promise<Object>} Updated service unit
   */
  async updateServiceUnit(id, serviceUnitData) {
    try {
      const response = await apiClient.put(`/service-units/${id}/`, serviceUnitData);
      return {
        success: true,
        data: response.data,
        message: 'Service unit updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Partially update a service unit
   * @param {number} id - Service unit ID
   * @param {Object} updateData - Partial update data
   * @returns {Promise<Object>} Updated service unit
   */
  async patchServiceUnit(id, updateData) {
    try {
      const response = await apiClient.patch(`/service-units/${id}/`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Service unit updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Delete a service unit
   * @param {number} id - Service unit ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteServiceUnit(id) {
    try {
      await apiClient.delete(`/service-units/${id}/`);
      return {
        success: true,
        message: 'Service unit deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Get members of a specific service unit
   * @param {number} id - Service unit ID
   * @param {Object} params - { page, pageSize, search, role }
   * @returns {Promise<Object>} Service unit members list
   */
  async getServiceUnitMembers(id, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('page_size', params.pageSize);
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);

      const response = await apiClient.get(`/service-units/${id}/members/?${queryParams.toString()}`);
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
   * Assign a member to a service unit
   * @param {number} serviceUnitId - Service unit ID
   * @param {Object} memberData - { user_id, position }
   * @returns {Promise<Object>} Assignment result
   */
  async assignMember(serviceUnitId, memberData) {
    try {
      const response = await apiClient.post(`/service-units/${serviceUnitId}/assign-member/`, memberData);
      return {
        success: true,
        data: response.data,
        message: 'Member assigned successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Remove a member from a service unit
   * @param {number} serviceUnitId - Service unit ID
   * @param {Object} memberData - { user_id }
   * @returns {Promise<Object>} Removal result
   */
  async removeMember(serviceUnitId, memberData) {
    try {
      const response = await apiClient.post(`/service-units/${serviceUnitId}/remove-member/`, memberData);
      return {
        success: true,
        data: response.data,
        message: 'Member removed successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Get service unit statistics
   * @param {number} id - Service unit ID
   * @returns {Promise<Object>} Service unit statistics
   */
  async getServiceUnitStats(id) {
    try {
      const response = await apiClient.get(`/service-units/${id}/stats/`);
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
   * Get available admins for service unit assignment
   * @returns {Promise<Object>} List of users who can be service unit admins
   */
  async getAvailableAdmins() {
    try {
      // Try the service units specific endpoint first
      let response;
      try {
        response = await apiClient.get('/service-units/available-admins/');
      } catch (error) {
        // Fallback to users endpoint if the specific one doesn't exist
        console.log('Trying fallback users endpoint...');
        response = await apiClient.get('/auth/users/?role=SuperAdmin,ServiceUnitAdmin');
      }
      
      console.log('Available admins response:', response);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get available admins error:', error);
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Search for users to add as members
   * @param {Object} params - { search, exclude_service_unit }
   * @returns {Promise<Object>} List of available users
   */
  async searchAvailableMembers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.excludeServiceUnit) queryParams.append('exclude_service_unit', params.excludeServiceUnit);

      const response = await apiClient.get(`/auth/users/?${queryParams.toString()}`);
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
   * Bulk assign members to a service unit
   * @param {number} serviceUnitId - Service unit ID
   * @param {Array} membersList - Array of { user_id, position }
   * @returns {Promise<Object>} Bulk assignment result
   */
  async bulkAssignMembers(serviceUnitId, membersList) {
    try {
      const response = await apiClient.post(`/service-units/${serviceUnitId}/bulk-assign/`, {
        members: membersList
      });
      return {
        success: true,
        data: response.data,
        message: `${membersList.length} members assigned successfully`
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Bulk remove members from a service unit
   * @param {number} serviceUnitId - Service unit ID
   * @param {Array} userIds - Array of user IDs to remove
   * @returns {Promise<Object>} Bulk removal result
   */
  async bulkRemoveMembers(serviceUnitId, userIds) {
    try {
      const response = await apiClient.post(`/service-units/${serviceUnitId}/bulk-remove/`, {
        user_ids: userIds
      });
      return {
        success: true,
        data: response.data,
        message: `${userIds.length} members removed successfully`
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Get service units summary/overview
   * @returns {Promise<Object>} Service units summary with totals and stats
   */
  async getServiceUnitsSummary() {
    try {
      const response = await apiClient.get('/service-units/summary/');
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
  }
};

export default serviceUnitsService;
