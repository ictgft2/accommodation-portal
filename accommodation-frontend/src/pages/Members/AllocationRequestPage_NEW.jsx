import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import allocationService from '../../services/allocationService';
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
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch requests from API
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await allocationService.getAllocationRequests();
      
      if (response.success) {
        // Transform API data to match frontend expectations
        const transformedRequests = response.data.map(request => ({
          id: request.id,
          title: `Request #${request.id}`, // Generate title if not provided
          description: request.request_reason,
          requestedBy: {
            name: request.requested_by?.full_name || request.requested_by?.email || 'Unknown',
            role: request.requested_by?.role || 'Member',
            email: request.requested_by?.email || ''
          },
          dateRequested: request.created_at,
          startDate: request.requested_start_date,
          endDate: request.requested_end_date,
          numberOfRooms: 1, // This would need to be added to the model
          numberOfGuests: 1, // This would need to be added to the model
          priority: 'Medium', // This would need to be added to the model
          status: request.status,
          building: request.preferred_building?.name || null,
          rooms: request.created_allocation ? [request.created_allocation.room?.name] : [],
          specialRequirements: 'None', // This would need to be added to the model
          budget: 0, // This would need to be added to the model
          approvedBy: request.reviewed_by?.full_name || null,
          comments: request.review_notes ? [
            {
              id: 1,
              author: request.reviewed_by?.full_name || 'Admin',
              text: request.review_notes,
              date: request.reviewed_at
            }
          ] : [],
          // Keep original data for detailed operations
          originalData: request
        }));
        
        setRequests(transformedRequests);
      } else {
        setError(response.error || 'Failed to fetch requests');
        console.error('Failed to fetch requests:', response.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = () => {
    setSelectedRequest(null);
    setShowCreateModal(true);
  };

  const handleEditRequest = (request) => {
    setSelectedRequest(request);
    setShowCreateModal(true);
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        const response = await allocationService.deleteAllocationRequest(requestId);
        if (response.success) {
          // Refresh the list
          fetchRequests();
        } else {
          alert('Failed to delete request: ' + response.error);
        }
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('An error occurred while deleting the request');
      }
    }
  };

  const handleApproveRequest = async (requestId, approvalData = {}) => {
    try {
      const response = await allocationService.approveRequest(requestId, approvalData);
      if (response.success) {
        // Refresh the list
        fetchRequests();
        setShowDetailModal(false);
      } else {
        alert('Failed to approve request: ' + response.error);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('An error occurred while approving the request');
    }
  };

  const handleRejectRequest = async (requestId, rejectionData = {}) => {
    try {
      const response = await allocationService.rejectRequest(requestId, rejectionData);
      if (response.success) {
        // Refresh the list
        fetchRequests();
        setShowDetailModal(false);
      } else {
        alert('Failed to reject request: ' + response.error);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('An error occurred while rejecting the request');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      const response = await allocationService.cancelRequest(requestId);
      if (response.success) {
        // Refresh the list
        fetchRequests();
      } else {
        alert('Failed to cancel request: ' + response.error);
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('An error occurred while cancelling the request');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-blue-100 text-blue-800';
      case 'Low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const CreateRequestModal = () => {
    const [formData, setFormData] = useState({
      requestReason: selectedRequest?.description || '',
      preferredRoomId: selectedRequest?.originalData?.preferred_room?.id || '',
      preferredBuildingId: selectedRequest?.originalData?.preferred_building?.id || '',
      requestedStartDate: selectedRequest?.startDate || '',
      requestedEndDate: selectedRequest?.endDate || ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const requestData = {
          request_reason: formData.requestReason,
          preferred_room_id: formData.preferredRoomId || null,
          preferred_building_id: formData.preferredBuildingId || null,
          requested_start_date: formData.requestedStartDate || null,
          requested_end_date: formData.requestedEndDate || null
        };

        let response;
        if (selectedRequest) {
          response = await allocationService.updateAllocationRequest(selectedRequest.id, requestData);
        } else {
          response = await allocationService.createAllocationRequest(requestData);
        }

        if (response.success) {
          fetchRequests();
          setShowCreateModal(false);
          setSelectedRequest(null);
        } else {
          alert('Failed to save request: ' + response.error);
        }
      } catch (error) {
        console.error('Error saving request:', error);
        alert('An error occurred while saving the request');
      }
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
                &#x2715;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request Reason *
                </label>
                <textarea
                  value={formData.requestReason}
                  onChange={(e) => setFormData({...formData, requestReason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.requestedStartDate}
                    onChange={(e) => setFormData({...formData, requestedStartDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.requestedEndDate}
                    onChange={(e) => setFormData({...formData, requestedEndDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  {selectedRequest ? 'Update' : 'Create'} Request
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

    const canApprove = user?.role === 'SuperAdmin' || user?.role === 'ServiceUnitAdmin';
    const canEdit = selectedRequest.status === 'Pending' && selectedRequest.requestedBy.email === user?.email;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">{selectedRequest.title}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &#x2715;
              </button>
            </div>

            <div className="space-y-6">
              {/* Request Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Request Details</h3>
                <p className="text-gray-700 mb-4">{selectedRequest.description}</p>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-800">{selectedRequest.startDate || 'Not specified'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-800">{selectedRequest.endDate || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Status</h3>
                <div className="flex items-center space-x-3 mb-4">
                  {getStatusIcon(selectedRequest.status)}
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>

                {canApprove && selectedRequest.status === 'Pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApproveRequest(selectedRequest.id)}
                      className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2 inline" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(selectedRequest.id, { review_notes: 'Request rejected' })}
                      className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2 inline" />
                      Reject
                    </button>
                  </div>
                )}

                {canEdit && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleEditRequest(selectedRequest);
                      }}
                      className="px-4 py-2 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
                    >
                      <Edit className="w-4 h-4 mr-2 inline" />
                      Edit Request
                    </button>
                    
                    <button
                      onClick={() => handleCancelRequest(selectedRequest.id)}
                      className="px-4 py-2 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2 inline" />
                      Cancel Request
                    </button>
                  </div>
                )}
              </div>

              {/* Comments */}
              {selectedRequest.comments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Comments</h3>
                  <div className="space-y-3">
                    {selectedRequest.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-gray-800">{comment.author}</span>
                          <span className="text-xs text-gray-500">{new Date(comment.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
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
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Allocation Requests</h1>
            <p className="text-gray-600">Manage room allocation requests from your service unit</p>
          </div>
          
          <button
            onClick={handleCreateRequest}
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{request.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        {request.startDate || 'No date'} {request.endDate && `- ${request.endDate}`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-700">Requested: {new Date(request.dateRequested).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Requested by <span className="font-medium">{request.requestedBy.name}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewRequest(request)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {request.status === 'Pending' && request.requestedBy.email === user?.email && (
                          <>
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
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {requests.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Send className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No allocation requests</h3>
            <p className="text-gray-600 mb-4">
              You haven't made any allocation requests yet. Create your first request to get started.
            </p>
            <button
              onClick={handleCreateRequest}
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
