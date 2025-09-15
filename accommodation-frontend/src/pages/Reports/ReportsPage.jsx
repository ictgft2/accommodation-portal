import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  PieChart,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const ReportsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    serviceUnit: 'all',
    building: 'all',
    status: 'all'
  });

  const [reportData, setReportData] = useState({
    overview: {
      totalBookings: 156,
      activeAllocations: 48,
      totalUsers: 234,
      occupancyRate: 75,
      trends: {
        bookings: 12,
        allocations: -3,
        users: 8,
        occupancy: 5
      }
    },
    bookings: {
      total: 156,
      completed: 89,
      pending: 32,
      cancelled: 35,
      byMonth: [
        { month: 'Jan', bookings: 12, completed: 8, cancelled: 2 },
        { month: 'Feb', bookings: 15, completed: 12, cancelled: 1 },
        { month: 'Mar', bookings: 18, completed: 14, cancelled: 3 },
        { month: 'Apr', bookings: 22, completed: 18, cancelled: 2 },
        { month: 'May', bookings: 25, completed: 20, cancelled: 4 },
        { month: 'Jun', bookings: 28, completed: 23, cancelled: 3 }
      ],
      byServiceUnit: [
        { name: 'Men\'s Ministry', bookings: 45, percentage: 28.8 },
        { name: 'Women\'s Ministry', bookings: 38, percentage: 24.4 },
        { name: 'Youth Ministry', bookings: 32, percentage: 20.5 },
        { name: 'Children\'s Ministry', bookings: 25, percentage: 16.0 },
        { name: 'Music Ministry', bookings: 16, percentage: 10.3 }
      ]
    },
    allocations: {
      total: 48,
      active: 35,
      pending: 8,
      completed: 5,
      byBuilding: [
        { name: 'Block A', allocated: 15, capacity: 20, occupancy: 75 },
        { name: 'Block B', allocated: 12, capacity: 20, occupancy: 60 },
        { name: 'Block C', allocated: 8, capacity: 20, occupancy: 40 }
      ],
      byType: [
        { type: 'Pastor', count: 18, percentage: 37.5 },
        { type: 'Service Unit', count: 20, percentage: 41.7 },
        { type: 'Member', count: 10, percentage: 20.8 }
      ]
    },
    users: {
      total: 234,
      active: 189,
      inactive: 45,
      byRole: [
        { role: 'Member', count: 180, percentage: 76.9 },
        { role: 'Pastor', count: 25, percentage: 10.7 },
        { role: 'ServiceUnitAdmin', count: 20, percentage: 8.5 },
        { role: 'SuperAdmin', count: 9, percentage: 3.8 }
      ],
      recentSignups: [
        { date: '2025-01-12', count: 3 },
        { date: '2025-01-11', count: 5 },
        { date: '2025-01-10', count: 2 },
        { date: '2025-01-09', count: 4 },
        { date: '2025-01-08', count: 1 }
      ]
    },
    financial: {
      totalRevenue: 2450000,
      pendingPayments: 340000,
      completedPayments: 2110000,
      refunds: 125000,
      monthlyRevenue: [
        { month: 'Jan', revenue: 380000 },
        { month: 'Feb', revenue: 420000 },
        { month: 'Mar', revenue: 395000 },
        { month: 'Apr', revenue: 450000 },
        { month: 'May', revenue: 405000 },
        { month: 'Jun', revenue: 400000 }
      ],
      paymentMethods: [
        { method: 'Bank Transfer', amount: 1850000, percentage: 75.5 },
        { method: 'Online Payment', amount: 495000, percentage: 20.2 },
        { method: 'Cash', amount: 105000, percentage: 4.3 }
      ]
    }
  });

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };

    fetchReportData();
  }, [dateRange, filters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleExport = (type) => {
    // Handle export functionality
    alert(`Exporting ${type} report...`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'allocations', label: 'Allocations', icon: Building },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'financial', label: 'Financial', icon: TrendingUp }
  ];

  const StatCard = ({ title, value, trend, icon: Icon, color = 'blue' }) => {
    const isPositive = trend > 0;
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      purple: 'bg-purple-100 text-purple-800'
    };

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center mt-2">
                <TrendingUp className={`w-4 h-4 mr-1 ${isPositive ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
                <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{trend}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={reportData.overview.totalBookings}
          trend={reportData.overview.trends.bookings}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Active Allocations"
          value={reportData.overview.activeAllocations}
          trend={reportData.overview.trends.allocations}
          icon={Building}
          color="green"
        />
        <StatCard
          title="Total Users"
          value={reportData.overview.totalUsers}
          trend={reportData.overview.trends.users}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${reportData.overview.occupancyRate}%`}
          trend={reportData.overview.trends.occupancy}
          icon={Activity}
          color="yellow"
        />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Room allocation completed</p>
                  <p className="text-xs text-gray-500">Block A, Room 101 - Pastor John</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">2h ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-800">New booking request</p>
                  <p className="text-xs text-gray-500">Youth Ministry retreat</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">4h ago</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Payment pending</p>
                  <p className="text-xs text-gray-500">Women's Ministry conference</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">6h ago</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Booking cancelled</p>
                  <p className="text-xs text-gray-500">Men's fellowship meeting</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">8h ago</span>
            </div>
          </div>
        </div>

        {/* Top Service Units */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Service Units by Bookings</h3>
          <div className="space-y-3">
            {reportData.bookings.byServiceUnit.slice(0, 5).map((unit, index) => (
              <div key={unit.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-red-600">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{unit.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-800">{unit.bookings}</span>
                  <span className="text-xs text-gray-500 ml-1">({unit.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookingsTab = () => (
    <div className="space-y-6">
      {/* Booking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.bookings.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{reportData.bookings.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{reportData.bookings.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{reportData.bookings.cancelled}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Booking Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Booking Trends</h3>
          <div className="space-y-4">
            {reportData.bookings.byMonth.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{month.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">{month.bookings} total</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">{month.completed} completed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">{month.cancelled} cancelled</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Bookings by Service Unit</h3>
          <div className="space-y-3">
            {reportData.bookings.byServiceUnit.map((unit) => (
              <div key={unit.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{unit.name}</span>
                  <span className="text-gray-600">{unit.bookings} ({unit.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${unit.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAllocationsTab = () => (
    <div className="space-y-6">
      {/* Allocation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Allocations"
          value={reportData.allocations.total}
          icon={Building}
          color="blue"
        />
        <StatCard
          title="Active"
          value={reportData.allocations.active}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Pending"
          value={reportData.allocations.pending}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Completed"
          value={reportData.allocations.completed}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Building Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Building Occupancy</h3>
          <div className="space-y-4">
            {reportData.allocations.byBuilding.map((building) => (
              <div key={building.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{building.name}</span>
                  <span className="text-gray-600">
                    {building.allocated}/{building.capacity} ({building.occupancy}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      building.occupancy >= 80 ? 'bg-red-500' :
                      building.occupancy >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${building.occupancy}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Allocations by Type</h3>
          <div className="space-y-4">
            {reportData.allocations.byType.map((type) => (
              <div key={type.type} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${
                    type.type === 'Pastor' ? 'bg-purple-500' :
                    type.type === 'Service Unit' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{type.type}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-800">{type.count}</span>
                  <span className="text-xs text-gray-500 ml-1">({type.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={reportData.users.total}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={reportData.users.active}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Inactive Users"
          value={reportData.users.inactive}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* User Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Users by Role</h3>
          <div className="space-y-3">
            {reportData.users.byRole.map((role) => (
              <div key={role.role} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{role.role}</span>
                  <span className="text-gray-600">{role.count} ({role.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${role.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent User Signups</h3>
          <div className="space-y-3">
            {reportData.users.recentSignups.map((signup) => (
              <div key={signup.date} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{signup.date}</span>
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{signup.count} new users</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancialTab = () => {
    if (user?.role !== 'SuperAdmin') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Access Restricted</h3>
          <p className="text-gray-600">Financial reports are only available to Super Administrators.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.financial.totalRevenue)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Payments</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reportData.financial.completedPayments)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(reportData.financial.pendingPayments)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Refunds</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(reportData.financial.refunds)}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Financial Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue</h3>
            <div className="space-y-4">
              {reportData.financial.monthlyRevenue.map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{month.month}</span>
                  <span className="text-sm font-bold text-gray-800">
                    {formatCurrency(month.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h3>
            <div className="space-y-3">
              {reportData.financial.paymentMethods.map((method) => (
                <div key={method.method} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{method.method}</span>
                    <span className="text-gray-600">
                      {formatCurrency(method.amount)} ({method.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'bookings':
        return renderBookingsTab();
      case 'allocations':
        return renderAllocationsTab();
      case 'users':
        return renderUsersTab();
      case 'financial':
        return renderFinancialTab();
      default:
        return renderOverviewTab();
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Reports & Analytics">
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
    <AdminLayout title="Reports & Analytics">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex flex-wrap items-center space-x-4">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="3months">Last 3 months</option>
              <option value="6months">Last 6 months</option>
              <option value="1year">Last year</option>
            </select>

            {/* Filters */}
            <button className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
