import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import allocationService from '../../services/allocationService';
import { 
  Plus, 
  Search, 
  Filter,
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  MapPin,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const AllocationManagementPage = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch allocations from API
  useEffect(() => {
    fetchAllocations();
  }, []);

  // Search and filter effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchAllocations();
    }, 300); // Debounce search

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, statusFilter, typeFilter]);

  const fetchAllocations = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = {
        ...params,
      };

      if (searchTerm) {
        queryParams.search = searchTerm;
      }
      if (statusFilter) {
        queryParams.is_active = statusFilter === 'Active';
      }
      if (typeFilter) {
        queryParams.allocation_type = typeFilter;
      }

      const response = await allocationService.getAllocations(queryParams);
      
      if (response.success) {
        // Transform API data to match frontend expectations
        const transformedAllocations = response.data.map(allocation => ({
          id: allocation.id,
          roomNumber: allocation.room?.name || allocation.room?.number || 'Unknown',
          building: allocation.room?.building?.name || 'Unknown Building',
          allocationType: allocation.allocation_type,
          allocatedTo: allocation.allocated_to_display,
          allocatedBy: allocation.allocated_by?.full_name || allocation.allocated_by?.email || 'Unknown',
          serviceUnit: allocation.service_unit?.name || null,
          startDate: allocation.start_date,
          endDate: allocation.end_date,
          isActive: allocation.is_active,
          status: allocation.is_active ? 'Active' : 'Inactive',
          allocationDate: allocation.allocation_date,
          notes: allocation.notes,
          capacity: allocation.room?.capacity || 1,
          occupancy: 1, // This would need to be calculated from actual occupancy data
          // Keep original data for detailed view
          originalData: allocation
        }));
        
        setAllocations(transformedAllocations);
      } else {
        setError(response.error || 'Failed to fetch allocations');
        console.error('Failed to fetch allocations:', response.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fetching allocations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter allocations based on search and filters (now handled by API)
  const filteredAllocations = allocations;

  const handleCreateAllocation = () => {
    setSelectedAllocation(null);
    setShowCreateModal(true);
  };

  const handleEditAllocation = (allocation) => {
    setSelectedAllocation(allocation);
    setShowCreateModal(true);
  };

  const handleViewDetails = (allocation) => {
    setSelectedAllocation(allocation);
    setShowDetailsModal(true);
  };

  const handleDeleteAllocation = async (allocationId) => {
    if (window.confirm('Are you sure you want to delete this allocation?')) {
      try {
        const response = await allocationService.deleteAllocation(allocationId);
        if (response.success) {
          // Refresh the list
          fetchAllocations();
        } else {
          alert('Failed to delete allocation: ' + response.error);
        }
      } catch (error) {
        console.error('Error deleting allocation:', error);
        alert('An error occurred while deleting the allocation');
      }
    }
  };

  const handleStatusChange = async (allocationId, newStatus) => {
    try {
      const isActivating = newStatus === 'Active';
      const response = isActivating 
        ? await allocationService.activateAllocation(allocationId)
        : await allocationService.deactivateAllocation(allocationId);
      
      if (response.success) {
        // Refresh the list to get updated data
        fetchAllocations();
      } else {
        alert('Failed to change allocation status: ' + response.error);
      }
    } catch (error) {
      console.error('Error changing allocation status:', error);
      alert('An error occurred while changing the allocation status');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'Pastor':
        return 'bg-purple-100 text-purple-800';
      case 'Member':
        return 'bg-blue-100 text-blue-800';
      case 'ServiceUnit':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Allocation Management">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Allocation Management">
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Room Allocations</h2>
            <p className="text-gray-600">Manage room assignments and allocations</p>
          </div>
          
          <button
            onClick={handleCreateAllocation}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Allocation
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search allocations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Types</option>
              <option value="Pastor">Pastor</option>
              <option value="Member">Member</option>
              <option value="ServiceUnit">Service Unit</option>
            </select>
            
            <div className="flex space-x-2">
              <button className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Allocations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupancy
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAllocations.map((allocation) => (
                  <tr key={allocation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            Room {allocation.roomNumber}
                          </div>
                          <div className="text-sm text-gray-500">{allocation.building}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mb-1 ${getTypeBadgeColor(allocation.allocationType)}`}>
                          {allocation.allocationType}
                        </span>
                        <div className="text-sm text-gray-900">
                          {allocation.allocatedTo || allocation.serviceUnit}
                        </div>
                        {allocation.serviceUnit && allocation.allocatedTo && (
                          <div className="text-xs text-gray-500">via {allocation.serviceUnit}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          <span>{allocation.startDate || 'N/A'}</span>
                        </div>
                        {allocation.endDate && (
                          <div className="text-xs text-gray-500 ml-5">to {allocation.endDate}</div>
                        )}
                        <div className="text-xs text-gray-500 ml-5">
                          Allocated: {new Date(allocation.allocationDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`mr-2 ${getStatusBadgeColor(allocation.status).includes('green') ? 'text-green-600' : 
                          getStatusBadgeColor(allocation.status).includes('red') ? 'text-red-600' : 
                          getStatusBadgeColor(allocation.status).includes('yellow') ? 'text-yellow-600' : 'text-gray-600'}`}>
                          {getStatusIcon(allocation.status)}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(allocation.status)}`}>
                          {allocation.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1 text-gray-400" />
                        <span>{allocation.occupancy}/{allocation.capacity}</span>
                        <div className="ml-2 w-12 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(allocation.occupancy / allocation.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(allocation)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditAllocation(allocation)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Allocation"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAllocation(allocation.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Allocation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAllocations.length === 0 && !loading && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No allocations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter || typeFilter
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first allocation."
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateAllocationModal 
          allocation={selectedAllocation}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedAllocation(null);
          }}
          onSave={(allocation) => {
            // Refresh allocations list
            fetchAllocations();
            setShowCreateModal(false);
            setSelectedAllocation(null);
          }}
        />
      )}

      {showDetailsModal && selectedAllocation && (
        <AllocationDetailsModal 
          allocation={selectedAllocation}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAllocation(null);
          }}
          onStatusChange={handleStatusChange}
        />
      )}
    </AdminLayout>
  );
};

// Modal Components (These would need to be implemented with proper forms and API calls)
const CreateAllocationModal = ({ allocation, onClose, onSave }) => {
  // This would contain the form for creating/editing allocations
  // For now, just showing placeholder
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {allocation ? 'Edit Allocation' : 'Create New Allocation'}
          </h3>
          <p className="text-gray-600 mb-4">
            This modal would contain the allocation form. Implementation pending.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave({})}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AllocationDetailsModal = ({ allocation, onClose, onStatusChange }) => {
  // This would contain the detailed view of an allocation
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Allocation Details - Room {allocation.roomNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            &#x2715;
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Room</p>
                <p className="font-medium">Room {allocation.roomNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Building</p>
                <p className="font-medium">{allocation.building}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Allocated To</p>
                <p className="font-medium">{allocation.allocatedTo || 'Service Unit Allocation'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Service Unit</p>
                <p className="font-medium">{allocation.serviceUnit || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Allocated By</p>
                <p className="font-medium">{allocation.allocatedBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Allocation Date</p>
                <p className="font-medium">{new Date(allocation.allocationDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Period Information */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">Period</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium">{allocation.startDate || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium">{allocation.endDate || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {allocation.notes && (
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3">Notes</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{allocation.notes}</p>
            </div>
          )}

          {/* Status Actions */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">Actions</h4>
            <div className="flex flex-wrap gap-2">
              {allocation.status === 'Inactive' && (
                <button
                  onClick={() => onStatusChange(allocation.id, 'Active')}
                  className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Activate
                </button>
              )}
              {allocation.status === 'Active' && (
                <button
                  onClick={() => onStatusChange(allocation.id, 'Inactive')}
                  className="px-3 py-1.5 text-sm text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                >
                  Deactivate
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllocationManagementPage;
