import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Eye,
  Send
} from 'lucide-react';

const MembersListPage = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchMembers = async () => {
      setTimeout(() => {
        setMembers([
          {
            id: 1,
            firstName: 'John',
            lastName: 'Adebayo',
            email: 'john.adebayo@email.com',
            phone: '+234 801 234 5678',
            address: '123 Church Street, Lagos',
            dateJoined: '2024-01-15',
            status: 'Active',
            hasAllocation: true,
            currentRoom: 'Block A - Room 101',
            lastLogin: '2025-01-12',
            role: 'Member'
          },
          {
            id: 2,
            firstName: 'Mary',
            lastName: 'Okafor',
            email: 'mary.okafor@email.com',
            phone: '+234 802 345 6789',
            address: '456 Faith Avenue, Abuja',
            dateJoined: '2024-02-20',
            status: 'Active',
            hasAllocation: false,
            currentRoom: null,
            lastLogin: '2025-01-11',
            role: 'Member'
          },
          {
            id: 3,
            firstName: 'David',
            lastName: 'Ogundipe',
            email: 'david.ogundipe@email.com',
            phone: '+234 803 456 7890',
            address: '789 Grace Road, Port Harcourt',
            dateJoined: '2023-11-10',
            status: 'Inactive',
            hasAllocation: true,
            currentRoom: 'Block B - Room 205',
            lastLogin: '2024-12-15',
            role: 'Member'
          },
          {
            id: 4,
            firstName: 'Sarah',
            lastName: 'Aliyu',
            email: 'sarah.aliyu@email.com',
            phone: '+234 804 567 8901',
            address: '321 Hope Street, Kano',
            dateJoined: '2024-03-05',
            status: 'Active',
            hasAllocation: false,
            currentRoom: null,
            lastLogin: '2025-01-10',
            role: 'Member'
          },
          {
            id: 5,
            firstName: 'Emmanuel',
            lastName: 'Chukwu',
            email: 'emmanuel.chukwu@email.com',
            phone: '+234 805 678 9012',
            address: '654 Love Lane, Enugu',
            dateJoined: '2024-01-30',
            status: 'Active',
            hasAllocation: true,
            currentRoom: 'Block C - Room 301',
            lastLogin: '2025-01-09',
            role: 'Member'
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || member.status.toLowerCase() === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const sortedMembers = filteredMembers.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case 'dateJoined':
        return new Date(b.dateJoined) - new Date(a.dateJoined);
      case 'lastLogin':
        return new Date(b.lastLogin) - new Date(a.lastLogin);
      default:
        return 0;
    }
  });

  const handleAddMember = () => {
    setShowAddModal(true);
  };

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setShowAddModal(true);
  };

  const handleDeleteMember = (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      setMembers(members.filter(m => m.id !== memberId));
    }
  };

  const handleSendMessage = (member) => {
    // Handle sending message to member
    alert(`Sending message to ${member.firstName} ${member.lastName}`);
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'Active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Inactive':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const MemberModal = () => {
    if (!selectedMember) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Member Details</h2>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Member Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h3>
                  <span className={getStatusBadge(selectedMember.status)}>
                    {selectedMember.status}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-800">{selectedMember.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-800">{selectedMember.phone}</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                    <span className="text-gray-800">{selectedMember.address}</span>
                  </div>
                </div>
              </div>

              {/* Membership Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Joined</label>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-800">{selectedMember.dateJoined}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-800">{selectedMember.lastLogin}</span>
                  </div>
                </div>
              </div>

              {/* Current Allocation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Allocation</label>
                {selectedMember.hasAllocation ? (
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <UserCheck className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">{selectedMember.currentRoom}</span>
                  </div>
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <UserX className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-gray-600">No current allocation</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => handleSendMessage(selectedMember)}
                className="flex items-center px-4 py-2 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </button>
              <button
                onClick={() => handleEditMember(selectedMember)}
                className="flex items-center px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Member
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AddMemberModal = () => {
    const [formData, setFormData] = useState({
      firstName: selectedMember?.firstName || '',
      lastName: selectedMember?.lastName || '',
      email: selectedMember?.email || '',
      phone: selectedMember?.phone || '',
      address: selectedMember?.address || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // Handle form submission
      console.log('Form submitted:', formData);
      setShowAddModal(false);
      setSelectedMember(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedMember ? 'Edit Member' : 'Add New Member'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedMember(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedMember(null);
                  }}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {selectedMember ? 'Update Member' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Members">
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
    <AdminLayout title="Members">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="name">Sort by Name</option>
                <option value="dateJoined">Sort by Date Joined</option>
                <option value="lastLogin">Sort by Last Login</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAddMember}
            className="flex items-center px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </button>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {member.firstName} {member.lastName}
                    </h3>
                    <span className={getStatusBadge(member.status)}>
                      {member.status}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Joined {member.dateJoined}</span>
                </div>
              </div>

              {/* Current Allocation */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {member.hasAllocation ? (
                  <div className="flex items-center p-2 bg-green-50 border border-green-200 rounded-lg">
                    <UserCheck className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800 font-medium">{member.currentRoom}</span>
                  </div>
                ) : (
                  <div className="flex items-center p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <UserX className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-600">No allocation</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => handleViewMember(member)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditMember(member)}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedMembers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No members found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by adding your first member.'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={handleAddMember}
                className="flex items-center px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Member
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showMemberModal && <MemberModal />}
      {showAddModal && <AddMemberModal />}
    </AdminLayout>
  );
};

export default MembersListPage;
