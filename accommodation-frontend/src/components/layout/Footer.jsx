import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();

  // Get role-based paths
  const getRoleBasedPath = (section) => {
    if (!user) return '/dashboard';

    const role = user.role;

    switch (section) {
      case 'dashboard':
        return '/dashboard';
      
      case 'allocations':
        if (role === 'SuperAdmin') {
          return '/admin/allocations';
        } else if (role === 'ServiceUnitAdmin') {
          return '/service-unit/allocations';
        } else {
          return '/allocations'; // Member/Pastor view their own allocations
        }
      
      case 'users':
        if (role === 'SuperAdmin') {
          return '/admin/users';
        } else if (role === 'ServiceUnitAdmin') {
          return '/service-unit/members';
        } else {
          return '/profile'; // Redirect to profile for non-admin users
        }
      
      case 'buildings':
        if (role === 'SuperAdmin') {
          return '/admin/buildings';
        } else {
          return '/buildings'; // General building view
        }
      
      default:
        return '/dashboard';
    }
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Accommodation Portal
              </h3>
              <p className="text-sm text-gray-600">
                Managing accommodations with efficiency and care.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Quick Links
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link 
                    to={getRoleBasedPath('dashboard')} 
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/profile" 
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link 
                    to={getRoleBasedPath('allocations')} 
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Allocations
                  </Link>
                </li>
                {(user?.role === 'SuperAdmin' || user?.role === 'ServiceUnitAdmin') && (
                  <li>
                    <Link 
                      to={getRoleBasedPath('users')} 
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {user?.role === 'SuperAdmin' ? 'Users' : 'Members'}
                    </Link>
                  </li>
                )}
                {user?.role === 'SuperAdmin' && (
                  <li>
                    <Link 
                      to={getRoleBasedPath('buildings')} 
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Buildings
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Support
              </h3>
              <ul className="space-y-1">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <p className="text-sm text-gray-500">
                © {currentYear} Accommodation Portal. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Terms
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
