import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { 
  Users, 
  Building, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuildings: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    totalServiceUnits: 0,
    activeAllocations: 0,
    pendingRequests: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Simulate API call
      setTimeout(() => {
        setStats({
          totalUsers: 156,
          totalBuildings: 4,
          totalRooms: 48,
          occupiedRooms: 32,
          totalServiceUnits: 12,
          activeAllocations: 35,
          pendingRequests: 8,
          recentActivity: [
            { id: 1, type: 'allocation', message: 'Room 201 allocated to John Doe', time: '2 hours ago' },
            { id: 2, type: 'request', message: 'New allocation request from Women\'s Ministry', time: '4 hours ago' },
            { id: 3, type: 'user', message: 'New user registration: Jane Smith', time: '6 hours ago' },
            { id: 4, type: 'building', message: 'Building B maintenance completed', time: '1 day ago' },
          ]
        });
        setLoading(false);
      }, 1000);
    };

    fetchDashboardData();
  }, []);

  const getRoleDashboard = () => {
    switch (user?.role) {
      case 'SuperAdmin':
        return <SuperAdminDashboard stats={stats} loading={loading} />;
      case 'ServiceUnitAdmin':
        return <ServiceUnitAdminDashboard stats={stats} loading={loading} />;
      case 'Pastor':
        return <PastorDashboard stats={stats} loading={loading} />;
      case 'Member':
        return <MemberDashboard stats={stats} loading={loading} />;
      default:
        return <DefaultDashboard stats={stats} loading={loading} />;
    }
  };

  return (
    <AdminLayout title="Dashboard">
      {getRoleDashboard()}
    </AdminLayout>
  );
};

// Super Admin Dashboard
const SuperAdminDashboard = ({ stats, loading }) => {
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
          change="+12%"
        />
        <StatCard
          title="Buildings"
          value={stats.totalBuildings}
          icon={Building}
          color="green"
          change="+0%"
        />
        <StatCard
          title="Occupied Rooms"
          value={`${stats.occupiedRooms}/${stats.totalRooms}`}
          icon={MapPin}
          color="purple"
          change="+8%"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={Clock}
          color="yellow"
          change="-3%"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Room Occupancy</h3>
          <div className="space-y-4">
            {['Building A', 'Building B', 'Building C', 'Building D'].map((building, index) => {
              const occupancy = [85, 67, 92, 45][index];
              return (
                <div key={building}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{building}</span>
                    <span>{occupancy}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${occupancy}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Units Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Units Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Men\'s Ministry', 'Women\'s Ministry', 'Youth Ministry', 'Children\'s Ministry', 'Usher\'s Ministry', 'Choir Ministry'].map((unit, index) => (
            <div key={unit} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800">{unit}</h4>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">Members: {[24, 18, 35, 12, 16, 22][index]}</p>
                <p className="text-sm text-gray-600">Allocated Rooms: {[3, 2, 4, 1, 2, 3][index]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Service Unit Admin Dashboard
const ServiceUnitAdminDashboard = ({ stats, loading }) => {
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Members"
          value={24}
          icon={Users}
          color="blue"
          change="+2"
        />
        <StatCard
          title="Allocated Rooms"
          value={3}
          icon={MapPin}
          color="green"
          change="+1"
        />
        <StatCard
          title="Active Allocations"
          value={8}
          icon={CheckCircle}
          color="purple"
          change="0"
        />
        <StatCard
          title="Pending Requests"
          value={2}
          icon={Clock}
          color="yellow"
          change="+1"
        />
      </div>

      {/* Service Unit Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Members List</h3>
          <div className="space-y-3">
            {['John Doe', 'Jane Smith', 'David Johnson', 'Mary Williams', 'Robert Brown'].map((member, index) => (
              <div key={member} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-800">{member}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  index < 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {index < 3 ? 'Allocated' : 'Unallocated'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {[
              'New member added: Sarah Wilson',
              'Room 201 allocated to John Doe',
              'Allocation request submitted for Women\'s event',
              'Member removed: Tom Anderson'
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity}</p>
                  <p className="text-xs text-gray-500">{index + 1} hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Pastor Dashboard
const PastorDashboard = ({ stats, loading }) => {
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="My Current Room"
          value="Room 101"
          icon={MapPin}
          color="blue"
        />
        <StatCard
          title="Active Period"
          value="30 days"
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Request Status"
          value="Approved"
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* Current Allocation Details */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Allocation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Room Details</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Room Number: 101</p>
              <p>Building: Building A</p>
              <p>Room Type: Pastor Suite</p>
              <p>Capacity: 2 persons</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Allocation Period</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Start Date: January 1, 2025</p>
              <p>End Date: January 31, 2025</p>
              <p>Duration: 30 days</p>
              <p>Status: Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Calendar className="w-6 h-6 text-red-600 mb-2" />
            <h4 className="font-medium text-gray-800">Request Extension</h4>
            <p className="text-sm text-gray-600">Extend current allocation</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <MapPin className="w-6 h-6 text-red-600 mb-2" />
            <h4 className="font-medium text-gray-800">New Request</h4>
            <p className="text-sm text-gray-600">Request a different room</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <AlertCircle className="w-6 h-6 text-red-600 mb-2" />
            <h4 className="font-medium text-gray-800">Report Issue</h4>
            <p className="text-sm text-gray-600">Report room maintenance issue</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// Member Dashboard
const MemberDashboard = ({ stats, loading }) => {
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">My Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Service Unit</h4>
            <p className="text-gray-600">Men's Ministry</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Allocation Status</h4>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
              <Clock className="w-4 h-4 mr-1" />
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* Available Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <MapPin className="w-6 h-6 text-red-600 mb-2" />
            <h4 className="font-medium text-gray-800">Request Allocation</h4>
            <p className="text-sm text-gray-600">Submit a room allocation request</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <BarChart3 className="w-6 h-6 text-red-600 mb-2" />
            <h4 className="font-medium text-gray-800">View History</h4>
            <p className="text-sm text-gray-600">Check allocation history</p>
          </button>
        </div>
      </div>

      {/* Request History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Request History</h3>
        <div className="space-y-4">
          {[
            { date: '2025-01-10', room: 'Room 203', status: 'Pending', type: 'New Request' },
            { date: '2024-12-15', room: 'Room 105', status: 'Approved', type: 'Conference' },
            { date: '2024-11-20', room: 'Room 201', status: 'Completed', type: 'Retreat' }
          ].map((request, index) => (
            <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">{request.type} - {request.room}</p>
                <p className="text-xs text-gray-500">{request.date}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {request.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Default Dashboard for unrecognized roles
const DefaultDashboard = ({ stats, loading }) => {
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="text-center py-12">
      <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Dashboard Unavailable</h2>
      <p className="text-gray-600">Your role doesn't have access to a dashboard.</p>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, change }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {change && (
            <p className={`text-sm ${
              change.startsWith('+') ? 'text-green-600' : 
              change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change} from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton
const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
