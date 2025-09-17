import React, { useState } from 'react';

/**
 * Debug component to test dashboard API calls
 * Add this to any page to test the API
 */
const DashboardAPIDebugger = () => {
  const [debugInfo, setDebugInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const testDashboardAPI = async () => {
    setLoading(true);
    setDebugInfo('Testing dashboard API...\n');
    
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      setDebugInfo(prev => prev + `Token exists: ${!!token}\n`);
      if (token) {
        setDebugInfo(prev => prev + `Token: ${token.substring(0, 20)}...\n`);
      }

      // Test the exact API call
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8100/api';
      const fullUrl = `${API_BASE_URL}/dashboard/summary/`;
      
      setDebugInfo(prev => prev + `Calling: ${fullUrl}\n`);
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      setDebugInfo(prev => prev + `Headers: ${JSON.stringify(headers, null, 2)}\n`);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: headers,
      });

      setDebugInfo(prev => prev + `Response status: ${response.status}\n`);
      setDebugInfo(prev => prev + `Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}\n`);

      const responseText = await response.text();
      setDebugInfo(prev => prev + `Response body: ${responseText}\n`);

      if (!response.ok) {
        setDebugInfo(prev => prev + `ERROR: HTTP ${response.status}\n`);
      } else {
        try {
          const data = JSON.parse(responseText);
          setDebugInfo(prev => prev + `Parsed data: ${JSON.stringify(data, null, 2)}\n`);
        } catch (e) {
          setDebugInfo(prev => prev + `Failed to parse JSON: ${e.message}\n`);
        }
      }

    } catch (error) {
      setDebugInfo(prev => prev + `Fetch error: ${error.message}\n`);
      setDebugInfo(prev => prev + `Error details: ${JSON.stringify(error, null, 2)}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-bold mb-2">Dashboard API Debugger</h3>
      <button
        onClick={testDashboardAPI}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Dashboard API'}
      </button>
      
      {debugInfo && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Debug Output:</h4>
          <pre className="bg-black text-green-400 p-4 rounded text-xs overflow-auto max-h-96">
            {debugInfo}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DashboardAPIDebugger;
