/**
 * Dashboard API Service
 * Handles all dashboard-related API calls including statistics and activities
 */

import apiClient, { handleApiError } from './apiClient';

export const dashboardService = {
  /**
   * Get dashboard statistics based on user role
   * @returns {Promise<Object>} Role-based statistics
   */
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/dashboard/stats/');
      return {
        success: true,
        data: response.data.data,
        role: response.data.role,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Get recent activities for dashboard
   * @returns {Promise<Object>} Recent activities list
   */
  async getDashboardActivities() {
    try {
      const response = await apiClient.get('/dashboard/activities/');
      return {
        success: true,
        data: response.data.data,
        role: response.data.role,
        count: response.data.count,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Get combined dashboard data (stats + activities + user info) in one call
   * @returns {Promise<Object>} Complete dashboard data
   */
  async getDashboardSummary() {
    try {
      const response = await apiClient.get('/dashboard/summary/');
      return {
        success: true,
        data: response.data.data,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  /**
   * Refresh dashboard data - alias for getDashboardSummary
   * @returns {Promise<Object>} Complete dashboard data
   */
  async refreshDashboard() {
    return this.getDashboardSummary();
  }
};
