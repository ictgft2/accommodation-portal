import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { 
  Send, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

const AllocationRequestPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchRequests = async () => {
      setTimeout(() => {
        setRequests([
          {
            id: 1,
            title: 'Youth Conference Accommodation',
            description: 'Request for accommodation during the annual youth conference scheduled for March 2025. We expect about 150 participants.',
            requestedBy: {
              name: 'John Adebayo',
              role: 'Youth Ministry Coordinator',
              email: 'john.adebayo@email.com'
            },
            dateRequested: '2025-01-10',
            startDate: '2025-03-15',
            endDate: '2025-03-18',
            numberOfRooms: 15,
            numberOfGuests: 150,
            priority: 'High',
            status: 'Pending',
            building: 'Block A',
            rooms: ['Room 101', 'Room 102', 'Room 103'],
            specialRequirements: 'Ground floor rooms preferred for elderly participants',
            budget: 500000,
            approvedBy: null,
            comments: [
              {
                id: 1,
                author: 'Admin',
                text: 'Request received and under review.',
                date: '2025-01-10'
              }
            ]
          },
          {
            id: 2,
            title: 'Women\'s Retreat Weekend',
            description: 'Accommodation needed for the quarterly women\'s retreat. Expected 80 participants.',
            requestedBy: {
              name: 'Mary Okafor',
              role: 'Women\'s Ministry Leader',
              email: 'mary.okafor@email.com'
            },
            dateRequested: '2025-01-08',
            startDate: '2025-02-20',
            endDate: '2025-02-22',
            numberOfRooms: 10,
            numberOfGuests: 80,
            priority: 'Medium',
            status: 'Approved',
            building: 'Block B',
            rooms: ['Room 201', 'Room 202', 'Room 203', 'Room 204', 'Room 205'],
            specialRequirements: 'Quiet environment for meditation sessions',
            budget: 320000,
            approvedBy: 'Pastor David Ogundipe',
            comments: [
              {
                id: 1,
                author: 'Admin',
                text: 'Request approved. Rooms allocated in Block B.',
                date: '2025-01-09'
              }
            ]
          },
          {
            id: 3,
            title: 'Men\'s Fellowship Meeting',
            description: 'Monthly men\'s fellowship meeting accommodation for visiting speakers.',
            requestedBy: {
              name: 'Emmanuel Chukwu',
              role: 'Men\'s Ministry Coordinator',
              email: 'emmanuel.chukwu@email.com'
            },
            dateRequested: '2025-01-05',
            startDate: '2025-01-25',
            endDate: '2025-01-26',
            numberOfRooms: 3,
            numberOfGuests: 25,
            priority: 'Low',
            status: 'Rejected',
            building: null,
            rooms: [],
            specialRequirements: 'None',
            budget: 75000,
            approvedBy: null,
            comments: [
              {
                id: 1,
                author: 'Admin',
                text: 'Request rejected due to insufficient advance notice.',
                date: '2025-01-06'
              }
            ]
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchRequests();
  }, []);

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'Pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Under Review':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadge = (priority) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    switch (priority) {
      case 'High':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Low':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Under Review':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleEditRequest = (request) => {
    setSelectedRequest(request);
    setShowCreateModal(true);
  };

  const handleDeleteRequest = (requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      setRequests(requests.filter(r => r.id !== requestId));
    }
  };

  const CreateRequestModal = () => {
    const [formData, setFormData] = useState({
      title: selectedRequest?.title || '',
      description: selectedRequest?.description || '',
      startDate: selectedRequest?.startDate || '',
      endDate: selectedRequest?.endDate || '',
      numberOfRooms: selectedRequest?.numberOfRooms || '',
      numberOfGuests: selectedRequest?.numberOfGuests || '',
      priority: selectedRequest?.priority || 'Medium',
      specialRequirements: selectedRequest?.specialRequirements || '',
      budget: selectedRequest?.budget || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // Handle form submission
      console.log('Form submitted:', formData);
      setShowCreateModal(false);
      setSelectedRequest(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedRequest ? 'Edit Request' : 'Create Allocation Request'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Rooms *
                  </label>
                  <input
                    type="number"
                    value={formData.numberOfRooms}
                    onChange={(e) => setFormData({...formData, numberOfRooms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    value={formData.numberOfGuests}
                    onChange={(e) => setFormData({...formData, numberOfGuests: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget (₦)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requirements
                </label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
                  rows={2}
                  placeholder="Any special requirements or preferences..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {selectedRequest ? 'Update Request' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const RequestDetailModal = () => {
    if (!selectedRequest) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Request Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Details */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{selectedRequest.title}</h3>
                      <div className="flex items-center space-x-2 mt-2">
                        {getStatusIcon(selectedRequest.status)}
                        <span className={getStatusBadge(selectedRequest.status)}>
                          {selectedRequest.status}
                        </span>
                        <span className={getPriorityBadge(selectedRequest.priority)}>
                          {selectedRequest.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{selectedRequest.description}</p>
                </div>

                {/* Request Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-800">{selectedRequest.startDate}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-800">{selectedRequest.endDate}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rooms</label>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-800">{selectedRequest.numberOfRooms}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-800">{selectedRequest.numberOfGuests}</span>
                    </div>
                  </div>
                </div>

                {/* Special Requirements */}
                {selectedRequest.specialRequirements && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements</label>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedRequest.specialRequirements}</p>
                  </div>
                )}

                {/* Allocated Rooms */}
                {selectedRequest.rooms.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allocated Rooms</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.rooms.map((room, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {selectedRequest.building} - {room}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                  <div className="space-y-3">
                    {selectedRequest.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-gray-800">{comment.author}</span>
                          <span className="text-xs text-gray-500">{comment.date}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Requested By */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-800 mb-3">Requested By</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 font-medium">{selectedRequest.requestedBy.name}</p>
                    <p className="text-sm text-gray-600">{selectedRequest.requestedBy.role}</p>
                    <p className="text-sm text-gray-600">{selectedRequest.requestedBy.email}</p>
                  </div>
                </div>

                {/* Budget */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Budget</h4>
                  <p className="text-lg font-bold text-gray-800">{formatCurrency(selectedRequest.budget)}</p>
                </div>

                {/* Request Timeline */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-800 mb-3">Timeline</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Requested</span>
                      <p className="text-sm text-gray-700">{selectedRequest.dateRequested}</p>
                    </div>
                    {selectedRequest.approvedBy && (
                      <div>
                        <span className="text-xs text-gray-500">Approved By</span>
                        <p className="text-sm text-gray-700">{selectedRequest.approvedBy}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleEditRequest(selectedRequest)}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Request
                  </button>
                  
                  {selectedRequest.status === 'Pending' && (
                    <button
                      onClick={() => handleDeleteRequest(selectedRequest.id)}
                      className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Request
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Allocation Requests">
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Allocation Requests">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Allocation Requests</h1>
            <p className="text-gray-600">Manage room allocation requests from your service unit</p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(request.status)}
                    <h3 className="text-lg font-semibold text-gray-800">{request.title}</h3>
                    <span className={getStatusBadge(request.status)}>
                      {request.status}
                    </span>
                    <span className={getPriorityBadge(request.priority)}>
                      {request.priority}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{request.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">{request.startDate} - {request.endDate}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">{request.numberOfRooms} rooms</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">{request.numberOfGuests} guests</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-700">{formatCurrency(request.budget)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Requested by <span className="font-medium">{request.requestedBy.name}</span> on {request.dateRequested}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewRequest(request)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditRequest(request)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {requests.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Send className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No allocation requests</h3>
            <p className="text-gray-600 mb-4">
              You haven't made any allocation requests yet. Create your first request to get started.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Request
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && <CreateRequestModal />}
      {showDetailModal && <RequestDetailModal />}
    </AdminLayout>
  );
};

export default AllocationRequestPage;
