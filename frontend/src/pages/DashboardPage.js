import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { FiServer, FiExternalLink, FiTrash2, FiRefreshCw, FiPlus, FiActivity } from 'react-icons/fi';
import { apiService } from '../services/api';
import AzureAuthenticationPanel from '../components/AzureAuthenticationPanel';

const DashboardPage = () => {
  const [selectedDeployment, setSelectedDeployment] = useState(null);

  // Fetch all deployments
  const { 
    data: deploymentsData, 
    isLoading: deploymentsLoading, 
    refetch: refetchDeployments 
  } = useQuery(
    'deployments',
    apiService.listDeployments,
    {
      refetchInterval: 15000 // Refresh every 15 seconds
    }
  );

  // Fetch Azure health status
  const { data: azureHealthData } = useQuery(
    'azure-health',
    apiService.checkAzureHealth,
    {
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  );

  const deployments = deploymentsData?.data?.data || [];
  const azureHealth = azureHealthData?.data?.data;

  const handleDeleteDeployment = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this deployment?')) {
      try {
        await apiService.deleteDeployment(projectId);
        refetchDeployments();
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete deployment. Please try again.');
      }
    }
  };

  if (deploymentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and manage your deployed applications
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetchDeployments()}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <FiRefreshCw />
            <span>Refresh</span>
          </button>
          <Link
            to="/upload"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <FiPlus />
            <span>New Deployment</span>
          </Link>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Deployments</p>
              <p className="text-3xl font-bold text-gray-800">
                {deployments.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiServer className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Applications</p>
              <p className="text-3xl font-bold text-green-600">
                {deployments.filter(d => d.publicUrl).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiActivity className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Azure Status</p>
              <p className={`text-lg font-semibold ${
                azureHealth?.configured ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {azureHealth?.configured ? 'Connected' : 'Not Configured'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              azureHealth?.configured ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <FiServer className={`text-2xl ${
                azureHealth?.configured ? 'text-green-600' : 'text-yellow-600'
              }`} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resource Group</p>
              <p className="text-sm font-mono text-gray-800">
                {azureHealth?.resourceGroup || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">
                {azureHealth?.location || 'No location'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiServer className="text-2xl text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Azure Authentication Panel */}
      {!azureHealth?.configured && (
        <div className="mb-8">
          <AzureAuthenticationPanel 
            onAuthSuccess={(authData) => {
              console.log('Azure authentication successful:', authData);
              // Refetch Azure health to update the dashboard
              window.location.reload();
            }}
          />
        </div>
      )}

      {/* Deployments Table */}
      <div className="bg-white rounded-lg card-shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Active Deployments
          </h2>
        </div>

        {deployments.length === 0 ? (
          <div className="p-8 text-center">
            <FiServer className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Deployments Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start by uploading your first application
            </p>
            <Link
              to="/upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <FiPlus />
              <span>Upload Application</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-semibold text-gray-800">
                    Project
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-800">
                    Runtime
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-800">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-800">
                    Deployed
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deployments.map((deployment) => (
                  <tr key={deployment.projectId} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <Link
                          to={`/deployment/${deployment.projectId}`}
                          className="font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-2"
                        >
                          <span>{deployment.containerName}</span>
                          {deployment.demoMode && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              🎭 DEMO
                            </span>
                          )}
                        </Link>
                        <p className="text-sm text-gray-600 font-mono">
                          {deployment.projectId.substring(0, 8)}...
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="status-indicator status-info">
                        {deployment.runtime}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`status-indicator ${
                        deployment.publicUrl ? 'status-success' : 'status-pending'
                      }`}>
                        {deployment.demoMode ? 'Demo Active' : deployment.publicUrl ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">
                        {new Date(deployment.deployedAt || deployment.deployment?.deployedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/deployment/${deployment.projectId}`}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="View Details"
                        >
                          <FiServer />
                        </Link>
                        {deployment.publicUrl && (
                          deployment.demoMode ? (
                            <span
                              className="text-gray-400 p-1 cursor-not-allowed"
                              title="Demo URL - Not accessible"
                            >
                              <FiExternalLink />
                            </span>
                          ) : (
                            <a
                              href={deployment.publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700 p-1"
                              title="Open Application"
                            >
                              <FiExternalLink />
                            </a>
                          )
                        )}
                        <button
                          onClick={() => handleDeleteDeployment(deployment.projectId)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Delete Deployment"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {deployments.length > 0 && (
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg card-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Runtime Distribution
            </h3>
            <div className="space-y-2">
              {Object.entries(
                deployments.reduce((acc, dep) => {
                  acc[dep.runtime] = (acc[dep.runtime] || 0) + 1;
                  return acc;
                }, {})
              ).map(([runtime, count]) => (
                <div key={runtime} className="flex justify-between">
                  <span className="text-gray-600">{runtime}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg card-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-2">
              {deployments
                .sort((a, b) => new Date(b.deployedAt) - new Date(a.deployedAt))
                .slice(0, 3)
                .map((deployment) => (
                  <div key={deployment.projectId} className="text-sm">
                    <div className="font-medium text-gray-800">
                      {deployment.containerName}
                    </div>
                    <div className="text-gray-600">
                      {new Date(deployment.deployedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg card-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              System Health
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Backend</span>
                <span className="text-green-600 font-semibold">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Azure</span>
                <span className={azureHealth?.configured ? 'text-green-600' : 'text-yellow-600'}>
                  {azureHealth?.configured ? 'Connected' : 'Not Configured'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Storage</span>
                <span className="text-green-600 font-semibold">Available</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;