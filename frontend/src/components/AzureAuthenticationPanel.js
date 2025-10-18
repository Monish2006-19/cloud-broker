import React, { useState, useEffect } from 'react';
import { FiCloud, FiCheck, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { apiService } from '../services/api';

const AzureAuthenticationPanel = ({ onAuthSuccess }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAuthenticating: false,
    error: null,
    subscriptionId: null
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await apiService.checkAzureHealth();
      if (response.data.success) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: response.data.data.configured,
          subscriptionId: response.data.data.subscriptionId
        }));
      }
    } catch (error) {
      console.log('Azure health check failed - authentication may be required');
    }
  };

  const handleAuthenticate = async () => {
    setAuthState(prev => ({ ...prev, isAuthenticating: true, error: null }));

    try {
      const response = await apiService.authenticateAzure();
      
      if (response.data.success) {
        setAuthState({
          isAuthenticated: true,
          isAuthenticating: false,
          error: null,
          subscriptionId: response.data.data.subscriptionId
        });
        
        if (onAuthSuccess) {
          onAuthSuccess(response.data.data);
        }
      } else {
        // Handle demo mode or manual authentication required
        if (response.data.demoMode) {
          setAuthState(prev => ({
            ...prev,
            isAuthenticating: false,
            error: 'Demo Mode: Azure authentication requires manual setup. You can still test file upload and processing features!'
          }));
        } else {
          setAuthState(prev => ({
            ...prev,
            isAuthenticating: false,
            error: response.data.message || 'Authentication failed'
          }));
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Authentication failed';
      setAuthState(prev => ({
        ...prev,
        isAuthenticating: false,
        error: `Demo Mode: ${errorMessage}. Upload and processing features are still available!`
      }));
    }
  };

  if (authState.isAuthenticated) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FiCheck className="text-green-600 text-lg" />
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-green-800">Azure Connected</h3>
            <p className="text-sm text-green-700">
              Subscription: {authState.subscriptionId?.substring(0, 8)}...
            </p>
          </div>
          <button
            onClick={checkAuthStatus}
            className="text-green-600 hover:text-green-700 p-2"
            title="Refresh Status"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCloud className="text-blue-600 text-2xl" />
        </div>
        
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Connect to Azure
        </h3>
        
        <p className="text-blue-700 mb-4">
          Authenticate with your Azure student account to enable deployments
        </p>

        {authState.error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <FiAlertTriangle className="text-yellow-600" />
              <span className="text-yellow-700 text-sm">{authState.error}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleAuthenticate}
          disabled={authState.isAuthenticating}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2 mx-auto"
        >
          {authState.isAuthenticating ? (
            <>
              <div className="spinner"></div>
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <FiCloud />
              <span>Connect to Azure</span>
            </>
          )}
        </button>

        <div className="mt-4 text-xs text-blue-600">
          <p>🔒 Secure browser-based authentication</p>
          <p>💳 Works with Azure student accounts</p>
          <p>🚀 No CLI installation required</p>
        </div>
      </div>
    </div>
  );
};

export default AzureAuthenticationPanel;