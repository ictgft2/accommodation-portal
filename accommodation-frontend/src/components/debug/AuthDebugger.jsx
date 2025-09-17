import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/authContext';
import userService from '../../services/userService';

/**
 * Debug component to test authentication and user fetching
 */
const AuthDebugger = () => {
  const { user, login, logout } = useAuthContext();
  const [debugInfo, setDebugInfo] = useState('');
  const [testResults, setTestResults] = useState({});

  const addDebugInfo = (message) => {
    setDebugInfo(prev => prev + '\n' + new Date().toLocaleTimeString() + ': ' + message);
  };

  const testLogin = async () => {
    addDebugInfo('Testing login...');
    try {
      const result = await login({
        email: 'admin@accommodation.com',
        password: 'admin123'
      });
      
      if (result.success) {
        addDebugInfo('✅ Login successful');
        setTestResults(prev => ({ ...prev, login: 'SUCCESS' }));
      } else {
        addDebugInfo('❌ Login failed: ' + result.error);
        setTestResults(prev => ({ ...prev, login: 'FAILED: ' + result.error }));
      }
    } catch (error) {
      addDebugInfo('💥 Login error: ' + error.message);
      setTestResults(prev => ({ ...prev, login: 'ERROR: ' + error.message }));
    }
  };

  const testUserFetch = async () => {
    addDebugInfo('Testing user fetch...');
    try {
      const result = await userService.getUsers({ page: 1, pageSize: 5 });
      
      if (result.success) {
        addDebugInfo(`✅ User fetch successful: ${result.data.count || result.data.length} users found`);
        setTestResults(prev => ({ ...prev, userFetch: 'SUCCESS: ' + (result.data.count || result.data.length) + ' users' }));
      } else {
        addDebugInfo('❌ User fetch failed: ' + result.error);
        setTestResults(prev => ({ ...prev, userFetch: 'FAILED: ' + result.error }));
      }
    } catch (error) {
      addDebugInfo('💥 User fetch error: ' + error.message);
      setTestResults(prev => ({ ...prev, userFetch: 'ERROR: ' + error.message }));
    }
  };

  const testUserStats = async () => {
    addDebugInfo('Testing user statistics...');
    try {
      const result = await userService.getUserStatistics();
      
      if (result.success) {
        addDebugInfo('✅ User stats successful');
        setTestResults(prev => ({ ...prev, userStats: 'SUCCESS: ' + JSON.stringify(result.data) }));
      } else {
        addDebugInfo('❌ User stats failed: ' + result.error);
        setTestResults(prev => ({ ...prev, userStats: 'FAILED: ' + result.error }));
      }
    } catch (error) {
      addDebugInfo('💥 User stats error: ' + error.message);
      setTestResults(prev => ({ ...prev, userStats: 'ERROR: ' + error.message }));
    }
  };

  const testAllEndpoints = async () => {
    addDebugInfo('=== STARTING FULL TEST ===');
    
    // Test login first
    await testLogin();
    
    // Wait a bit, then test user operations
    setTimeout(async () => {
      await testUserFetch();
      setTimeout(async () => {
        await testUserStats();
        addDebugInfo('=== TESTS COMPLETED ===');
      }, 1000);
    }, 1000);
  };

  const clearDebugInfo = () => {
    setDebugInfo('');
    setTestResults({});
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Authentication & User API Debugger</h1>
        
        {/* Current Auth Status */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Current Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Logged In:</strong> {user ? 'Yes' : 'No'}</p>
            {user && (
              <>
                <p><strong>User:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
              </>
            )}
            <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
          <div className="space-x-2 space-y-2">
            <button 
              onClick={testLogin}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Login
            </button>
            <button 
              onClick={testUserFetch}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test User Fetch
            </button>
            <button 
              onClick={testUserStats}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Test User Stats
            </button>
            <button 
              onClick={testAllEndpoints}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Test All
            </button>
            <button 
              onClick={clearDebugInfo}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear
            </button>
            {user && (
              <button 
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Test Results Summary */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Test Results Summary</h2>
            <div className="space-y-2">
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="flex justify-between">
                  <span className="font-medium">{test}:</span>
                  <span className={result.startsWith('SUCCESS') ? 'text-green-600' : 'text-red-600'}>
                    {result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Log */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Debug Log</h2>
          <div className="bg-gray-100 p-3 rounded min-h-32 max-h-96 overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap">{debugInfo || 'No debug info yet...'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugger;
