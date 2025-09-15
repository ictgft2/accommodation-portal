import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import buildingsService from '../../services/buildingsService';
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

// Helper functions used by multiple components
const getRoomStatusColor = (room) => {
  if (room.needsMaintenance) return 'bg-red-100 text-red-800';
  if (room.isOccupied) return 'bg-blue-100 text-blue-800';
  if (room.isAvailable) return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
};

const getRoomStatus = (room) => {
  if (room.needsMaintenance) return 'Maintenance';
  if (room.isOccupied) return 'Occupied';
  if (room.isAvailable) return 'Available';
  return 'Unavailable';
};

const BuildingManagementPage = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateBuildingModal, setShowCreateBuildingModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showEditBuildingModal, setShowEditBuildingModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [showBuildingDetailsModal, setShowBuildingDetailsModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('buildings');
  const [rooms, setRooms] = useState([]);
  const [buildingStats, setBuildingStats] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch buildings from API
  const fetchBuildings = async (params = {}) => {
    setLoading(true);
    setError('');
    
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
        setError(result.error || 'Failed to fetch buildings');
      }
    } catch (err) {
      setError('Network error occurred while fetching buildings');
      console.error('Buildings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch rooms for a specific building
  const fetchRooms = async (buildingId, params = {}) => {
    try {
      const result = await buildingsService.getRooms(buildingId, params);
      if (result.success) {
        return result.data.results || result.data;
      } else {
        setError(result.error || 'Failed to fetch rooms');
        return [];
      }
    } catch (err) {
      setError('Failed to fetch rooms');
      console.error('Rooms fetch error:', err);
      return [];
    }
  };

  // Initial data load
  useEffect(() => {
    fetchBuildings();
  }, []);

  // Search and filtering effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchBuildings({ page: 1 });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    fetchBuildings();
  }, [pagination.page]);

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
    setSelectedBuilding(building);
    setShowEditBuildingModal(true);
  };

  const handleDeleteBuilding = async (building) => {
    if (window.confirm(`Are you sure you want to delete "${building.name}"? This will also delete all rooms in this building. This action cannot be undone.`)) {
      try {
        const result = await buildingsService.deleteBuilding(building.id);
        if (result.success) {
          setBuildings(prev => prev.filter(b => b.id !== building.id));
        } else {
          setError(result.error || 'Failed to delete building');
        }
      } catch (err) {
        setError('Failed to delete building');
        console.error('Delete building error:', err);
      }
    }
  };

  const handleSaveBuilding = async (buildingData) => {
    try {
      let result;
      
      if (selectedBuilding?.id) {
        // Update existing building
        result = await buildingsService.updateBuilding(selectedBuilding.id, buildingData);
      } else {
        // Create new building
        result = await buildingsService.createBuilding(buildingData);
      }

      if (result.success) {
        setShowCreateBuildingModal(false);
        setShowEditBuildingModal(false);
        setSelectedBuilding(null);
        fetchBuildings(); // Refresh the list
      } else {
        setError(result.error || 'Failed to save building');
      }
    } catch (err) {
      setError('Failed to save building');
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
    setShowEditRoomModal(true);
  };

  const handleDeleteRoom = async (building, room) => {
    if (window.confirm(`Are you sure you want to delete room "${room.room_number}"? This action cannot be undone.`)) {
      try {
        const result = await buildingsService.deleteRoom(building.id, room.id);
        if (result.success) {
          // Refresh buildings to get updated room counts
          fetchBuildings();
        } else {
          setError(result.error || 'Failed to delete room');
        }
      } catch (err) {
        setError('Failed to delete room');
        console.error('Delete room error:', err);
      }
    }
  };

  const handleSaveRoom = async (roomData) => {
    try {
      let result;
      
      if (selectedRoom?.id) {
        // Update existing room
        result = await buildingsService.updateRoom(selectedRoom.id, roomData);
      } else {
        // Create new room
        result = await buildingsService.createRoom(selectedBuilding.id, roomData);
      }

      if (result.success) {
        setShowCreateRoomModal(false);
        setShowEditRoomModal(false);
        setSelectedRoom(null);
        setSelectedBuilding(null);
        
        // Refresh buildings to get updated room counts
        fetchBuildings();
      } else {
        setError(result.error || 'Failed to save room');
      }
    } catch (err) {
      setError('Failed to save room');
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
        setError(result.error || 'Failed to update building status');
      }
    } catch (err) {
      setError('Failed to update building status');
      console.error('Toggle building status error:', err);
    }
  };

  const handleViewBuildingDetails = async (building) => {
    setSelectedBuilding(building);
    setShowBuildingDetailsModal(true);
    
    // Fetch detailed building stats
    try {
      const stats = await buildingsService.getBuildingStats(building.id);
      if (stats.success) {
        setBuildingStats(stats.data);
      }
    } catch (err) {
      console.error('Failed to fetch building stats:', err);
    }
  };

  const handleViewRooms = (building) => {
    setSelectedBuilding(building);
    setShowRoomsModal(true);
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
                    onClick={() => handleDeleteBuilding(building.id)}
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
          building={selectedBuilding}
          onClose={() => setShowCreateBuildingModal(false)}
          onSave={(buildingData) => {
            if (selectedBuilding) {
              // Update existing building
              setBuildings(buildings.map(building => 
                building.id === selectedBuilding.id ? { ...building, ...buildingData } : building
              ));
            } else {
              // Add new building
              const newBuilding = {
                id: Math.max(...buildings.map(b => b.id)) + 1,
                ...buildingData,
                total_rooms: 0,
                available_rooms: 0,
                rooms: [],
                created_date: new Date().toISOString().split('T')[0],
                is_active: true
              };
              setBuildings([...buildings, newBuilding]);
            }
            setShowCreateBuildingModal(false);
          }}
        />
      )}

      {/* Create/Edit Room Modal */}
      {showCreateRoomModal && (
        <RoomFormModal
          building={selectedBuilding}
          room={selectedRoom}
          onClose={() => setShowCreateRoomModal(false)}
          onSave={(roomData) => {
            if (selectedRoom) {
              // Update existing room
              setBuildings(buildings.map(building => 
                building.id === selectedBuilding.id 
                  ? {
                      ...building,
                      rooms: building.rooms.map(room => 
                        room.id === selectedRoom.id ? { ...room, ...roomData } : room
                      )
                    }
                  : building
              ));
            } else {
              // Add new room
              const newRoom = {
                id: Math.max(...selectedBuilding.rooms.map(r => r.id || 0), 0) + 1,
                ...roomData,
                isOccupied: false,
                isAvailable: true,
                needsMaintenance: false
              };
              setBuildings(buildings.map(building => 
                building.id === selectedBuilding.id 
                  ? {
                      ...building,
                      rooms: [...building.rooms, newRoom],
                      total_rooms: building.total_rooms + 1,
                      available_rooms: building.available_rooms + 1
                    }
                  : building
              ));
            }
            setShowCreateRoomModal(false);
          }}
        />
      )}

      {/* Rooms Detail Modal */}
      {showRoomsModal && selectedBuilding && (
        <RoomsDetailModal
          building={selectedBuilding}
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
    roomNumber: room?.roomNumber || '',
    roomType: room?.roomType || 'Standard Room',
    capacity: room?.capacity || 1
  });

  const [errors, setErrors] = useState({});

  const roomTypes = [
    'Standard Room',
    'Pastor Suite',
    'Guest Room',
    'Double Room',
    'Single Room',
    'Dormitory',
    'Conference Room'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.roomNumber) newErrors.roomNumber = 'Room number is required';
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'capacity' ? parseInt(value) || 0 : value 
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
              Room Type *
            </label>
            <select
              name="roomType"
              value={formData.roomType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
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
const RoomsDetailModal = ({ building, onClose, onEditRoom, onDeleteRoom }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {building.name} - Rooms ({building.rooms.length})
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
          {building.rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {building.rooms.map((room) => (
                <div key={room.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">Room {room.roomNumber}</h4>
                      <p className="text-sm text-gray-600">{room.roomType}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoomStatusColor(room)}`}>
                      {getRoomStatus(room)}
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
                      onClick={() => onDeleteRoom(room.id)}
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
