import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const ApiTester = () => {
  const { login, loading, error } = useAuth();
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result, success = true) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      result: JSON.stringify(result, null, 2),
      success,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testApiConnection = async () => {
    try {
      // Test basic fetch to Django server
      const response = await fetch('http://localhost:8100/api/auth/users/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.text();
      addTestResult('API Connection Test', { 
        status: response.status,
        statusText: response.statusText,
        response: result 
      }, response.ok);
    } catch (error) {
      addTestResult('API Connection Test', { error: error.message }, false);
    }
  };

  const testLogin = async () => {
    try {
      const result = await login({
        email: 'admin@lfc.com',
        password: 'Workhard101'
      });
      
      addTestResult('Login Test', result, result.success);
    } catch (error) {
      addTestResult('Login Test', { error: error.message }, false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Integration Tester</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testApiConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          Test API Connection
        </button>
        
        <button
          onClick={testLogin}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={loading}
        >
          Test Login
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Auth Error: {error}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Results:</h2>
        {testResults.length === 0 ? (
          <p className="text-gray-500">No tests run yet.</p>
        ) : (
          testResults.map(result => (
            <div
              key={result.id}
              className={`p-4 rounded border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{result.test}</h3>
                <span className="text-sm text-gray-500">{result.timestamp}</span>
              </div>
              <pre className="text-sm overflow-x-auto bg-white p-2 rounded border">
                {result.result}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApiTester;
