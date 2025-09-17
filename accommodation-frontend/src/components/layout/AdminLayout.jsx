import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationDropdown from '../notifications/NotificationDropdown';
import Footer from './Footer';
import { 
  Home, 
  Users, 
  Building, 
  Calendar, 
  BarChart3, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  UserCheck,
  MapPin,
  ClipboardList,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';

const AdminLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const sidebarRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);
  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', icon: Home, path: '/dashboard', roles: ['SuperAdmin', 'ServiceUnitAdmin', 'Pastor', 'Member'] },
    ];

    const roleSpecificItems = [];

    if (user?.role === 'SuperAdmin') {
      roleSpecificItems.push(
        { name: 'User Management', icon: Users, path: '/admin/users', roles: ['SuperAdmin'] },
        { name: 'Service Units', icon: UserCheck, path: '/admin/service-units', roles: ['SuperAdmin'] },
        { name: 'Buildings & Rooms', icon: Building, path: '/admin/buildings', roles: ['SuperAdmin'] },
        { name: 'Allocations', icon: Calendar, path: '/admin/allocations', roles: ['SuperAdmin'] },
        { name: 'Reports', icon: BarChart3, path: '/admin/reports', roles: ['SuperAdmin'] },
      );
    } else if (user?.role === 'ServiceUnitAdmin') {
      roleSpecificItems.push(
        { name: 'My Service Unit', icon: UserCheck, path: '/service-unit/dashboard', roles: ['ServiceUnitAdmin'] },
        { name: 'Members', icon: Users, path: '/service-unit/members', roles: ['ServiceUnitAdmin'] },
        { name: 'Allocations', icon: Calendar, path: '/service-unit/allocations', roles: ['ServiceUnitAdmin'] },
        { name: 'Reports', icon: BarChart3, path: '/service-unit/reports', roles: ['ServiceUnitAdmin'] },
      );
    } else if (user?.role === 'Pastor') {
      roleSpecificItems.push(
        { name: 'My Allocations', icon: MapPin, path: '/pastor/allocations', roles: ['Pastor'] },
        { name: 'Requests', icon: ClipboardList, path: '/pastor/requests', roles: ['Pastor'] },
      );
    } else if (user?.role === 'Member') {
      roleSpecificItems.push(
        { name: 'My Allocations', icon: MapPin, path: '/member/allocations', roles: ['Member'] },
        { name: 'Make Request', icon: ClipboardList, path: '/member/request', roles: ['Member'] },
      );
    }

    return [...baseItems, ...roleSpecificItems];
  };

  const navigationItems = getNavigationItems();

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    const pathSegments = path.split('/').filter(Boolean);
    
    if (pathSegments.length === 1 && pathSegments[0] === 'dashboard') {
      return 'Dashboard';
    }
    
    const activeItem = navigationItems.find(item => isActivePath(item.path));
    return activeItem ? activeItem.name : title || 'Page';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          {/* Left Section - Logo & Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/images/winners-logo.png" 
                alt="Winners Portal Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Winners Portal</h1>
                <p className="text-xs text-gray-500 -mt-1">Accommodation Management</p>
              </div>
            </div>
          </div>

          {/* Right Section - Search & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search (Hidden on mobile) */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.first_name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Member'}</p>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      {user?.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt="Profile" 
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user?.first_name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                        <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full mt-1">
                          {user?.role || 'Member'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        handleNavigation('/profile');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        handleNavigation('/settings');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Preferences
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`} ref={sidebarRef}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-800">Navigation</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="flex-1 text-left">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
              Quick Actions
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleNavigation('/settings')}
                className="w-full group flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              >
                <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" />
                <span className="flex-1 text-left">Settings</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-red-900 mb-1">Need Help?</h4>
              <p className="text-xs text-red-700 mb-3">Contact support for assistance</p>
              <button className="w-full bg-red-600 text-white text-xs font-medium py-2 px-3 rounded-lg hover:bg-red-700 transition-colors">
                Get Support
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-72'} min-h-screen flex flex-col`}>
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title || getBreadcrumb()}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your accommodation portal efficiently
              </p>
            </div>
            
            {/* Breadcrumb */}
            <div className="mt-3 sm:mt-0">
              <nav className="flex text-sm text-gray-500">
                <span>Portal</span>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="text-gray-900 font-medium">{getBreadcrumb()}</span>
              </nav>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6">
          {children}
        </div>

        {/* Footer */}
        <Footer />
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
