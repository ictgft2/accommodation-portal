import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { buildingsService } from '../../services/buildingsService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building,
  MapPin,
  Eye,
  Bed,
  Users,
  CheckCircle,
  AlertCircle,
  Home,
  Loader2
} from 'lucide-react';

const BuildingManagementPage = () => {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateBuildingModal, setShowCreateBuildingModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showEditBuildingModal, setShowEditBuildingModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [buildingRooms, setBuildingRooms] = useState([]); // For rooms in selected building
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch buildings from API
  const fetchBuildings = useCallback(async (params = {}) => {
    setLoading(true);
    
    try {
      const queryParams = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: searchTerm,
        sortBy: 'name',
        sortOrder: 'asc',
        ...params
      };

      const result = await buildingsService.getBuildings(queryParams);
      
      if (result.success) {
        setBuildings(result.data.results || result.data);
        
        // Handle pagination if present
        if (result.data.count !== undefined) {
          setPagination(prev => ({
            ...prev,
            total: result.data.count,
            totalPages: Math.ceil(result.data.count / pagination.pageSize)
          }));
        }
      } else {
        showError(result.error || 'Failed to fetch buildings');
      }
    } catch (err) {
      const errorMsg = 'Network error occurred while fetching buildings';
      showError(errorMsg);
      console.error('Buildings fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchTerm, showError]);

  // Initial data load
  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  // Search and filtering effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchBuildings({ page: 1 });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchBuildings]);

  useEffect(() => {
    fetchBuildings();
  }, [pagination.page, fetchBuildings]);

  // Filter buildings based on search (client-side for immediate feedback)
  const filteredBuildings = buildings.filter(building =>
    building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (building.location && building.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // API action handlers
  const handleCreateBuilding = () => {
    setSelectedBuilding(null);
    setShowCreateBuildingModal(true);
  };

  const handleEditBuilding = (building) => {
    console.log('🔧 Opening edit modal for building:', building);
    setSelectedBuilding(building);
    setShowEditBuildingModal(true);
  };

  const handleDeleteBuilding = async (building) => {
    if (window.confirm(`Are you sure you want to delete "${building.name}"? This will also delete all rooms in this building. This action cannot be undone.`)) {
      try {
        const result = await buildingsService.deleteBuilding(building.id);
        if (result.success) {
          showSuccess(`Building "${building.name}" deleted successfully`);
          setBuildings(prev => prev.filter(b => b.id !== building.id));
        } else {
          showError(result.error || 'Failed to delete building');
        }
      } catch (err) {
        showError('Network error occurred while deleting building');
        console.error('Delete building error:', err);
      }
    }
  };

  const handleSaveBuilding = async (buildingData) => {
    console.log('🏗️ Saving building:', buildingData);
    console.log('👤 Current user:', user);
    
    try {
      let result;
      
      if (selectedBuilding?.id) {
        // Update existing building - don't send created_by field
        const updateData = {
          name: buildingData.name,
          location: buildingData.location,
          description: buildingData.description
        };
        
        console.log('📝 Updating building:', selectedBuilding.id, 'with data:', updateData);
        result = await buildingsService.updateBuilding(selectedBuilding.id, updateData);
        
        if (result.success) {
          showSuccess('Building updated successfully');
          setShowEditBuildingModal(false);
          setSelectedBuilding(null);
          fetchBuildings(); // Refresh the list
        } else {
          console.error('❌ Update failed:', result);
          showError(result.error || 'Failed to update building');
        }
      } else {
        // Create new building - backend will auto-set created_by
        const createData = {
          name: buildingData.name,
          location: buildingData.location,
          description: buildingData.description
        };
        
        console.log('🆕 Creating building with data:', createData);
        result = await buildingsService.createBuilding(createData);
        console.log('✅ Create result:', result);
        
        if (result.success) {
          showSuccess('Building created successfully');
          setShowCreateBuildingModal(false);
          setSelectedBuilding(null);
          fetchBuildings(); // Refresh the list
        } else {
          console.error('❌ Create failed:', result);
          showError(result.error || 'Failed to create building');
        }
      }
    } catch (err) {
      console.error('💥 Network error:', err);
      showError('Network error occurred while saving building');
      console.error('Save building error:', err);
    }
  };

  const handleCreateRoom = (building) => {
    setSelectedBuilding(building);
    setSelectedRoom(null);
    setShowCreateRoomModal(true);
  };

  const handleEditRoom = (building, room) => {
    setSelectedBuilding(building);
    setSelectedRoom(room);
    setShowCreateRoomModal(true); // Use create modal for edit as well
  };

  const handleDeleteRoom = async (building, room) => {
    if (window.confirm(`Are you sure you want to delete room "${room.room_number}"? This action cannot be undone.`)) {
      try {
        const result = await buildingsService.deleteRoom(building.id, room.id);
        if (result.success) {
          showSuccess(`Room ${room.room_number} deleted successfully`);
          // Refresh rooms in the modal and buildings list
          await handleViewRooms(building); // Refresh the rooms modal
          fetchBuildings(); // Refresh buildings to get updated room counts
        } else {
          showError(result.error || 'Failed to delete room');
        }
      } catch (err) {
        showError('Network error occurred while deleting room');
        console.error('Delete room error:', err);
      }
    }
  };

  const handleSaveRoom = async (roomData) => {
    try {
      let result;
      
      if (selectedRoom?.id) {
        // Update existing room
        result = await buildingsService.updateRoom(selectedBuilding.id, selectedRoom.id, roomData);
      } else {
        // Create new room
        result = await buildingsService.createRoom(selectedBuilding.id, roomData);
      }

      if (result.success) {
        setShowCreateRoomModal(false);
        setSelectedRoom(null);
        setSelectedBuilding(null);
        
        // Refresh buildings to get updated room counts
        fetchBuildings();
        
        // If we're in the rooms modal, refresh the rooms list
        if (showRoomsModal) {
          try {
            const roomsResult = await buildingsService.getRooms(selectedBuilding.id);
            if (roomsResult.success) {
              setBuildingRooms(roomsResult.data.results || []);
            }
          } catch (err) {
            console.error('Failed to refresh rooms:', err);
          }
        }
        
        showSuccess(selectedRoom ? 'Room updated successfully' : 'Room created successfully');
      } else {
        showError(result.error || 'Failed to save room');
      }
    } catch (err) {
      showError('Failed to save room');
      console.error('Save room error:', err);
    }
  };

  const handleToggleBuildingStatus = async (building) => {
    try {
      const updatedData = { is_active: !building.is_active };
      const result = await buildingsService.updateBuilding(building.id, updatedData);
      
      if (result.success) {
        setBuildings(prev => prev.map(b => 
          b.id === building.id ? { ...b, is_active: !b.is_active } : b
        ));
      } else {
        showError(result.error || 'Failed to update building status');
      }
    } catch (err) {
      showError('Failed to update building status');
      console.error('Toggle building status error:', err);
    }
  };

  const handleViewBuildingDetails = async (building) => {
    setSelectedBuilding(building);
    setShowRoomsModal(true);
    
    // Load rooms for this building
    setRoomsLoading(true);
    try {
      const result = await buildingsService.getRooms(building.id);
      if (result.success) {
        setBuildingRooms(result.data.results || []);
      } else {
        showError('Failed to load rooms');
      }
    } catch (err) {
      showError('Failed to load rooms');
      console.error('Load rooms error:', err);
    } finally {
      setRoomsLoading(false);
    }
  };

  const handleViewRooms = async (building) => {
    setSelectedBuilding(building);
    setRoomsLoading(true);
    setBuildingRooms([]);
    setShowRoomsModal(true);
    
    try {
      const result = await buildingsService.getRooms(building.id);
      
      if (result.success) {
        setBuildingRooms(result.data.results || result.data || []);
        showSuccess(`Loaded ${(result.data.results || result.data || []).length} rooms for ${building.name}`);
      } else {
        showError(result.error || 'Failed to fetch rooms');
        setBuildingRooms([]);
      }
    } catch (err) {
      showError('Network error occurred while fetching rooms');
      setBuildingRooms([]);
      console.error('Rooms fetch error:', err);
    } finally {
      setRoomsLoading(false);
    }
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <AdminLayout title="Building & Room Management">
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
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
    <AdminLayout title="Building & Room Management">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Buildings & Rooms</h2>
            <p className="text-gray-600">Manage accommodation buildings and room allocations</p>
          </div>
          
          <button
            onClick={handleCreateBuilding}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Building
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search buildings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        {/* Buildings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBuildings.map((building) => (
            <div key={building.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Building className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-800">{building.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{building.description}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {building.location}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(building.is_active)}`}>
                    {building.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Room Statistics */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Home className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-gray-800">{building.total_rooms || 0}</p>
                    <p className="text-xs text-gray-600">Total</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-gray-800">{(building.total_rooms || 0) - (building.available_rooms || 0)}</p>
                    <p className="text-xs text-gray-600">Occupied</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-gray-800">{building.available_rooms || 0}</p>
                    <p className="text-xs text-gray-600">Available</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-gray-800">0</p>
                    <p className="text-xs text-gray-600">Maintenance</p>
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Occupancy Rate</span>
                    <span>{building.total_rooms > 0 ? Math.round(((building.total_rooms - building.available_rooms) / building.total_rooms) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${building.total_rooms > 0 ? ((building.total_rooms - building.available_rooms) / building.total_rooms) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewRooms(building)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Rooms
                  </button>
                  <button
                    onClick={() => handleCreateRoom(building)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Room
                  </button>
                  <button
                    onClick={() => handleEditBuilding(building)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit Building"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBuilding(building)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete Building"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBuildings.length === 0 && (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No buildings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? "Try adjusting your search criteria."
                : "Get started by adding your first building."
              }
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Building Modal */}
      {showCreateBuildingModal && (
        <BuildingFormModal
          building={null}
          onClose={() => setShowCreateBuildingModal(false)}
          onSave={handleSaveBuilding}
        />
      )}

      {/* Edit Building Modal */}
      {showEditBuildingModal && selectedBuilding && (
        <BuildingFormModal
          building={selectedBuilding}
          onClose={() => setShowEditBuildingModal(false)}
          onSave={handleSaveBuilding}
        />
      )}

      {/* Create/Edit Room Modal */}
      {showCreateRoomModal && (
        <RoomFormModal
          building={selectedBuilding}
          room={selectedRoom}
          onClose={() => {
            setShowCreateRoomModal(false);
            setSelectedRoom(null);
          }}
          onSave={handleSaveRoom}
        />
      )}

      {/* Rooms Detail Modal */}
      {showRoomsModal && selectedBuilding && (
        <RoomsDetailModal
          building={selectedBuilding}
          rooms={buildingRooms}
          loading={roomsLoading}
          onClose={() => setShowRoomsModal(false)}
          onEditRoom={handleEditRoom}
          onDeleteRoom={handleDeleteRoom}
        />
      )}
    </AdminLayout>
  );
};

// Building Form Modal Component
const BuildingFormModal = ({ building, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: building?.name || '',
    description: building?.description || '',
    location: building?.location || ''
  });

  const [errors, setErrors] = useState({});

  // Update form data when building prop changes
  useEffect(() => {
    console.log('🏢 Building data received in modal:', building);
    setFormData({
      name: building?.name || '',
      description: building?.description || '',
      location: building?.location || ''
    });
    setErrors({}); // Clear any previous errors
  }, [building]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.location) newErrors.location = 'Location is required';

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {building ? 'Edit Building' : 'Add New Building'}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Building A"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Brief description of the building's purpose"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Central Campus"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.location ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
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
              {building ? 'Update' : 'Create'} Building
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Room Form Modal Component
const RoomFormModal = ({ building, room, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    room_number: room?.room_number || '',
    capacity: room?.capacity || 1,
    has_toilet: room?.has_toilet || false,
    has_washroom: room?.has_washroom || false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (room) {
      setFormData({
        room_number: room.room_number || '',
        capacity: room.capacity || 1,
        has_toilet: room.has_toilet || false,
        has_washroom: room.has_washroom || false
      });
    }
  }, [room]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.room_number) newErrors.room_number = 'Room number is required';
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (name === 'capacity' ? parseInt(value) || 0 : value)
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {room ? 'Edit Room' : 'Add New Room'} - {building.name}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Number *
            </label>
            <input
              type="text"
              name="room_number"
              value={formData.room_number}
              onChange={handleInputChange}
              placeholder="e.g., 101"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.room_number ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.room_number && <p className="text-red-500 text-xs mt-1">{errors.room_number}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity *
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              min="1"
              max="20"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.capacity ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="has_toilet"
                checked={formData.has_toilet}
                onChange={handleInputChange}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Has Private Toilet
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="has_washroom"
                checked={formData.has_washroom}
                onChange={handleInputChange}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Has Private Washroom
              </label>
            </div>
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
              {room ? 'Update' : 'Create'} Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Rooms Detail Modal Component
const RoomsDetailModal = ({ building, rooms = [], loading = false, onClose, onEditRoom, onDeleteRoom }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {building.name} - Rooms ({loading ? 'Loading...' : rooms.length})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            &#x2715;
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading rooms...</span>
            </div>
          ) : rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <div key={room.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">Room {room.room_number}</h4>
                      <p className="text-sm text-gray-600">
                        {room.has_toilet && room.has_washroom ? 'En-suite' : 
                         room.has_toilet ? 'Private Toilet' : 
                         room.has_washroom ? 'Private Washroom' : 'Basic Room'}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      room.is_allocated ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {room.is_allocated ? 'Occupied' : 'Available'}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Bed className="w-4 h-4 mr-1" />
                    <span>Capacity: {room.capacity}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditRoom(building, room)}
                      className="flex-1 px-3 py-1.5 text-xs text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteRoom(building, room)}
                      className="px-3 py-1.5 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bed className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No rooms found</h3>
              <p className="mt-1 text-sm text-gray-500">
                This building doesn't have any rooms yet.
              </p>
            </div>
          )}
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

export default BuildingManagementPage;
