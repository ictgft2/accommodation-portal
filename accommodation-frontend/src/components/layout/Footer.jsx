import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

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
                  <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/profile" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Profile
                  </a>
                </li>
                <li>
                  <a href="/allocations" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Allocations
                  </a>
                </li>
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
