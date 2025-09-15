import React, { useState } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

const ApiConnectionTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    // Test 1: Basic API connection
    try {
      const response = await fetch('http://localhost:8100/api/');
      results.apiConnection = {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'API is reachable' : `HTTP ${response.status}`
      };
    } catch (error) {
      results.apiConnection = {
        success: false,
        message: error.message
      };
    }

    // Test 2: Authentication endpoint
    try {
      const loginResult = await authService.login({
        username: 'admin@lfc.com',
        password: 'newpassword123' // Use the password you set
      });
      results.loginTest = {
        success: loginResult.success,
        message: loginResult.success ? 'Login successful' : loginResult.message
      };
    } catch (error) {
      results.loginTest = {
        success: false,
        message: error.message
      };
    }

    // Test 3: User service
    if (results.loginTest?.success) {
      try {
        const usersResult = await userService.getUsers();
        results.userService = {
          success: usersResult.success,
          message: usersResult.success ? 'User service working' : usersResult.message
        };
      } catch (error) {
        results.userService = {
          success: false,
          message: error.message
        };
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults({});
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">API Connection Test</h2>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={runTests}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Run Tests'}
          </button>
          
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Test Results:</h3>
            
            {Object.entries(testResults).map(([testName, result]) => (
              <div
                key={testName}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">
                    {testName.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.success ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {result.success ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <p className="text-sm mt-1">{result.message}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Current Configuration:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>API URL: {process.env.REACT_APP_API_BASE_URL || 'http://localhost:8100/api'}</li>
            <li>Environment: {process.env.NODE_ENV}</li>
            <li>Token in storage: {localStorage.getItem('token') ? 'Yes' : 'No'}</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Quick Login Test:</h4>
          <p className="text-sm text-yellow-700">
            This will test login with admin@lfc.com and the password you set.
            Make sure the Django server is running on port 8100.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiConnectionTest;
