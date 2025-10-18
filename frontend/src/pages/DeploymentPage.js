import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { FiPlay, FiExternalLink, FiCode, FiServer, FiActivity, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { apiService } from '../services/api';

const DeploymentPage = () => {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch project status
  const { data: projectData, isLoading: projectLoading, error: projectError } = useQuery(
    ['project-status', projectId],
    () => apiService.getUploadStatus(projectId),
    {
      enabled: !!projectId,
      refetchInterval: 5000 // Refresh every 5 seconds
    }
  );

  // Fetch deployment status
  const { data: deploymentData, isLoading: deploymentLoading, refetch: refetchDeployment } = useQuery(
    ['deployment-status', projectId],
    () => apiService.getDeploymentStatus(projectId),
    {
      enabled: !!projectId,
      refetchInterval: 10000, // Refresh every 10 seconds
      retry: false
    }
  );

  // Fetch Dockerfile
  const { data: dockerfileData } = useQuery(
    ['dockerfile', projectId],
    () => apiService.getDockerfile(projectId),
    {
      enabled: !!projectId
    }
  );

  // Deploy mutation
  const deployMutation = useMutation(
    () => apiService.deployProject(projectId),
    {
      onSuccess: () => {
        refetchDeployment();
      }
    }
  );

  const isDeployed = deploymentData?.data?.data;
  const deployment = deploymentData?.data?.data;
  const deploymentUrl = deployment?.publicUrl;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiServer },
    { id: 'dockerfile', label: 'Dockerfile', icon: FiCode },
    { id: 'metrics', label: 'Metrics', icon: FiActivity }
  ];

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project information...</p>
        </div>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Project Not Found</h2>
          <p className="text-red-700 mb-4">
            The project with ID "{projectId}" could not be found.
          </p>
          <Link 
            to="/upload"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Upload New Project
          </Link>
        </div>
      </div>
    );
  }

  const project = projectData?.data?.data;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Project Deployment
            </h1>
            <p className="text-gray-600">
              Project ID: <span className="font-mono text-sm">{projectId}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {deploymentUrl && (
              <a
                href={deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <FiExternalLink />
                <span>View Live App</span>
              </a>
            )}
            {!isDeployed && (
              <button
                onClick={() => deployMutation.mutate()}
                disabled={deployMutation.isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center space-x-2"
              >
                {deployMutation.isLoading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Deploying...</span>
                  </>
                ) : (
                  <>
                    <FiPlay />
                    <span>Deploy to Azure</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Runtime</p>
                <p className="text-lg font-semibold text-gray-800">
                  {project?.runtime || 'Unknown'}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiCode className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Port</p>
                <p className="text-lg font-semibold text-gray-800">
                  {project?.detectedPort || 'N/A'}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiServer className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`text-lg font-semibold ${
                  isDeployed ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {isDeployed ? 'Deployed' : 'Ready to Deploy'}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDeployed ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                <FiActivity className={isDeployed ? 'text-green-600' : 'text-yellow-600'} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {deployMutation.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">
            Deployment failed: {deployMutation.error.response?.data?.message || deployMutation.error.message}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg card-shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab 
              deployment={deploymentData?.data?.data} 
              loading={deploymentLoading}
              project={project}
            />
          )}
          
          {activeTab === 'dockerfile' && (
            <DockerfileTab dockerfile={dockerfileData?.data} />
          )}
          
          {activeTab === 'metrics' && (
            <MetricsTab projectId={projectId} />
          )}
        </div>
      </div>
    </div>
  );
};

const OverviewTab = ({ deployment, loading, project }) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Checking deployment status...</p>
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="text-center py-8">
        <FiServer className="text-4xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Not Deployed Yet
        </h3>
        <p className="text-gray-600 mb-4">
          Your application is ready to be deployed to Azure Container Instances.
        </p>
        <p className="text-sm text-gray-500">
          Click the "Deploy to Azure" button to start the deployment process.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {deployment.demoMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎭</span>
            <div>
              <h4 className="font-medium text-blue-800">Demo Mode Active</h4>
              <p className="text-blue-700 text-sm">
                This is a simulated deployment demonstrating the complete Azure deployment pipeline. 
                In a real environment, this would create actual Azure resources with public URLs.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Deployment Information
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Container Name:</span>
              <span className="font-medium font-mono text-sm">
                {deployment.containerName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Runtime:</span>
              <span className="font-medium">{deployment.runtime}</span>
            </div>
            {deployment.demoMode ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Azure Web App URL:</span>
                  <span className="text-blue-600 font-mono text-sm">
                    {deployment.publicUrl}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registry:</span>
                  <span className="font-mono text-sm">
                    {deployment.deployment?.buildInfo?.registry || 'demo-registry.azurecr.io'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Build ID:</span>
                  <span className="font-mono text-sm">
                    {deployment.deployment?.buildInfo?.buildId || 'demo-build'}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span className="text-gray-600">Public URL:</span>
                <a 
                  href={deployment.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <span className="font-mono text-sm">{deployment.publicUrl}</span>
                  <FiExternalLink className="text-xs" />
                </a>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Deployed At:</span>
              <span className="font-medium text-sm">
                {new Date(deployment.deployedAt || deployment.deployment?.deployedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Current Status
          </h3>
          {deployment.demoMode ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Deployment State:</span>
                <span className="status-indicator status-success">
                  {deployment.deployment?.status || 'Succeeded'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">App State:</span>
                <span className="status-indicator status-success">
                  {deployment.status || 'Running'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">
                  {deployment.location || 'East US'}
                </span>
              </div>
            </div>
          ) : deployment.currentStatus && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Provisioning State:</span>
                <span className={`status-indicator ${
                  deployment.currentStatus.status === 'Succeeded' ? 'status-success' : 'status-pending'
                }`}>
                  {deployment.currentStatus.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Container State:</span>
                <span className={`status-indicator ${
                  deployment.currentStatus.state === 'Running' ? 'status-success' : 'status-pending'
                }`}>
                  {deployment.currentStatus.state || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IP Address:</span>
                <span className="font-mono text-sm">
                  {deployment.currentStatus.ipAddress || 'N/A'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DockerfileTab = ({ dockerfile }) => {
  if (!dockerfile) {
    return (
      <div className="text-center py-8">
        <FiCode className="text-4xl text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Dockerfile not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Generated Dockerfile
        </h3>
        <span className="text-sm text-gray-600">
          Runtime: <strong>{dockerfile.runtime}</strong> | Port: <strong>{dockerfile.port}</strong>
        </span>
      </div>
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
        <pre className="text-sm font-mono whitespace-pre-wrap">
          {dockerfile.dockerfile}
        </pre>
      </div>
    </div>
  );
};

const MetricsTab = ({ projectId }) => {
  const { data: metricsData, isLoading, error } = useQuery(
    ['metrics', projectId],
    () => apiService.getDeploymentMetrics(projectId),
    {
      enabled: !!projectId,
      refetchInterval: 5000, // Refresh every 5 seconds for debugging
      retry: false,
      onError: (error) => {
        console.error('Metrics query failed:', error);
      },
      onSuccess: (data) => {
        console.log('Metrics data received:', data);
        console.log('Metrics data structure:', JSON.stringify(data, null, 2));
      }
    }
  );

  console.log('MetricsTab render - projectId:', projectId);
  console.log('MetricsTab render - isLoading:', isLoading);
  console.log('MetricsTab render - error:', error);
  console.log('MetricsTab render - metricsData:', metricsData);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <FiActivity className="text-4xl text-red-400 mx-auto mb-4" />
        <p className="text-red-600">Failed to load metrics</p>
        <p className="text-sm text-gray-500 mt-2">
          Error: {error.message}
        </p>
      </div>
    );
  }

  if (!metricsData?.data) {
    return (
      <div className="text-center py-8">
        <FiActivity className="text-4xl text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No metrics available yet</p>
        <p className="text-sm text-gray-500 mt-2">
          Metrics will appear after deployment
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Debug: metricsData = {JSON.stringify(metricsData)}
        </p>
      </div>
    );
  }

  const metrics = metricsData.data.metrics || {};
  console.log('Rendering metrics:', metrics);
  console.log('Raw metricsData:', metricsData);
  console.log('metrics.cpuUsage:', metrics.cpuUsage);
  console.log('metrics.memoryUsage:', metrics.memoryUsage);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">
        Application Metrics
      </h3>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">CPU Usage</p>
              <p className="text-2xl font-bold text-blue-800">
                {metrics.cpuUsage || '0.0'}%
              </p>
              <p className="text-xs text-gray-500">
                Debug: {JSON.stringify(metrics.cpuUsage)}
              </p>
            </div>
            <FiActivity className="text-blue-600 text-xl" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Memory Usage</p>
              <p className="text-2xl font-bold text-green-800">
                {metrics.memoryUsage || '0.0'}%
              </p>
              <p className="text-xs text-gray-500">
                Debug: {JSON.stringify(metrics.memoryUsage)}
              </p>
            </div>
            <FiServer className="text-green-600 text-xl" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Requests</p>
              <p className="text-2xl font-bold text-purple-800">
                {metrics.requestCount || 0}
              </p>
            </div>
            <FiExternalLink className="text-purple-600 text-xl" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Uptime</p>
              <p className="text-2xl font-bold text-yellow-800">
                {Math.floor((metrics.uptime || 0) / 3600)}h
              </p>
            </div>
            <FiRefreshCw className="text-yellow-600 text-xl" />
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Last updated: {metricsData.data.timestamp ? new Date(metricsData.data.timestamp).toLocaleString() : 'Unknown'}
      </div>
    </div>
  );
};

export default DeploymentPage;
