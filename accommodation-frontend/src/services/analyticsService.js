import apiClient from './apiClient';

const analyticsService = {
  // Dashboard Overview
  async getDashboardOverview() {
    try {
      const response = await apiClient.get('/analytics/dashboard_overview/');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  },

  // Activity Chart Data
  async getActivityChartData(chartType = 'daily', days = 30) {
    try {
      const response = await apiClient.get('/analytics/activity_chart_data/', {
        params: { chart_type: chartType, days }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  },

  // Events List with Filtering
  async getEventsList(filters = {}) {
    try {
      const params = {
        page: filters.page || 1,
        page_size: filters.pageSize || 50,
        ...filters
      };
      
      const response = await apiClient.get('/analytics/events_list/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching events list:', error);
      throw error;
    }
  },

  // User Activity Summary
  async getUserActivity(days = 30) {
    try {
      const response = await apiClient.get('/analytics/user_activity/', {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  },

  // Export Formats
  async getExportFormats() {
    try {
      const response = await apiClient.get('/analytics/export_formats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching export formats:', error);
      throw error;
    }
  },

  // Create Export Report
  async createExportReport(reportData) {
    try {
      // Convert camelCase to snake_case for Django API
      const apiData = {
        report_type: reportData.reportType,
        export_format: reportData.exportFormat,
        date_from: reportData.dateFrom || null,
        date_to: reportData.dateTo || null,
        filters: reportData.filters || {}
      };
      
      const response = await apiClient.post('/analytics/export_report/', apiData);
      return response.data;
    } catch (error) {
      console.error('Error creating export report:', error);
      throw error;
    }
  },

  // Get My Exports
  async getMyExports() {
    try {
      const response = await apiClient.get('/analytics/my_exports/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my exports:', error);
      throw error;
    }
  },

  // Get All Events (with pagination)
  async getAllEvents(page = 1, pageSize = 50, filters = {}) {
    try {
      const params = {
        page,
        page_size: pageSize,
        ...filters
      };
      
      const response = await apiClient.get('/events/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all events:', error);
      throw error;
    }
  },

  // Get Dashboard Metrics
  async getDashboardMetrics(days = 30) {
    try {
      const response = await apiClient.get('/metrics/', {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  },

  // Helper function to format chart data for Chart.js
  formatChartData(data, options = {}) {
    const defaultOptions = {
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      ...options
    };

    return {
      labels: data.labels || [],
      datasets: data.datasets ? data.datasets.map(dataset => ({
        ...defaultOptions,
        ...dataset
      })) : []
    };
  },

  // Helper function to export data as CSV
  exportAsCSV(data, filename = 'export.csv') {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  // Helper function to convert data to CSV format
  convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  },

  // Get event type choices for filters
  getEventTypeChoices() {
    return [
      { value: 'login', label: 'User Login' },
      { value: 'logout', label: 'User Logout' },
      { value: 'password_change', label: 'Password Change' },
      { value: 'profile_update', label: 'Profile Update' },
      { value: 'allocation_create', label: 'Allocation Created' },
      { value: 'allocation_update', label: 'Allocation Updated' },
      { value: 'allocation_delete', label: 'Allocation Deleted' },
      { value: 'allocation_request', label: 'Allocation Requested' },
      { value: 'allocation_approve', label: 'Allocation Approved' },
      { value: 'allocation_reject', label: 'Allocation Rejected' },
      { value: 'building_create', label: 'Building Created' },
      { value: 'building_update', label: 'Building Updated' },
      { value: 'building_delete', label: 'Building Deleted' },
      { value: 'room_create', label: 'Room Created' },
      { value: 'room_update', label: 'Room Updated' },
      { value: 'room_delete', label: 'Room Deleted' },
      { value: 'user_create', label: 'User Created' },
      { value: 'user_update', label: 'User Updated' },
      { value: 'user_delete', label: 'User Deleted' },
      { value: 'user_activate', label: 'User Activated' },
      { value: 'user_deactivate', label: 'User Deactivated' },
      { value: 'service_unit_create', label: 'Service Unit Created' },
      { value: 'service_unit_update', label: 'Service Unit Updated' },
      { value: 'service_unit_delete', label: 'Service Unit Deleted' },
      { value: 'report_generate', label: 'Report Generated' },
      { value: 'report_export', label: 'Report Exported' },
      { value: 'report_view', label: 'Report Viewed' },
      { value: 'system_backup', label: 'System Backup' },
      { value: 'system_maintenance', label: 'System Maintenance' },
      { value: 'data_import', label: 'Data Import' },
      { value: 'data_export', label: 'Data Export' }
    ];
  },

  // Get resource type choices for filters
  getResourceTypeChoices() {
    return [
      { value: 'allocation', label: 'Allocation' },
      { value: 'allocation_request', label: 'Allocation Request' },
      { value: 'building', label: 'Building' },
      { value: 'room', label: 'Room' },
      { value: 'user', label: 'User' },
      { value: 'service_unit', label: 'Service Unit' },
      { value: 'report', label: 'Report' }
    ];
  },

  // Format date for API calls
  formatDate(date) {
    if (!date) return null;
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  },

  // Get chart colors for different data series
  getChartColors(count = 1) {
    const colors = [
      'rgba(59, 130, 246, 0.6)',   // Blue
      'rgba(34, 197, 94, 0.6)',    // Green
      'rgba(239, 68, 68, 0.6)',    // Red
      'rgba(245, 158, 11, 0.6)',   // Orange
      'rgba(147, 51, 234, 0.6)',   // Purple
      'rgba(236, 72, 153, 0.6)',   // Pink
      'rgba(14, 165, 233, 0.6)',   // Light Blue
      'rgba(168, 85, 247, 0.6)',   // Violet
      'rgba(251, 191, 36, 0.6)',   // Yellow
      'rgba(16, 185, 129, 0.6)',   // Emerald
    ];
    
    return colors.slice(0, count);
  },

  // Get border colors (solid versions of chart colors)
  getBorderColors(count = 1) {
    const colors = [
      'rgba(59, 130, 246, 1)',     // Blue
      'rgba(34, 197, 94, 1)',      // Green
      'rgba(239, 68, 68, 1)',      // Red
      'rgba(245, 158, 11, 1)',     // Orange
      'rgba(147, 51, 234, 1)',     // Purple
      'rgba(236, 72, 153, 1)',     // Pink
      'rgba(14, 165, 233, 1)',     // Light Blue
      'rgba(168, 85, 247, 1)',     // Violet
      'rgba(251, 191, 36, 1)',     // Yellow
      'rgba(16, 185, 129, 1)',     // Emerald
    ];
    
    return colors.slice(0, count);
  }
};

export default analyticsService;
