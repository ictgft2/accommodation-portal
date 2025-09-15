import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import serviceUnitsService from '../../services/serviceUnitsService';
import userService from '../../services/userService';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users,
  Building,
  UserCheck,
  Settings,
  Eye,
  BarChart3,
  AlertCircle,
  Loader2,
  X,
  User,
  Activity
} from 'lucide-react';

const ServiceUnitManagementPage = () => {
  const [serviceUnits, setServiceUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedServiceUnit, setSelectedServiceUnit] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    admin: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [availableAdmins, setAvailableAdmins] = useState([]);

  // Fetch service units from API
  const fetchServiceUnits = async (params = {}) => {
    setLoading(true);
    setError('');
    
    try {
      const queryParams = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: searchTerm,
        ...filters,
        ...params
      };

      const result = await serviceUnitsService.getServiceUnits(queryParams);
      
      if (result.success) {
        setServiceUnits(result.data.results || result.data);
        
        // Handle pagination if present
        if (result.data.count !== undefined) {
          setPagination(prev => ({
            ...prev,
            total: result.data.count,
            totalPages: Math.ceil(result.data.count / pagination.pageSize)
          }));
        }
      } else {
        setError(result.error || 'Failed to fetch service units');
      }
    } catch (err) {
      setError('Network error occurred while fetching service units');
      console.error('Service units fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available admins for assignment
  const fetchAvailableAdmins = async () => {
    try {
      console.log('Fetching available admins...');
      const result = await serviceUnitsService.getAvailableAdmins();
      console.log('Available admins result:', result);
      if (result.success) {
        const admins = result.data.results || result.data;
        console.log('Available admins data:', admins);
        setAvailableAdmins(admins);
      } else {
        console.error('Failed to fetch admins:', result.error);
      }
    } catch (err) {
      console.error('Available admins fetch error:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchServiceUnits();
    fetchAvailableAdmins();
  }, []);
  // Search and filtering effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchServiceUnits({ page: 1 });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    fetchServiceUnits();
  }, [pagination.page, filters]);

  // Filter service units based on search (client-side for immediate feedback)
  const filteredServiceUnits = serviceUnits.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (unit.admin_name && unit.admin_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // API action handlers
  const handleCreateServiceUnit = () => {
    setSelectedServiceUnit(null);
    setShowCreateModal(true);
  };

  const handleEditServiceUnit = (serviceUnit) => {
    setSelectedServiceUnit(serviceUnit);
    setShowEditModal(true);
  };

  const handleViewDetails = async (serviceUnit) => {
    try {
      // Fetch detailed service unit data including members
      const result = await serviceUnitsService.getServiceUnit(serviceUnit.id);
      if (result.success) {
        setSelectedServiceUnit(result.data);
        setShowDetailsModal(true);
      } else {
        setError(result.error || 'Failed to fetch service unit details');
      }
    } catch (err) {
      setError('Failed to load service unit details');
      console.error('Service unit details error:', err);
    }
  };

  const handleDeleteServiceUnit = async (serviceUnit) => {
    if (window.confirm(`Are you sure you want to delete "${serviceUnit.name}"? This action cannot be undone.`)) {
      try {
        const result = await serviceUnitsService.deleteServiceUnit(serviceUnit.id);
        if (result.success) {
          setServiceUnits(prev => prev.filter(unit => unit.id !== serviceUnit.id));
          // Show success message (you might want to add a toast notification)
        } else {
          setError(result.error || 'Failed to delete service unit');
        }
      } catch (err) {
        setError('Failed to delete service unit');
        console.error('Delete service unit error:', err);
      }
    }
  };

  const handleSaveServiceUnit = async (serviceUnitData) => {
    try {
      // Log the data being sent for debugging
      console.log('Sending service unit data:', serviceUnitData);
      
      let result;
      
      if (selectedServiceUnit?.id) {
        // Update existing service unit
        result = await serviceUnitsService.updateServiceUnit(selectedServiceUnit.id, serviceUnitData);
      } else {
        // Create new service unit
        result = await serviceUnitsService.createServiceUnit(serviceUnitData);
      }

      console.log('API result:', result);

      if (result.success) {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedServiceUnit(null);
        fetchServiceUnits(); // Refresh the list
        // Show success message
      } else {
        setError(result.error || 'Failed to save service unit');
        console.error('API Error:', result);
      }
    } catch (err) {
      setError('Failed to save service unit');
      console.error('Save service unit error:', err);
    }
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <AdminLayout title="Service Unit Management">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Service Unit Management">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Service Units</h2>
              <p className="text-gray-600 text-sm sm:text-base">Manage church service units and their administrators efficiently</p>
            </div>
            
            <button
              onClick={handleCreateServiceUnit}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg shadow-red-500/25 font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Service Unit
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
              <div className="ml-3 flex-1">
                <h3 className="text-sm sm:text-base font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-600 p-1"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search service units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="sm:w-48">
              <select
                value={filters.admin}
                onChange={(e) => setFilters(prev => ({ ...prev, admin: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              >
                <option value="">All Administrators</option>
                {availableAdmins?.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.first_name} {admin.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Service Units Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="flex space-x-4">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredServiceUnits.map((unit) => (
              <div key={unit.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden">
                <div className="p-6 sm:p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-red-600 transition-colors">
                        {unit.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{unit.description}</p>
                    </div>
                    <span className="inline-flex px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full ml-2 flex-shrink-0">
                      Active
                    </span>
                  </div>

                  {/* Admin Info */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-1">
                      <strong className="text-gray-900">Administrator:</strong>
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {unit.admin_name || 'Not assigned'}
                    </p>
                    {unit.admin_email && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{unit.admin_email}</p>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{unit.member_count || 0}</p>
                      <p className="text-xs text-gray-600">Members</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <Building className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{unit.allocated_rooms_count || 0}</p>
                      <p className="text-xs text-gray-600">Rooms</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <UserCheck className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{new Date(unit.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-600">Created</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleViewDetails(unit)}
                      className="flex-1 flex items-center justify-center px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    <button
                      onClick={() => handleEditServiceUnit(unit)}
                      className="flex-1 flex items-center justify-center px-3 py-2.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-xl hover:bg-blue-200 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteServiceUnit(unit.id)}
                      className="p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                      title="Delete Service Unit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredServiceUnits.length === 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 py-16">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No service units found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? "Try adjusting your search criteria or filters."
                  : "Get started by creating your first service unit."
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateServiceUnit}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg shadow-red-500/25 font-medium"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Service Unit
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg">
                  {pagination.page}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Service Unit Modal */}
      {(showCreateModal || showEditModal) && (
        <ServiceUnitFormModal
          serviceUnit={selectedServiceUnit}
          availableAdmins={availableAdmins}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedServiceUnit(null);
          }}
          onSave={handleSaveServiceUnit}
        />
      )}

      {/* Service Unit Details Modal */}
      {showDetailsModal && selectedServiceUnit && (
        <ServiceUnitDetailsModal
          serviceUnit={selectedServiceUnit}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </AdminLayout>
  );
};

// Service Unit Form Modal Component
const ServiceUnitFormModal = ({ serviceUnit, availableAdmins, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: serviceUnit?.name || '',
    description: serviceUnit?.description || '',
    admin: serviceUnit?.admin || ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const submissionData = {
        name: formData.name.trim(),
        description: formData.description.trim()
      };
      
      // Only include admin if one is selected
      if (formData.admin && formData.admin !== '') {
        submissionData.admin = parseInt(formData.admin, 10);
      }
      
      console.log('Form submitting data:', submissionData);
      await onSave(submissionData);
    } catch (err) {
      console.error('Form save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              {serviceUnit ? 'Edit Service Unit' : 'Add New Service Unit'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {serviceUnit ? 'Update service unit information' : 'Create a new service unit for your organization'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <span className="sr-only">Close</span>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Service Unit Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Youth Ministry, Children's Church"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.name}
            </p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Brief description of the service unit's purpose, activities, and responsibilities"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.description}
            </p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Administrator (Optional)
            </label>
            <select
              name="admin"
              value={formData.admin}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option value="">Select an administrator</option>
              {availableAdmins?.map(admin => (
                <option key={admin.id} value={admin.id}>
                  {admin.first_name} {admin.last_name} ({admin.email}) - {admin.role}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-3 rounded-lg">
              <Settings className="w-4 h-4 inline mr-1" />
              Only SuperAdmin and ServiceUnitAdmin users can be assigned as administrators
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {serviceUnit ? 'Update' : 'Create'} Service Unit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Service Unit Details Modal Component
const ServiceUnitDetailsModal = ({ serviceUnit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 truncate pr-4">
              {serviceUnit.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Service unit details and statistics</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
          >
            <span className="sr-only">Close</span>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Basic Information */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-gray-600" />
              Basic Information
            </h4>
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Name</p>
                  <p className="text-base font-semibold text-gray-900 break-words">{serviceUnit.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    serviceUnit.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {serviceUnit.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                  <p className="text-base text-gray-900 leading-relaxed break-words bg-white p-4 rounded-xl border border-gray-200">
                    {serviceUnit.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Administrator Information */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-600" />
              Administrator
            </h4>
            <div className="bg-blue-50 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Name</p>
                  <p className="text-base font-semibold text-gray-900 break-words">
                    {serviceUnit.admin || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Email</p>
                  <p className="text-base font-medium text-gray-900 break-words">
                    {serviceUnit.adminEmail || 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-gray-600" />
              Statistics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-2xl">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {serviceUnit.memberCount || 0}
                </p>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-2xl">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Building className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {serviceUnit.allocatedRooms || 0}
                </p>
                <p className="text-sm font-medium text-gray-600">Allocated Rooms</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-2xl">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {serviceUnit.availableRooms || 0}
                </p>
                <p className="text-sm font-medium text-gray-600">Available Rooms</p>
              </div>
            </div>
          </div>

          {/* Activity Information */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-gray-600" />
              Activity Information
            </h4>
            <div className="bg-yellow-50 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-yellow-600 mb-1">Created Date</p>
                  <p className="text-base font-semibold text-gray-900">
                    {serviceUnit.createdDate || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-600 mb-1">Last Activity</p>
                  <p className="text-base font-semibold text-gray-900">
                    {serviceUnit.lastActivity || 'No recent activity'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 sm:p-8 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceUnitManagementPage;
