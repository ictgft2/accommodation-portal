import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Mock notifications data
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setNotifications([
          {
            id: 1,
            title: 'New Booking Request',
            message: 'Youth Ministry has requested accommodation for March 15-18, 2025.',
            timestamp: '10 minutes ago',
            read: false,
            type: 'booking'
          },
          {
            id: 2,
            title: 'Room Allocation Approved',
            message: 'Your allocation request for Block A, Room 101 has been approved.',
            timestamp: '2 hours ago',
            read: false,
            type: 'allocation'
          },
          {
            id: 3,
            title: 'Payment Received',
            message: 'Payment of ₦500,000 has been received for Women\'s Retreat booking.',
            timestamp: '5 hours ago',
            read: true,
            type: 'payment'
          },
          {
            id: 4,
            title: 'System Maintenance',
            message: 'System maintenance is scheduled for January 15, 2025.',
            timestamp: '1 day ago',
            read: true,
            type: 'system'
          }
        ]);
        setLoading(false);
      }, 500);
    }
  }, [isOpen, notifications.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type) => {
    const iconClasses = "w-2 h-2 rounded-full";
    switch (type) {
      case 'booking':
        return <div className={`${iconClasses} bg-blue-500`}></div>;
      case 'allocation':
        return <div className={`${iconClasses} bg-green-500`}></div>;
      case 'payment':
        return <div className={`${iconClasses} bg-purple-500`}></div>;
      case 'system':
        return <div className={`${iconClasses} bg-yellow-500`}></div>;
      default:
        return <div className={`${iconClasses} bg-gray-500`}></div>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="flex space-x-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-gray-900 ${
                          !notification.read ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.timestamp}
                        </p>
                      </div>

                      <div className="flex-shrink-0 flex items-center space-x-1">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Mark as read"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page
                  window.location.href = '/admin/notifications';
                }}
                className="w-full text-center text-sm text-red-600 hover:text-red-800 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
