import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  Users,
  Building,
  Bed,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Home,
  Plus,
  ArrowRight,
  Activity,
  Eye,
  BarChart3,
  MapPin,
  UserCheck,
  Settings,
  ChevronRight,
  ClipboardList,
  Bell
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentActivities: [],
    loading: true
  });

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      // This would be replaced with actual API calls
      setTimeout(() => {
        setDashboardData({
          stats: getStatsForRole(user?.role),
          recentActivities: getRecentActivitiesForRole(user?.role),
          loading: false
        });
      }, 1000);
    };

    loadDashboardData();
  }, [user]);

  const getStatsForRole = (role) => {
    switch (role) {
      case 'SuperAdmin':
        return {
          totalUsers: 1247,
          totalBuildings: 15,
          totalRooms: 320,
          occupancyRate: 87,
          pendingRequests: 23,
          monthlyRevenue: 125000,
          activeAllocations: 278,
          maintenanceRequests: 12
        };
      case 'ServiceUnitAdmin':
        return {
          totalMembers: 89,
          allocatedRooms: 67,
          pendingRequests: 8,
          occupancyRate: 75,
          upcomingCheckouts: 5,
          upcomingCheckins: 12
        };
      case 'Pastor':
        return {
          assignedRooms: 25,
          occupiedRooms: 22,
          availableRooms: 3,
          pendingRequests: 4,
          upcomingReservations: 7,
          maintenanceIssues: 2
        };
      case 'Member':
        return {
          currentAllocation: 'Room 201B',
          checkInDate: '2024-09-01',
          checkOutDate: '2024-12-15',
          requestStatus: 'Approved',
          upcomingEvents: 3,
          notifications: 5
        };
      default:
        return {};
    }
  };

  const getRecentActivitiesForRole = (role) => {
    const baseActivities = [
      {
        id: 1,
        type: 'allocation',
        message: 'New room allocation approved',
        time: '2 hours ago',
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-100'
      },
      {
        id: 2,
        type: 'request',
        message: 'Accommodation request submitted',
        time: '4 hours ago',
        icon: Clock,
        color: 'text-blue-600',
        bg: 'bg-blue-100'
      },
      {
        id: 3,
        type: 'maintenance',
        message: 'Maintenance request resolved',
        time: '1 day ago',
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-100'
      },
      {
        id: 4,
        type: 'alert',
        message: 'Room inspection due',
        time: '2 days ago',
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bg: 'bg-yellow-100'
      }
    ];

    return baseActivities.slice(0, role === 'Member' ? 3 : 5);
  };

  // Modern Stat Card Component
  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue", subtitle }) => (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group overflow-hidden">
      {/* Background Gradient */}
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 transform translate-x-8 -translate-y-8 transition-transform group-hover:scale-110 ${
        color === 'blue' ? 'bg-blue-500' : 
        color === 'green' ? 'bg-green-500' : 
        color === 'purple' ? 'bg-purple-500' : 
        color === 'yellow' ? 'bg-yellow-500' : 
        color === 'red' ? 'bg-red-500' : 'bg-gray-500'
      }`}></div>
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center mt-2 text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : 
                 trend === 'down' ? <TrendingDown className="h-4 w-4 mr-1" /> : null}
                {trendValue}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${
            color === 'blue' ? 'bg-blue-100 text-blue-600' : 
            color === 'green' ? 'bg-green-100 text-green-600' : 
            color === 'purple' ? 'bg-purple-100 text-purple-600' : 
            color === 'yellow' ? 'bg-yellow-100 text-yellow-600' : 
            color === 'red' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
          } group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );

  // Modern Activity Item Component
  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon;
    return (
      <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
        <div className={`p-2.5 rounded-xl ${activity.bg}`}>
          <Icon className={`h-5 w-5 ${activity.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{activity.message}</p>
          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    );
  };

  // Quick Action Card Component
  const QuickActionCard = ({ title, description, icon: Icon, onClick, color = "blue" }) => (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${
          color === 'blue' ? 'bg-blue-100 text-blue-600' : 
          color === 'green' ? 'bg-green-100 text-green-600' : 
          color === 'purple' ? 'bg-purple-100 text-purple-600' : 
          'bg-gray-100 text-gray-600'
        } group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
    </button>
  );

  const renderSuperAdminDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full transform -translate-x-8 translate-y-8"></div>
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.name || 'Admin'}!</h2>
          <p className="text-blue-100 text-sm sm:text-base">Here's your accommodation portal overview</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Users"
          value={dashboardData.stats.totalUsers?.toLocaleString()}
          icon={Users}
          trend="up"
          trendValue="+12% from last month"
          color="blue"
        />
        <StatCard
          title="Total Buildings"
          value={dashboardData.stats.totalBuildings}
          icon={Building}
          color="green"
          subtitle="Across all locations"
        />
        <StatCard
          title="Total Rooms"
          value={dashboardData.stats.totalRooms}
          icon={Bed}
          color="purple"
          subtitle="Available for allocation"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${dashboardData.stats.occupancyRate}%`}
          icon={TrendingUp}
          trend="up"
          trendValue="+5% from last month"
          color="green"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Pending Requests"
          value={dashboardData.stats.pendingRequests}
          icon={Clock}
          color="yellow"
          subtitle="Awaiting approval"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₦${dashboardData.stats.monthlyRevenue?.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue="+8% from last month"
          color="green"
        />
        <StatCard
          title="Active Allocations"
          value={dashboardData.stats.activeAllocations}
          icon={CheckCircle}
          color="blue"
          subtitle="Currently occupied"
        />
        <StatCard
          title="Maintenance Requests"
          value={dashboardData.stats.maintenanceRequests}
          icon={AlertTriangle}
          color="red"
          subtitle="Require attention"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <QuickActionCard
          title="Manage Users"
          description="Add, edit, or remove user accounts"
          icon={Users}
          onClick={() => navigate('/admin/users')}
          color="blue"
        />
        <QuickActionCard
          title="Service Units"
          description="Manage service units and assignments"
          icon={UserCheck}
          onClick={() => navigate('/admin/service-units')}
          color="green"
        />
        <QuickActionCard
          title="View Reports"
          description="Generate and view detailed reports"
          icon={BarChart3}
          onClick={() => navigate('/admin/reports')}
          color="purple"
        />
      </div>
    </div>
  );

  const renderServiceUnitAdminDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Service Unit Dashboard</h2>
          <p className="text-green-100 text-sm sm:text-base">Manage your service unit efficiently</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Total Members"
          value={dashboardData.stats.totalMembers}
          icon={Users}
          color="blue"
          subtitle="In your service unit"
        />
        <StatCard
          title="Allocated Rooms"
          value={dashboardData.stats.allocatedRooms}
          icon={Bed}
          color="green"
          subtitle="Currently occupied"
        />
        <StatCard
          title="Pending Requests"
          value={dashboardData.stats.pendingRequests}
          icon={Clock}
          color="yellow"
          subtitle="Awaiting your approval"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Occupancy Rate"
          value={`${dashboardData.stats.occupancyRate}%`}
          icon={TrendingUp}
          color="green"
          subtitle="Current utilization"
        />
        <StatCard
          title="Upcoming Check-outs"
          value={dashboardData.stats.upcomingCheckouts}
          icon={Calendar}
          color="yellow"
          subtitle="Next 7 days"
        />
        <StatCard
          title="Upcoming Check-ins"
          value={dashboardData.stats.upcomingCheckins}
          icon={Calendar}
          color="blue"
          subtitle="Next 7 days"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <QuickActionCard
          title="Manage Members"
          description="View and manage service unit members"
          icon={Users}
          onClick={() => navigate('/service-unit/members')}
          color="blue"
        />
        <QuickActionCard
          title="View Allocations"
          description="Review current room allocations"
          icon={MapPin}
          onClick={() => navigate('/service-unit/allocations')}
          color="green"
        />
        <QuickActionCard
          title="Generate Reports"
          description="Create service unit reports"
          icon={BarChart3}
          onClick={() => navigate('/service-unit/reports')}
          color="purple"
        />
      </div>
    </div>
  );

  const renderPastorDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Pastor Dashboard</h2>
          <p className="text-purple-100 text-sm sm:text-base">Manage your room assignments</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Assigned Rooms"
          value={dashboardData.stats.assignedRooms}
          icon={Bed}
          color="blue"
          subtitle="Under your management"
        />
        <StatCard
          title="Occupied Rooms"
          value={dashboardData.stats.occupiedRooms}
          icon={Home}
          color="green"
          subtitle="Currently in use"
        />
        <StatCard
          title="Available Rooms"
          value={dashboardData.stats.availableRooms}
          icon={Bed}
          color="purple"
          subtitle="Ready for allocation"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Pending Requests"
          value={dashboardData.stats.pendingRequests}
          icon={Clock}
          color="yellow"
          subtitle="Awaiting response"
        />
        <StatCard
          title="Upcoming Reservations"
          value={dashboardData.stats.upcomingReservations}
          icon={Calendar}
          color="blue"
          subtitle="Next 30 days"
        />
        <StatCard
          title="Maintenance Issues"
          value={dashboardData.stats.maintenanceIssues}
          icon={AlertTriangle}
          color="red"
          subtitle="Require attention"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <QuickActionCard
          title="View Allocations"
          description="Review your room allocations"
          icon={MapPin}
          onClick={() => navigate('/pastor/allocations')}
          color="blue"
        />
        <QuickActionCard
          title="Handle Requests"
          description="Process accommodation requests"
          icon={ClipboardList}
          onClick={() => navigate('/pastor/requests')}
          color="green"
        />
      </div>
    </div>
  );

  const renderMemberDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Member Dashboard</h2>
          <p className="text-red-100 text-sm sm:text-base">Your accommodation overview</p>
        </div>
      </div>

      {/* Current Allocation Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Current Allocation</h3>
          <span className="inline-flex px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
            {dashboardData.stats.requestStatus}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-2xl">
            <Home className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">Room</p>
            <p className="text-lg font-bold text-gray-900">{dashboardData.stats.currentAllocation}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-2xl">
            <Calendar className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">Check-in</p>
            <p className="text-lg font-bold text-gray-900">{dashboardData.stats.checkInDate}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-2xl">
            <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">Check-out</p>
            <p className="text-lg font-bold text-gray-900">{dashboardData.stats.checkOutDate}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-2xl">
            <Activity className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className="text-lg font-bold text-gray-900">Active</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <StatCard
          title="Upcoming Events"
          value={dashboardData.stats.upcomingEvents}
          icon={Calendar}
          color="blue"
          subtitle="Church activities"
        />
        <StatCard
          title="Notifications"
          value={dashboardData.stats.notifications}
          icon={Bell}
          color="purple"
          subtitle="Unread messages"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <QuickActionCard
          title="My Allocations"
          description="View your room allocation history"
          icon={MapPin}
          onClick={() => navigate('/member/allocations')}
          color="blue"
        />
        <QuickActionCard
          title="Make Request"
          description="Submit a new accommodation request"
          icon={Plus}
          onClick={() => navigate('/member/request')}
          color="green"
        />
      </div>
    </div>
  );

  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'SuperAdmin':
        return renderSuperAdminDashboard();
      case 'ServiceUnitAdmin':
        return renderServiceUnitAdminDashboard();
      case 'Pastor':
        return renderPastorDashboard();
      case 'Member':
        return renderMemberDashboard();
      default:
        return (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 max-w-md mx-auto">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to your Dashboard</h3>
              <p className="text-gray-600">Your role-specific content will appear here.</p>
            </div>
          </div>
        );
    }
  };

  if (dashboardData.loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Dashboard Content */}
        {renderDashboardContent()}

        {/* Recent Activities */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recent Activities</h3>
                <p className="text-sm text-gray-600 mt-1">Your latest accommodation portal activities</p>
              </div>
              <button className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {dashboardData.recentActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
