/**
 * Buildings and Rooms API Service
 * Handles all building and room management API calls including CRUD operations,
 * capacity tracking, availability management, and room picture handling
 */

import apiClient, { handleApiError } from './apiClient';

export const buildingsService = {
  /**
   * Get all buildings with optional filtering and pagination
   * @param {Object} params - { page, pageSize, search, createdBy, sortBy, sortOrder }
   * @returns {Promise<Object>} Buildings list with pagination info
   */
  async getBuildings(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('page_size', params.pageSize);
      if (params.search) queryParams.append('search', params.search);
      if (params.createdBy) queryParams.append('created_by', params.createdBy);
      if (params.sortBy) queryParams.append('ordering', params.sortOrder === 'desc' ? `-${params.sortBy}` : params.sortBy);

      const response = await apiClient.get(`/buildings/?${queryParams.toString()}`);
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
   * Get a specific building by ID
   * @param {number} id - Building ID
   * @returns {Promise<Object>} Building details
   */
  async getBuilding(id) {
    try {
      const response = await apiClient.get(`/buildings/${id}/`);
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
   * Create a new building
   * @param {Object} buildingData - { name, location, description }
   * @returns {Promise<Object>} Created building
   */
  async createBuilding(buildingData) {
    try {
      const response = await apiClient.post('/buildings/', buildingData);
      return {
        success: true,
        data: response.data,
        message: 'Building created successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Update an existing building
   * @param {number} id - Building ID
   * @param {Object} buildingData - Updated building data
   * @returns {Promise<Object>} Updated building
   */
  async updateBuilding(id, buildingData) {
    try {
      const response = await apiClient.put(`/buildings/${id}/`, buildingData);
      return {
        success: true,
        data: response.data,
        message: 'Building updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Partially update a building
   * @param {number} id - Building ID
   * @param {Object} updateData - Partial update data
   * @returns {Promise<Object>} Updated building
   */
  async patchBuilding(id, updateData) {
    try {
      const response = await apiClient.patch(`/buildings/${id}/`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Building updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Delete a building
   * @param {number} id - Building ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteBuilding(id) {
    try {
      await apiClient.delete(`/buildings/${id}/`);
      return {
        success: true,
        message: 'Building deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // ===== ROOMS MANAGEMENT =====

  /**
   * Get all rooms in a specific building
   * @param {number} buildingId - Building ID
   * @param {Object} params - { page, pageSize, search, isAllocated, capacity, sortBy, sortOrder }
   * @returns {Promise<Object>} Rooms list with pagination info
   */
  async getRooms(buildingId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('page_size', params.pageSize);
      if (params.search) queryParams.append('search', params.search);
      if (params.isAllocated !== undefined) queryParams.append('is_allocated', params.isAllocated);
      if (params.capacity) queryParams.append('capacity', params.capacity);
      if (params.hasToilet !== undefined) queryParams.append('has_toilet', params.hasToilet);
      if (params.hasWashroom !== undefined) queryParams.append('has_washroom', params.hasWashroom);
      if (params.sortBy) queryParams.append('ordering', params.sortOrder === 'desc' ? `-${params.sortBy}` : params.sortBy);

      const response = await apiClient.get(`/buildings/${buildingId}/rooms/?${queryParams.toString()}`);
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
   * Get all rooms across all buildings with filtering
   * @param {Object} params - { page, pageSize, search, building, isAllocated, capacity, sortBy, sortOrder }
   * @returns {Promise<Object>} All rooms list with pagination info
   */
  async getAllRooms(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('page_size', params.pageSize);
      if (params.search) queryParams.append('search', params.search);
      if (params.building) queryParams.append('building', params.building);
      if (params.isAllocated !== undefined) queryParams.append('is_allocated', params.isAllocated);
      if (params.capacity) queryParams.append('capacity', params.capacity);
      if (params.hasToilet !== undefined) queryParams.append('has_toilet', params.hasToilet);
      if (params.hasWashroom !== undefined) queryParams.append('has_washroom', params.hasWashroom);
      if (params.sortBy) queryParams.append('ordering', params.sortOrder === 'desc' ? `-${params.sortBy}` : params.sortBy);

      const response = await apiClient.get(`/rooms/?${queryParams.toString()}`);
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
   * Get a specific room by ID
   * @param {number} buildingId - Building ID
   * @param {number} roomId - Room ID
   * @returns {Promise<Object>} Room details
   */
  async getRoom(buildingId, roomId) {
    try {
      const response = await apiClient.get(`/buildings/${buildingId}/rooms/${roomId}/`);
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
   * Create a new room in a building
   * @param {number} buildingId - Building ID
   * @param {Object} roomData - { room_number, capacity, has_toilet, has_washroom }
   * @returns {Promise<Object>} Created room
   */
  async createRoom(buildingId, roomData) {
    try {
      const response = await apiClient.post(`/buildings/${buildingId}/rooms/`, {
        ...roomData,
        building: buildingId
      });
      return {
        success: true,
        data: response.data,
        message: 'Room created successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Update an existing room
   * @param {number} buildingId - Building ID
   * @param {number} roomId - Room ID
   * @param {Object} roomData - Updated room data
   * @returns {Promise<Object>} Updated room
   */
  async updateRoom(buildingId, roomId, roomData) {
    try {
      const response = await apiClient.put(`/buildings/${buildingId}/rooms/${roomId}/`, roomData);
      return {
        success: true,
        data: response.data,
        message: 'Room updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Partially update a room
   * @param {number} buildingId - Building ID
   * @param {number} roomId - Room ID
   * @param {Object} updateData - Partial update data
   * @returns {Promise<Object>} Updated room
   */
  async patchRoom(buildingId, roomId, updateData) {
    try {
      const response = await apiClient.patch(`/buildings/${buildingId}/rooms/${roomId}/`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Room updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Delete a room
   * @param {number} buildingId - Building ID
   * @param {number} roomId - Room ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteRoom(buildingId, roomId) {
    try {
      await apiClient.delete(`/buildings/${buildingId}/rooms/${roomId}/`);
      return {
        success: true,
        message: 'Room deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Bulk create rooms in a building
   * @param {number} buildingId - Building ID
   * @param {Array} roomsList - Array of room data objects
   * @returns {Promise<Object>} Bulk creation result
   */
  async bulkCreateRooms(buildingId, roomsList) {
    try {
      const response = await apiClient.post(`/buildings/${buildingId}/rooms/bulk/`, {
        rooms: roomsList.map(room => ({ ...room, building: buildingId }))
      });
      return {
        success: true,
        data: response.data,
        message: `${roomsList.length} rooms created successfully`
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Bulk update room allocation status
   * @param {Array} roomIds - Array of room IDs
   * @param {boolean} isAllocated - New allocation status
   * @returns {Promise<Object>} Bulk update result
   */
  async bulkUpdateRoomAllocation(roomIds, isAllocated) {
    try {
      const response = await apiClient.post('/rooms/bulk-allocation/', {
        room_ids: roomIds,
        is_allocated: isAllocated
      });
      return {
        success: true,
        data: response.data,
        message: `${roomIds.length} rooms updated successfully`
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // ===== ROOM PICTURES MANAGEMENT =====

  /**
   * Upload pictures for a room
   * @param {number} buildingId - Building ID
   * @param {number} roomId - Room ID
   * @param {FormData} formData - Form data with image files
   * @returns {Promise<Object>} Upload result
   */
  async uploadRoomPictures(buildingId, roomId, formData) {
    try {
      const response = await apiClient.post(`/buildings/${buildingId}/rooms/${roomId}/pictures/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        data: response.data,
        message: 'Pictures uploaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Delete a room picture
   * @param {number} buildingId - Building ID
   * @param {number} roomId - Room ID
   * @param {number} pictureId - Picture ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteRoomPicture(buildingId, roomId, pictureId) {
    try {
      await apiClient.delete(`/buildings/${buildingId}/rooms/${roomId}/pictures/${pictureId}/`);
      return {
        success: true,
        message: 'Picture deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Set primary picture for a room
   * @param {number} buildingId - Building ID
   * @param {number} roomId - Room ID
   * @param {number} pictureId - Picture ID to set as primary
   * @returns {Promise<Object>} Update result
   */
  async setPrimaryRoomPicture(buildingId, roomId, pictureId) {
    try {
      const response = await apiClient.patch(`/buildings/${buildingId}/rooms/${roomId}/pictures/${pictureId}/`, {
        is_primary: true
      });
      return {
        success: true,
        data: response.data,
        message: 'Primary picture updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // ===== STATISTICS AND REPORTS =====

  /**
   * Get buildings summary/overview
   * @returns {Promise<Object>} Buildings summary with totals and stats
   */
  async getBuildingsSummary() {
    try {
      const response = await apiClient.get('/buildings/summary/');
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
   * Get building statistics
   * @param {number} id - Building ID
   * @returns {Promise<Object>} Building statistics
   */
  async getBuildingStats(id) {
    try {
      const response = await apiClient.get(`/buildings/${id}/stats/`);
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
   * Get room availability report
   * @param {Object} params - { building_id, date_from, date_to }
   * @returns {Promise<Object>} Room availability data
   */
  async getRoomAvailabilityReport(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.buildingId) queryParams.append('building_id', params.buildingId);
      if (params.dateFrom) queryParams.append('date_from', params.dateFrom);
      if (params.dateTo) queryParams.append('date_to', params.dateTo);

      const response = await apiClient.get(`/rooms/availability-report/?${queryParams.toString()}`);
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
   * Get capacity utilization report
   * @param {Object} params - { building_id, time_period }
   * @returns {Promise<Object>} Capacity utilization data
   */
  async getCapacityUtilizationReport(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.buildingId) queryParams.append('building_id', params.buildingId);
      if (params.timePeriod) queryParams.append('time_period', params.timePeriod);

      const response = await apiClient.get(`/buildings/capacity-report/?${queryParams.toString()}`);
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

export default buildingsService;
