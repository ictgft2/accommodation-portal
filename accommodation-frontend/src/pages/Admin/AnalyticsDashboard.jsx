import React, { useState, useEffect, useRef } from 'react';
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
import analyticsService from '../../services/analyticsService';
import ExportModal from '../../components/ExportModal';
import { useToast } from '../../contexts/ToastContext';

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

const AnalyticsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [chartData, setChartData] = useState({
    daily: null,
    events: null,
    hourly: null
  });
  const [userActivity, setUserActivity] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    eventTypes: [],
    showExportModal: false
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [chartType, setChartType] = useState('daily');
  const [eventsPage, setEventsPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  
  const { showToast } = useToast();
  const chartRefs = useRef({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'charts') {
      loadChartData(chartType);
    }
  }, [activeTab, chartType]);

  useEffect(() => {
    if (activeTab === 'events') {
      loadEvents();
    }
  }, [activeTab, eventsPage, filters.dateFrom, filters.dateTo, filters.eventTypes]);

  useEffect(() => {
    if (activeTab === 'activity') {
      loadUserActivity();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboardOverview();
      setOverview(data);
    } catch (error) {
      showToast('Failed to load dashboard data', 'error');
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async (type) => {
    try {
      const data = await analyticsService.getActivityChartData(type, 30);
      setChartData(prev => ({
        ...prev,
        [type]: data
      }));
    } catch (error) {
      showToast(`Failed to load ${type} chart data`, 'error');
      console.error('Error loading chart data:', error);
    }
  };

  const loadUserActivity = async () => {
    try {
      const data = await analyticsService.getUserActivity(30);
      setUserActivity(data);
    } catch (error) {
      showToast('Failed to load user activity', 'error');
      console.error('Error loading user activity:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const filterParams = {
        page: eventsPage,
        pageSize: 20,
        date_from: filters.dateFrom || undefined,
        date_to: filters.dateTo || undefined,
        'event_types[]': filters.eventTypes.length > 0 ? filters.eventTypes : undefined
      };

      const data = await analyticsService.getEventsList(filterParams);
      setEvents(data.results || []);
      setTotalEvents(data.count || 0);
    } catch (error) {
      showToast('Failed to load events', 'error');
      console.error('Error loading events:', error);
    }
  };

  const handleExport = async (exportData) => {
    try {
      const result = await analyticsService.createExportReport(exportData);
      showToast('Export request submitted successfully!', 'success');
      setFilters(prev => ({ ...prev, showExportModal: false }));
    } catch (error) {
      showToast('Failed to create export', 'error');
      console.error('Error creating export:', error);
    }
  };

  const getChartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
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
  });

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <i className="fas fa-chart-line text-xl"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Events</p>
            <p className="text-2xl font-bold text-gray-900">{overview?.total_events?.toLocaleString() || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <i className="fas fa-calendar-day text-xl"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Events Today</p>
            <p className="text-2xl font-bold text-gray-900">{overview?.events_today?.toLocaleString() || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <i className="fas fa-calendar-week text-xl"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">This Week</p>
            <p className="text-2xl font-bold text-gray-900">{overview?.events_this_week?.toLocaleString() || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600">
            <i className="fas fa-exclamation-triangle text-xl"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Error Rate</p>
            <p className="text-2xl font-bold text-gray-900">{overview?.error_rate || 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMostActiveUsers = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Users (Last 30 Days)</h3>
      <div className="space-y-3">
        {overview?.most_active_users?.slice(0, 5).map((user, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                {user.user__first_name?.charAt(0) || user.user__username?.charAt(0) || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user.user__first_name && user.user__last_name 
                    ? `${user.user__first_name} ${user.user__last_name}`
                    : user.user__username
                  }
                </p>
                <p className="text-xs text-gray-500">@{user.user__username}</p>
              </div>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {user.event_count} events
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMostCommonEvents = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Common Events (Last 30 Days)</h3>
      <div className="space-y-3">
        {overview?.most_common_events?.slice(0, 5).map((event, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <i className="fas fa-bolt text-sm"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {event.event_type_display || event.event_type}
                </p>
              </div>
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {event.count} times
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCharts = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Activity Charts</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('daily')}
              className={`px-3 py-1 rounded text-sm ${
                chartType === 'daily'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setChartType('events')}
              className={`px-3 py-1 rounded text-sm ${
                chartType === 'events'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              By Type
            </button>
            <button
              onClick={() => setChartType('hourly')}
              className={`px-3 py-1 rounded text-sm ${
                chartType === 'hourly'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Hourly
            </button>
          </div>
        </div>
        
        <div className="h-96">
          {chartData[chartType] && (
            <>
              {chartType === 'events' ? (
                <Doughnut
                  data={chartData[chartType]}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                      title: {
                        display: true,
                        text: 'Events by Type (Last 30 Days)',
                        font: {
                          size: 16,
                          weight: 'bold'
                        }
                      },
                    },
                  }}
                />
              ) : (
                <Bar
                  data={chartData[chartType]}
                  options={getChartOptions(
                    chartType === 'daily' 
                      ? 'Daily Activity (Last 30 Days)'
                      : 'Hourly Activity (Last 7 Days)'
                  )}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
        <button
          onClick={() => setFilters(prev => ({ ...prev, showExportModal: true }))}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
        >
          <i className="fas fa-download mr-2"></i>
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Types</label>
          <select
            multiple
            value={filters.eventTypes}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              setFilters(prev => ({ ...prev, eventTypes: values }));
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {analyticsService.getEventTypeChoices().map(choice => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resource
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {event.user_display || 'Anonymous'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {event.event_type_display}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.formatted_timestamp}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.success
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {event.success ? 'Success' : 'Failed'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.resource_type && event.resource_id
                    ? `${event.resource_type} #${event.resource_id}`
                    : '-'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalEvents > 20 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-700">
            Showing {(eventsPage - 1) * 20 + 1} to {Math.min(eventsPage * 20, totalEvents)} of {totalEvents} events
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setEventsPage(prev => Math.max(1, prev - 1))}
              disabled={eventsPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700">
              Page {eventsPage} of {Math.ceil(totalEvents / 20)}
            </span>
            <button
              onClick={() => setEventsPage(prev => prev + 1)}
              disabled={eventsPage >= Math.ceil(totalEvents / 20)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderUserActivity = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">User Activity Summary (Last 30 Days)</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Events
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Types
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userActivity.map((user) => (
              <tr key={user.user_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {user.user__first_name?.charAt(0) || user.user__username?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-xs text-gray-500">@{user.user__username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {user.user__role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.total_events}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.last_activity).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(user.event_breakdown || {}).slice(0, 3).map(([eventType, count]) => (
                      <span key={eventType} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {eventType}: {count}
                      </span>
                    ))}
                    {Object.keys(user.event_breakdown || {}).length > 3 && (
                      <span className="text-xs text-gray-400">+{Object.keys(user.event_breakdown).length - 3} more</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Monitor system activity and user behavior</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, showExportModal: true }))}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
            >
              <i className="fas fa-download mr-2"></i>
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: 'fas fa-chart-pie' },
              { id: 'charts', name: 'Charts', icon: 'fas fa-chart-bar' },
              { id: 'events', name: 'Events', icon: 'fas fa-list' },
              { id: 'activity', name: 'User Activity', icon: 'fas fa-users' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              {renderOverviewCards()}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderMostActiveUsers()}
                {renderMostCommonEvents()}
              </div>
            </div>
          )}
          
          {activeTab === 'charts' && renderCharts()}
          {activeTab === 'events' && renderEvents()}
          {activeTab === 'activity' && renderUserActivity()}
        </div>
      </div>

      {/* Export Modal */}
      {filters.showExportModal && (
        <ExportModal
          onClose={() => setFilters(prev => ({ ...prev, showExportModal: false }))}
          onExport={handleExport}
        />
      )}
    </div>
  );
};

export default AnalyticsDashboard;
