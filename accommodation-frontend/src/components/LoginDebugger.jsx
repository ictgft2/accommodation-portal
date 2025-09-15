import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/authContext';
import authService from '../services/authService';

const LoginDebugger = () => {
  const { user, login, logout } = useAuthContext();
  const [debugInfo, setDebugInfo] = useState({});
  const [loginForm, setLoginForm] = useState({
    username: 'admin@accommodation.com', // Updated to correct admin email
    password: 'admin123' // Updated to correct admin password
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Get current auth state
    const getDebugInfo = () => {
      setDebugInfo({
        user: user,
        token: localStorage.getItem('token'),
        isAuthenticated: authService.isAuthenticated(),
        storedUser: authService.getStoredUser(),
        apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8100/api'
      });
    };

    getDebugInfo();
  }, [user]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await login(loginForm.username, loginForm.password);
      console.log('Login result:', result);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const testApiDirectly = async () => {
    try {
      // Use the correct field mapping that Django expects
      const apiData = {
        username: loginForm.username,
        password: loginForm.password
      };
      
      const response = await fetch('http://localhost:8100/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      const data = await response.json();
      console.log('Direct API test:', { status: response.status, data });
      alert(`Direct API Response: ${response.status} - ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('Direct API test error:', error);
      alert(`Direct API Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Login Debugger</h2>
        
        {/* Current Auth State */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Current Authentication State</h3>
          <pre className="text-sm overflow-auto bg-white p-3 rounded border">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Login Form */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Test Login</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoggingIn ? 'Logging in...' : 'Login via Context'}
            </button>
            <button
              onClick={testApiDirectly}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Test API Directly
            </button>
            {user && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* API Status */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Quick Checks</h3>
          <div className="space-y-2 text-sm">
            <div>Backend Status: Check <a href="http://localhost:8100/admin/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Django Admin</a></div>
            <div>API Root: <a href="http://localhost:8100/api/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">http://localhost:8100/api/</a></div>
            <div>Token Status: {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}</div>
            <div>User Status: {user ? '✅ Logged In' : '❌ Not Logged In'}</div>
          </div>
        </div>

        {/* Clear Storage */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Reset Actions</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Clear All Storage & Reload
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Clear Auth Data & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDebugger;
