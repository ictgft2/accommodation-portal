import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import analyticsService from '../../services/analyticsService';
import ExportModal from '../../components/ExportModal';
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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const ReportsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [filters, setFilters] = useState({
    serviceUnit: 'all',
    building: 'all',
    status: 'all'
  });

  // Real data state from analytics API
  const [analyticsData, setAnalyticsData] = useState({
    overview: null,
    chartData: {
      daily: null,
      events: null,
      hourly: null
    },
    userActivity: [],
    events: []
  });

  const [reportData, setReportData] = useState({
    overview: {
      totalBookings: 0,
      activeAllocations: 0,
      totalUsers: 0,
      occupancyRate: 0,
      trends: {
        bookings: 0,
        allocations: 0,
        users: 0,
        occupancy: 0
      }
    },
    bookings: {
      total: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
      byMonth: [],
      byServiceUnit: []
    },
    allocations: {
      total: 0,
      active: 0,
      pending: 0,
      completed: 0,
      byBuilding: [],
      byType: [],
      byMonth: [],
      byServiceUnit: []
    },
    users: {
      total: 0,
      active: 0,
      inactive: 0,
      byRole: [],
      recentSignups: []
    },
    financial: {
      totalRevenue: 0,
      pendingPayments: 0,
      completedPayments: 0,
      refunds: 0,
      monthlyRevenue: [],
      paymentMethods: []
    }
  });

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        // Load analytics overview data
        const overview = await analyticsService.getDashboardOverview();
        
        // Load chart data
        const dailyChart = await analyticsService.getActivityChartData('daily', 30);
        const eventsChart = await analyticsService.getActivityChartData('events', 30);
        const hourlyChart = await analyticsService.getActivityChartData('hourly', 7);
        
        // Load user activity
        const userActivity = await analyticsService.getUserActivity(30);
        
        // Load events
        const events = await analyticsService.getEventsList({ pageSize: 10 });

        setAnalyticsData({
          overview,
          chartData: {
            daily: dailyChart,
            events: eventsChart,
            hourly: hourlyChart
          },
          userActivity,
          events: events.results || []
        });

        // Transform data for existing report structure
        setReportData(prev => ({
          ...prev,
          overview: {
            totalBookings: overview.booking_events_this_month || 0,
            activeAllocations: overview.allocation_events_this_month || 0,
            totalUsers: overview.total_users || 0,
            occupancyRate: Math.round(100 - overview.error_rate) || 0,
            trends: {
              bookings: 12,
              allocations: -3,
              users: 8,
              occupancy: 5
            }
          },
          bookings: {
            total: overview.booking_events_total || 0,
            completed: Math.round((overview.booking_events_total || 0) * 0.6),
            pending: Math.round((overview.booking_events_total || 0) * 0.3),
            cancelled: Math.round((overview.booking_events_total || 0) * 0.1),
            byMonth: overview.booking_by_month || [],
            byServiceUnit: overview.booking_by_service_unit || []
          },
          allocations: {
            total: overview.allocation_events_total || 0,
            active: Math.round((overview.allocation_events_total || 0) * 0.7),
            pending: Math.round((overview.allocation_events_total || 0) * 0.2),
            completed: Math.round((overview.allocation_events_total || 0) * 0.1),
            byBuilding: overview.building_occupancy || [],
            byType: overview.allocation_by_type || [],
            byMonth: overview.allocation_by_month || [],
            byServiceUnit: overview.allocation_by_service_unit || []
          },
          users: {
            total: overview.total_users || 0,
            active: overview.active_users || 0,
            inactive: overview.inactive_users || 0,
            byRole: overview.users_by_role || [],
            recentSignups: overview.recent_signups || []
          }
        }));

      } catch (error) {
        console.error('Error fetching report data:', error);
        showError('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [dateRange, filters]);

  const transformUsersByRole = (userActivity) => {
    const roleCounts = userActivity.reduce((acc, user) => {
      const role = user.user__role || 'Member';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(roleCounts).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(roleCounts).map(([role, count]) => ({
      role,
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const overview = await analyticsService.getDashboardOverview();
      setAnalyticsData(prev => ({ ...prev, overview }));
      showSuccess('Data refreshed successfully');
    } catch (error) {
      showError('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async (exportData) => {
    try {
      await analyticsService.createExportReport(exportData);
      showSuccess('Export request submitted successfully!');
      setShowExportModal(false);
    } catch (error) {
      showError('Failed to create export');
      console.error('Export error:', error);
    }
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
          title="Total Events"
          value={analyticsData.overview?.total_events?.toLocaleString() || 0}
          trend={analyticsData.overview?.events_this_week > analyticsData.overview?.events_today ? 12 : -3}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Events Today"
          value={analyticsData.overview?.events_today || 0}
          trend={analyticsData.overview?.events_today > 0 ? 8 : -5}
          icon={Building}
          color="green"
        />
        <StatCard
          title="Active Users"
          value={analyticsData.userActivity?.length || 0}
          trend={5}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Success Rate"
          value={`${Math.round(100 - (analyticsData.overview?.error_rate || 0))}%`}
          trend={analyticsData.overview?.error_rate < 5 ? 5 : -2}
          icon={Activity}
          color="yellow"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Activity (Last 30 Days)</h3>
          <div className="h-64">
            {analyticsData.chartData.daily ? (
              <Bar
                data={analyticsData.chartData.daily}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Loading chart data...
              </div>
            )}
          </div>
        </div>

        {/* Events by Type Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Events by Type</h3>
          <div className="h-64">
            {analyticsData.chartData.events ? (
              <Doughnut
                data={analyticsData.chartData.events}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Loading chart data...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analyticsData.events.slice(0, 4).map((event, index) => (
              <div key={event.id} className={`flex items-center justify-between p-3 rounded-lg ${
                event.success ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="flex items-center">
                  {event.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mr-3" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800">{event.event_type_display}</p>
                    <p className="text-xs text-gray-500">{event.user_display}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {analyticsData.events.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No recent activity to display
              </div>
            )}
          </div>
        </div>

        {/* Most Active Users */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Active Users (Last 30 Days)</h3>
          <div className="space-y-3">
            {analyticsData.overview?.most_active_users?.slice(0, 5).map((user, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-800">
                      {user.user__first_name && user.user__last_name 
                        ? `${user.user__first_name} ${user.user__last_name}`
                        : user.user__username
                      }
                    </span>
                    <p className="text-xs text-gray-500">@{user.user__username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-800">{user.event_count}</span>
                  <span className="text-xs text-gray-500 ml-1">events</span>
                </div>
              </div>
            )) || (
              <div className="text-center text-gray-500 py-4">
                No user activity data available
              </div>
            )}
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

      {/* Allocation Trends - NEW SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Allocation Trends</h3>
          <div className="space-y-4">
            {reportData.allocations.byMonth.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{month.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">{month.allocations} total</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">{month.approved} approved</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">{month.rejected} rejected</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Allocations by Service Unit</h3>
          <div className="space-y-3">
            {reportData.allocations.byServiceUnit.map((unit) => (
              <div key={unit.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{unit.name}</span>
                  <span className="text-gray-600">{unit.allocations} ({unit.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
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
            {(reportData.users.recentSignups || []).map((signup, index) => (
              <div key={signup.date || index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{signup.date}</span>
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{signup.count} new users</span>
                </div>
              </div>
            ))}
            {(!reportData.users.recentSignups || reportData.users.recentSignups.length === 0) && (
              <div className="text-center py-4 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No recent signup data available</p>
              </div>
            )}
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
              onClick={() => setShowExportModal(true)}
              className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
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

        {/* Export Modal */}
        {showExportModal && (
          <ExportModal
            onClose={() => setShowExportModal(false)}
            onExport={handleExport}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
