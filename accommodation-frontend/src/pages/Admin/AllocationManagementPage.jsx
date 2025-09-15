import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchAllocations = async () => {
      setTimeout(() => {
        setAllocations([
          {
            id: 1,
            roomNumber: '101',
            building: 'Building A',
            allocationType: 'Pastor',
            allocatedTo: 'Pastor David Smith',
            allocatedBy: 'System Administrator',
            serviceUnit: null,
            startDate: '2025-01-01',
            endDate: '2025-01-31',
            isActive: true,
            status: 'Active',
            allocationDate: '2024-12-15',
            notes: 'Monthly pastoral accommodation',
            capacity: 2,
            occupancy: 1
          },
          {
            id: 2,
            roomNumber: '201',
            building: 'Building B',
            allocationType: 'Member',
            allocatedTo: 'John Doe',
            allocatedBy: 'Service Unit Admin',
            serviceUnit: 'Men\'s Ministry',
            startDate: '2025-01-10',
            endDate: '2025-01-15',
            isActive: true,
            status: 'Active',
            allocationDate: '2025-01-08',
            notes: 'Conference accommodation',
            capacity: 1,
            occupancy: 1
          },
          {
            id: 3,
            roomNumber: '301',
            building: 'Building C',
            allocationType: 'ServiceUnit',
            allocatedTo: null,
            allocatedBy: 'System Administrator',
            serviceUnit: 'Youth Ministry',
            startDate: '2025-01-05',
            endDate: '2025-01-20',
            isActive: true,
            status: 'Active',
            allocationDate: '2025-01-03',
            notes: 'Youth retreat accommodation block',
            capacity: 4,
            occupancy: 3
          },
          {
            id: 4,
            roomNumber: '102',
            building: 'Building A',
            allocationType: 'Member',
            allocatedTo: 'Jane Wilson',
            allocatedBy: 'Service Unit Admin',
            serviceUnit: 'Women\'s Ministry',
            startDate: '2024-12-20',
            endDate: '2025-01-05',
            isActive: false,
            status: 'Completed',
            allocationDate: '2024-12-18',
            notes: 'Holiday retreat',
            capacity: 2,
            occupancy: 0
          },
          {
            id: 5,
            roomNumber: '202',
            building: 'Building B',
            allocationType: 'Pastor',
            allocatedTo: 'Pastor Mary Johnson',
            allocatedBy: 'System Administrator',
            serviceUnit: null,
            startDate: '2025-01-15',
            endDate: '2025-01-25',
            isActive: false,
            status: 'Pending',
            allocationDate: '2025-01-12',
            notes: 'Guest speaker accommodation',
            capacity: 1,
            occupancy: 0
          },
          {
            id: 6,
            roomNumber: '103',
            building: 'Building A',
            allocationType: 'Member',
            allocatedTo: 'Michael Brown',
            allocatedBy: 'Service Unit Admin',
            serviceUnit: 'Choir Ministry',
            startDate: '2024-12-25',
            endDate: '2025-01-01',
            isActive: false,
            status: 'Cancelled',
            allocationDate: '2024-12-20',
            notes: 'Christmas service accommodation - cancelled due to change of plans',
            capacity: 1,
            occupancy: 0
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchAllocations();
  }, []);

  // Filter allocations based on search and filters
  const filteredAllocations = allocations.filter(allocation => {
    const matchesSearch = 
      allocation.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allocation.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (allocation.allocatedTo && allocation.allocatedTo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (allocation.serviceUnit && allocation.serviceUnit.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === '' || allocation.status === statusFilter;
    const matchesType = typeFilter === '' || allocation.allocationType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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

  const handleDeleteAllocation = (allocationId) => {
    if (window.confirm('Are you sure you want to delete this allocation?')) {
      setAllocations(allocations.filter(allocation => allocation.id !== allocationId));
    }
  };

  const handleStatusChange = (allocationId, newStatus) => {
    setAllocations(allocations.map(allocation =>
      allocation.id === allocationId 
        ? { ...allocation, status: newStatus, isActive: newStatus === 'Active' }
        : allocation
    ));
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
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
      case 'ServiceUnit':
        return 'bg-blue-100 text-blue-800';
      case 'Member':
        return 'bg-green-100 text-green-800';
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search allocations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Types</option>
                <option value="Pastor">Pastor</option>
                <option value="ServiceUnit">Service Unit</option>
                <option value="Member">Member</option>
              </select>
            </div>
          </div>
        </div>

        {/* Allocations Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                        <div className="flex-shrink-0 h-10 w-10">
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
                          <div className="text-xs text-gray-500">{allocation.serviceUnit}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        <div>
                          <div>{allocation.startDate}</div>
                          <div className="text-xs text-gray-500">to {allocation.endDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(allocation.status)}`}>
                        {getStatusIcon(allocation.status)}
                        <span className="ml-1">{allocation.status}</span>
                      </span>
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
          
          {filteredAllocations.length === 0 && (
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-800">
                  {allocations.filter(a => a.status === 'Active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-800">
                  {allocations.filter(a => a.status === 'Pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-800">
                  {allocations.filter(a => a.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-800">
                  {allocations.filter(a => a.status === 'Cancelled').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Allocation Modal */}
      {showCreateModal && (
        <AllocationFormModal
          allocation={selectedAllocation}
          onClose={() => setShowCreateModal(false)}
          onSave={(allocationData) => {
            if (selectedAllocation) {
              // Update existing allocation
              setAllocations(allocations.map(allocation => 
                allocation.id === selectedAllocation.id ? { ...allocation, ...allocationData } : allocation
              ));
            } else {
              // Add new allocation
              const newAllocation = {
                id: Math.max(...allocations.map(a => a.id)) + 1,
                ...allocationData,
                allocationDate: new Date().toISOString().split('T')[0],
                status: 'Pending',
                isActive: false,
                occupancy: 0
              };
              setAllocations([...allocations, newAllocation]);
            }
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Allocation Details Modal */}
      {showDetailsModal && selectedAllocation && (
        <AllocationDetailsModal
          allocation={selectedAllocation}
          onClose={() => setShowDetailsModal(false)}
          onStatusChange={handleStatusChange}
        />
      )}
    </AdminLayout>
  );
};

// Allocation Form Modal Component
const AllocationFormModal = ({ allocation, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    roomNumber: allocation?.roomNumber || '',
    building: allocation?.building || '',
    allocationType: allocation?.allocationType || 'Member',
    allocatedTo: allocation?.allocatedTo || '',
    serviceUnit: allocation?.serviceUnit || '',
    startDate: allocation?.startDate || '',
    endDate: allocation?.endDate || '',
    notes: allocation?.notes || '',
    capacity: allocation?.capacity || 1
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.roomNumber) newErrors.roomNumber = 'Room number is required';
    if (!formData.building) newErrors.building = 'Building is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.allocationType === 'Member' && !formData.allocatedTo) {
      newErrors.allocatedTo = 'Member name is required';
    }
    if (formData.allocationType === 'ServiceUnit' && !formData.serviceUnit) {
      newErrors.serviceUnit = 'Service unit is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {allocation ? 'Edit Allocation' : 'Create New Allocation'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            &#x2715;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleInputChange}
                placeholder="e.g., 101"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.roomNumber ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.roomNumber && <p className="text-red-500 text-xs mt-1">{errors.roomNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building *
              </label>
              <select
                name="building"
                value={formData.building}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.building ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Building</option>
                <option value="Building A">Building A</option>
                <option value="Building B">Building B</option>
                <option value="Building C">Building C</option>
                <option value="Building D">Building D</option>
              </select>
              {errors.building && <p className="text-red-500 text-xs mt-1">{errors.building}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allocation Type *
            </label>
            <select
              name="allocationType"
              value={formData.allocationType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="Member">Member</option>
              <option value="Pastor">Pastor</option>
              <option value="ServiceUnit">Service Unit</option>
            </select>
          </div>

          {formData.allocationType === 'Member' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Name *
              </label>
              <input
                type="text"
                name="allocatedTo"
                value={formData.allocatedTo}
                onChange={handleInputChange}
                placeholder="Full name of the member"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.allocatedTo ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.allocatedTo && <p className="text-red-500 text-xs mt-1">{errors.allocatedTo}</p>}
            </div>
          )}

          {formData.allocationType === 'Pastor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pastor Name
              </label>
              <input
                type="text"
                name="allocatedTo"
                value={formData.allocatedTo}
                onChange={handleInputChange}
                placeholder="Full name of the pastor"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}

          {(formData.allocationType === 'ServiceUnit' || formData.allocationType === 'Member') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Unit {formData.allocationType === 'ServiceUnit' ? '*' : ''}
              </label>
              <select
                name="serviceUnit"
                value={formData.serviceUnit}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.serviceUnit ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Service Unit</option>
                <option value="Men's Ministry">Men's Ministry</option>
                <option value="Women's Ministry">Women's Ministry</option>
                <option value="Youth Ministry">Youth Ministry</option>
                <option value="Children's Ministry">Children's Ministry</option>
                <option value="Choir Ministry">Choir Ministry</option>
                <option value="Usher's Ministry">Usher's Ministry</option>
              </select>
              {errors.serviceUnit && <p className="text-red-500 text-xs mt-1">{errors.serviceUnit}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Additional notes or special requirements"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700"
            >
              {allocation ? 'Update' : 'Create'} Allocation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Allocation Details Modal Component
const AllocationDetailsModal = ({ allocation, onClose, onStatusChange }) => {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
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
                <p className="font-medium">Room {allocation.roomNumber} - {allocation.building}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(allocation.status)}`}>
                  {allocation.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Allocation Type</p>
                <p className="font-medium">{allocation.allocationType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Occupancy</p>
                <p className="font-medium">{allocation.occupancy}/{allocation.capacity}</p>
              </div>
            </div>
          </div>

          {/* Allocation Details */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">Allocation Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="font-medium">{allocation.allocationDate}</p>
              </div>
            </div>
          </div>

          {/* Period Information */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">Period</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium">{allocation.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium">{allocation.endDate}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {allocation.notes && (
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3">Notes</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{allocation.notes}</p>
            </div>
          )}

          {/* Status Actions */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">Actions</h4>
            <div className="flex flex-wrap gap-2">
              {allocation.status === 'Pending' && (
                <button
                  onClick={() => onStatusChange(allocation.id, 'Active')}
                  className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
              )}
              {allocation.status === 'Active' && (
                <button
                  onClick={() => onStatusChange(allocation.id, 'Completed')}
                  className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Mark Complete
                </button>
              )}
              {(allocation.status === 'Pending' || allocation.status === 'Active') && (
                <button
                  onClick={() => onStatusChange(allocation.id, 'Cancelled')}
                  className="px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Cancel
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
