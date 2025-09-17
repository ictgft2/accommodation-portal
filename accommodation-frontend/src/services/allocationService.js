/**
 * Allocation Service
 * Handles API calls for room allocations and allocation requests
 */

import apiClient, { handleApiError } from './apiClient';

const ALLOCATION_ENDPOINTS = {
  ALLOCATIONS: '/allocations/allocations/',
  ALLOCATION_REQUESTS: '/allocations/allocation-requests/',
};

export const allocationService = {
  // ================================
  // ROOM ALLOCATIONS
  // ================================

  /**
   * Get all room allocations
   * @param {Object} params - Query parameters (filters, search, ordering)
   * @returns {Promise<Object>} API response with allocations list
   */
  async getAllocations(params = {}) {
    try {
      const response = await apiClient.get(ALLOCATION_ENDPOINTS.ALLOCATIONS, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Get current user's allocations
   * @returns {Promise<Object>} API response with user's allocations
   */
  async getMyAllocations() {
    try {
      const response = await apiClient.get(`${ALLOCATION_ENDPOINTS.ALLOCATIONS}my_allocations/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Get a specific allocation by ID
   * @param {number} id - Allocation ID
   * @returns {Promise<Object>} API response with allocation details
   */
  async getAllocation(id) {
    try {
      const response = await apiClient.get(`${ALLOCATION_ENDPOINTS.ALLOCATIONS}${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Create a new room allocation
   * @param {Object} allocationData - Allocation data
   * @returns {Promise<Object>} API response with created allocation
   */
  async createAllocation(allocationData) {
    try {
      const response = await apiClient.post(ALLOCATION_ENDPOINTS.ALLOCATIONS, allocationData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Update an existing allocation
   * @param {number} id - Allocation ID
   * @param {Object} allocationData - Updated allocation data
   * @returns {Promise<Object>} API response with updated allocation
   */
  async updateAllocation(id, allocationData) {
    try {
      const response = await apiClient.patch(`${ALLOCATION_ENDPOINTS.ALLOCATIONS}${id}/`, allocationData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Delete an allocation
   * @param {number} id - Allocation ID
   * @returns {Promise<Object>} API response
   */
  async deleteAllocation(id) {
    try {
      const response = await apiClient.delete(`${ALLOCATION_ENDPOINTS.ALLOCATIONS}${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Activate an allocation
   * @param {number} id - Allocation ID
   * @returns {Promise<Object>} API response with activated allocation
   */
  async activateAllocation(id) {
    try {
      const response = await apiClient.post(`${ALLOCATION_ENDPOINTS.ALLOCATIONS}${id}/activate/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Deactivate an allocation
   * @param {number} id - Allocation ID
   * @returns {Promise<Object>} API response with deactivated allocation
   */
  async deactivateAllocation(id) {
    try {
      const response = await apiClient.post(`${ALLOCATION_ENDPOINTS.ALLOCATIONS}${id}/deactivate/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Get available rooms for allocation
   * @param {Object} params - Query parameters (building filter, etc.)
   * @returns {Promise<Object>} API response with available rooms
   */
  async getAvailableRooms(params = {}) {
    try {
      const response = await apiClient.get(`${ALLOCATION_ENDPOINTS.ALLOCATIONS}available_rooms/`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  // ================================
  // ALLOCATION REQUESTS
  // ================================

  /**
   * Get all allocation requests
   * @param {Object} params - Query parameters (filters, search, ordering)
   * @returns {Promise<Object>} API response with requests list
   */
  async getAllocationRequests(params = {}) {
    try {
      const response = await apiClient.get(ALLOCATION_ENDPOINTS.ALLOCATION_REQUESTS, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Get current user's allocation requests
   * @returns {Promise<Object>} API response with user's requests
   */
  async getMyRequests() {
    try {
      const response = await apiClient.get(`${ALLOCATION_ENDPOINTS.ALLOCATION_REQUESTS}my_requests/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Get pending allocation requests
   * @returns {Promise<Object>} API response with pending requests
   */
  async getPendingRequests() {
    try {
      const response = await apiClient.get(`${ALLOCATION_ENDPOINTS.ALLOCATION_REQUESTS}pending/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Get a specific allocation request by ID
   * @param {number} id - Request ID
   * @returns {Promise<Object>} API response with request details
   */
  async getAllocationRequest(id) {
    try {
      const response = await apiClient.get(`${ALLOCATION_ENDPOINTS.ALLOCATION_REQUESTS}${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Create a new allocation request
   * @param {Object} requestData - Request data
   * @returns {Promise<Object>} API response with created request
   */
  async createAllocationRequest(requestData) {
    try {
      const response = await apiClient.post(ALLOCATION_ENDPOINTS.ALLOCATION_REQUESTS, requestData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Update an existing allocation request
   * @param {number} id - Request ID
   * @param {Object} requestData - Updated request data
   * @returns {Promise<Object>} API response with updated request
   */
  async updateAllocationRequest(id, requestData) {
    try {
      const response = await apiClient.patch(`${ALLOCATION_ENDPOINTS.ALLOCATION_REQUESTS}${id}/`, requestData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Delete an allocation request
   * @param {number} id - Request ID
   * @returns {Promise<Object>} API response
   */
  async deleteAllocationRequest(id) {
    try {
      const response = await apiClient.delete(`${ALLOCATION_ENDPOINTS.ALLOCATION_REQUESTS}${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Approve an allocation request
   * @param {number} id - Request ID
   * @param {Object} approvalData - Approval data (optional review notes, room changes, etc.)
   * @returns {Promise<Object>} API response with approved request
   */
  async approveRequest(id, approvalData = {}) {
    try {
      const response = await apiClient.post(`${ALLOCATION_ENDPOINTS.ALLOCATION_REQUESTS}${id}/approve/`, approvalData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Reject an allocation request
   * @param {number} id - Request ID
   * @param {Object} rejectionData - Rejection data (review notes)
   * @returns {Promise<Object>} API response with rejected request
   */
  async rejectRequest(id, rejectionData = {}) {
    try {
      const response = await apiClient.post(`${ALLOCATION_ENDPOINTS.ALLOCATION_REQUESTS}${id}/reject/`, rejectionData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  },

  /**
   * Cancel an allocation request (by the requester)
   * @param {number} id - Request ID
   * @returns {Promise<Object>} API response with cancelled request
   */
  async cancelRequest(id) {
    try {
      const response = await apiClient.post(`${ALLOCATION_ENDPOINTS.ALLOCATION_REQUESTS}${id}/cancel/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...handleApiError(error) };
    }
  }
};

export default allocationService;
