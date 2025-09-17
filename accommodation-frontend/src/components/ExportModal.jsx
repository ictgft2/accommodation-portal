import React, { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import { useToast } from '../contexts/ToastContext';

const ExportModal = ({ onClose, onExport }) => {
  const [formData, setFormData] = useState({
    reportType: 'user_activity',
    exportFormat: 'pdf',
    dateFrom: '',
    dateTo: '',
    filters: {}
  });
  const [exportFormats, setExportFormats] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showError } = useToast();

  useEffect(() => {
    loadExportFormats();
    
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    setFormData(prev => ({
      ...prev,
      dateTo: today.toISOString().split('T')[0],
      dateFrom: thirtyDaysAgo.toISOString().split('T')[0]
    }));
  }, []);

  const loadExportFormats = async () => {
    try {
      const formats = await analyticsService.getExportFormats();
      setExportFormats(formats);
    } catch (error) {
      console.error('Error loading export formats:', error);
      showError('Failed to load export formats');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onExport(formData);
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      showError('Failed to create export');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const reportTypes = [
    { value: 'user_activity', label: 'User Activity Report', description: 'Detailed user actions and behaviors' },
    { value: 'allocation_summary', label: 'Allocation Summary', description: 'Room allocation statistics and trends' },
    { value: 'building_utilization', label: 'Building Utilization', description: 'Building and room usage analytics' },
    { value: 'event_log', label: 'Event Log', description: 'System events and activity logs' },
    { value: 'dashboard_metrics', label: 'Dashboard Metrics', description: 'Key performance indicators and metrics' },
    { value: 'service_unit_performance', label: 'Service Unit Performance', description: 'Service unit activity and statistics' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Export Report</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Report Type
              </label>
              <div className="grid grid-cols-1 gap-3">
                {reportTypes.map((type) => (
                  <label key={type.value} className="relative flex cursor-pointer">
                    <input
                      type="radio"
                      name="reportType"
                      value={type.value}
                      checked={formData.reportType === type.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                      formData.reportType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{type.label}</h4>
                          <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                        </div>
                        {formData.reportType === type.value && (
                          <i className="fas fa-check-circle text-blue-500"></i>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                {exportFormats.map((format) => (
                  <label key={format.value} className="relative flex cursor-pointer">
                    <input
                      type="radio"
                      name="exportFormat"
                      value={format.value}
                      checked={formData.exportFormat === format.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                      formData.exportFormat === format.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <i className={`${format.icon} text-lg mr-3 text-gray-600`}></i>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{format.label}</h4>
                            <p className="text-xs text-gray-500">{format.description}</p>
                          </div>
                        </div>
                        {formData.exportFormat === format.value && (
                          <i className="fas fa-check-circle text-blue-500"></i>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  name="dateFrom"
                  value={formData.dateFrom}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  name="dateTo"
                  value={formData.dateTo}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Additional Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Filters (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Event Types
                  </label>
                  <select
                    multiple
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData(prev => ({
                        ...prev,
                        filters: { ...prev.filters, eventTypes: values }
                      }));
                    }}
                  >
                    {analyticsService.getEventTypeChoices().slice(0, 10).map(choice => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Resource Types
                  </label>
                  <select
                    multiple
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData(prev => ({
                        ...prev,
                        filters: { ...prev.filters, resourceTypes: values }
                      }));
                    }}
                  >
                    {analyticsService.getResourceTypeChoices().map(choice => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
              </div>
            </div>

            {/* Preview Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Export Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Report:</strong> {reportTypes.find(t => t.value === formData.reportType)?.label}</p>
                <p><strong>Format:</strong> {exportFormats.find(f => f.value === formData.exportFormat)?.label}</p>
                <p><strong>Date Range:</strong> {formData.dateFrom} to {formData.dateTo}</p>
                {formData.filters.eventTypes && formData.filters.eventTypes.length > 0 && (
                  <p><strong>Event Types:</strong> {formData.filters.eventTypes.length} selected</p>
                )}
                {formData.filters.resourceTypes && formData.filters.resourceTypes.length > 0 && (
                  <p><strong>Resource Types:</strong> {formData.filters.resourceTypes.length} selected</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading && <i className="fas fa-spinner fa-spin mr-2"></i>}
                {loading ? 'Creating Export...' : 'Create Export'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
