import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { 
  Bell, 
  Check, 
  X, 
  Trash2, 
  Filter, 
  Search,
  Calendar,
  User,
  Building,
  CreditCard,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  MoreVertical
} from 'lucide-react';

const NotificationPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [showSettings, setShowSettings] = useState(false);

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchNotifications = async () => {
      setTimeout(() => {
        setNotifications([
          {
            id: 1,
            type: 'booking',
            title: 'New Booking Request',
            message: 'Youth Ministry has requested accommodation for March 15-18, 2025.',
            timestamp: '2025-01-12 10:30 AM',
            read: false,
            priority: 'high',
            actionUrl: '/admin/bookings/1',
            sender: {
              name: 'System',
              avatar: null
            },
            metadata: {
              bookingId: 1,
              dates: '2025-03-15 to 2025-03-18',
              rooms: 15
            }
          },
          {
            id: 2,
            type: 'allocation',
            title: 'Room Allocation Approved',
            message: 'Your allocation request for Block A, Room 101 has been approved.',
            timestamp: '2025-01-12 09:15 AM',
            read: false,
            priority: 'medium',
            actionUrl: '/admin/allocations/2',
            sender: {
              name: 'Pastor David Ogundipe',
              avatar: null
            },
            metadata: {
              allocationId: 2,
              room: 'Block A - Room 101'
            }
          },
          {
            id: 3,
            type: 'payment',
            title: 'Payment Received',
            message: 'Payment of ₦500,000 has been received for Women\'s Retreat booking.',
            timestamp: '2025-01-12 08:45 AM',
            read: true,
            priority: 'low',
            actionUrl: '/admin/payments/3',
            sender: {
              name: 'Payment System',
              avatar: null
            },
            metadata: {
              amount: 500000,
              bookingRef: 'WR-2025-001'
            }
          },
          {
            id: 4,
            type: 'system',
            title: 'System Maintenance Scheduled',
            message: 'System maintenance is scheduled for January 15, 2025 from 2:00 AM to 4:00 AM.',
            timestamp: '2025-01-11 06:00 PM',
            read: true,
            priority: 'medium',
            actionUrl: null,
            sender: {
              name: 'System Administrator',
              avatar: null
            },
            metadata: {
              maintenanceDate: '2025-01-15',
              duration: '2 hours'
            }
          },
          {
            id: 5,
            type: 'user',
            title: 'New User Registration',
            message: 'Sarah Aliyu has registered and is awaiting approval.',
            timestamp: '2025-01-11 03:30 PM',
            read: true,
            priority: 'low',
            actionUrl: '/admin/users/5',
            sender: {
              name: 'Registration System',
              avatar: null
            },
            metadata: {
              userId: 5,
              userName: 'Sarah Aliyu',
              role: 'Member'
            }
          },
          {
            id: 6,
            type: 'booking',
            title: 'Booking Cancelled',
            message: 'Men\'s Fellowship meeting booking for January 25-26 has been cancelled.',
            timestamp: '2025-01-11 02:15 PM',
            read: true,
            priority: 'medium',
            actionUrl: '/admin/bookings/6',
            sender: {
              name: 'Emmanuel Chukwu',
              avatar: null
            },
            metadata: {
              bookingId: 6,
              reason: 'Insufficient advance notice'
            }
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'allocation':
        return <Building className="w-5 h-5 text-green-600" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      case 'system':
        return <Settings className="w-5 h-5 text-yellow-600" />;
      case 'user':
        return <User className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    switch (priority) {
      case 'high':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-100 text-blue-800';
      case 'allocation':
        return 'bg-green-100 text-green-800';
      case 'payment':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-yellow-100 text-yellow-800';
      case 'user':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.read) ||
                         (filter === 'read' && notification.read) ||
                         notification.type === filter;
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleMarkAsRead = (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const handleMarkAsUnread = (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: false } : n
    ));
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const handleSelectNotification = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleBulkAction = (action) => {
    const selectedIds = Array.from(selectedNotifications);
    
    switch (action) {
      case 'markRead':
        setNotifications(notifications.map(n => 
          selectedIds.includes(n.id) ? { ...n, read: true } : n
        ));
        break;
      case 'markUnread':
        setNotifications(notifications.map(n => 
          selectedIds.includes(n.id) ? { ...n, read: false } : n
        ));
        break;
      case 'delete':
        setNotifications(notifications.filter(n => !selectedIds.includes(n.id)));
        break;
    }
    
    setSelectedNotifications(new Set());
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const NotificationSettings = () => {
    const [settings, setSettings] = useState({
      emailNotifications: true,
      pushNotifications: true,
      inAppNotifications: true,
      soundEnabled: true,
      types: {
        booking: true,
        allocation: true,
        payment: true,
        system: true,
        user: true
      }
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Notification Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* General Settings */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">General Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">In-App Notifications</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.inAppNotifications}
                        onChange={(e) => setSettings({...settings, inAppNotifications: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-gray-400 mr-2" /> : <VolumeX className="w-4 h-4 text-gray-400 mr-2" />}
                      <span className="text-sm text-gray-700">Sound Notifications</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => setSettings({...settings, soundEnabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Notification Types */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Notification Types</h3>
                <div className="space-y-3">
                  {Object.entries(settings.types).map(([type, enabled]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getNotificationIcon(type)}
                        <span className="text-sm text-gray-700 ml-2 capitalize">{type}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => setSettings({
                            ...settings, 
                            types: { ...settings.types, [type]: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Notifications">
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
    <AdminLayout title="Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All notifications are read'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="booking">Bookings</option>
            <option value="allocation">Allocations</option>
            <option value="payment">Payments</option>
            <option value="system">System</option>
            <option value="user">Users</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                {selectedNotifications.size} notification{selectedNotifications.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('markRead')}
                  className="text-sm text-blue-700 hover:text-blue-900"
                >
                  Mark as Read
                </button>
                <button
                  onClick={() => handleBulkAction('markUnread')}
                  className="text-sm text-blue-700 hover:text-blue-900"
                >
                  Mark as Unread
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="text-sm text-red-700 hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
                !notification.read ? 'border-l-4 border-l-red-500' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Selection Checkbox */}
                <div className="flex items-center pt-1">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                </div>

                {/* Notification Icon */}
                <div className="flex-shrink-0 pt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        <span className={getPriorityBadge(notification.priority)}>
                          {notification.priority}
                        </span>
                      </div>
                      <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">{notification.timestamp}</span>
                        <span className="text-xs text-gray-500">From: {notification.sender.name}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read ? (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkAsUnread(notification.id)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Mark as unread"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  {notification.metadata && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 space-y-1">
                        {notification.type === 'booking' && (
                          <>
                            <div>Booking ID: {notification.metadata.bookingId}</div>
                            <div>Dates: {notification.metadata.dates}</div>
                            <div>Rooms: {notification.metadata.rooms}</div>
                          </>
                        )}
                        {notification.type === 'allocation' && (
                          <>
                            <div>Allocation ID: {notification.metadata.allocationId}</div>
                            <div>Room: {notification.metadata.room}</div>
                          </>
                        )}
                        {notification.type === 'payment' && (
                          <>
                            <div>Amount: ₦{notification.metadata.amount.toLocaleString()}</div>
                            <div>Reference: {notification.metadata.bookingRef}</div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {notification.actionUrl && (
                    <div className="mt-3">
                      <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                        View Details →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'You\'re all caught up! New notifications will appear here.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && <NotificationSettings />}
    </AdminLayout>
  );
};

export default NotificationPage;
