import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for Azure deployment operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Upload and processing
  uploadCode: (formData, onUploadProgress) => 
    api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    }),

  getUploadStatus: (projectId) => api.get(`/upload/status/${projectId}`),
  
  getDockerfile: (projectId) => api.get(`/upload/dockerfile/${projectId}`),
  
  deleteProject: (projectId) => api.delete(`/upload/${projectId}`),

  // Azure integration
  checkAzureHealth: () => api.get('/azure/health'),
  
  authenticateAzure: () => api.post('/azure/authenticate'),
  
  ensureResourceGroup: () => api.get('/azure/resource-group'),
  
  listAzureDeployments: () => api.get('/azure/deployments'),
  
  getAzureDeploymentStatus: (containerName) => 
    api.get(`/azure/deployment/${containerName}/status`),
  
  getAzureMetrics: (containerName) => 
    api.get(`/azure/deployment/${containerName}/metrics`),
  
  deleteAzureDeployment: (containerName) => 
    api.delete(`/azure/deployment/${containerName}`),

  // Deployment
  deployProject: (projectId) => api.post(`/deployment/${projectId}`),
  
  getDeploymentStatus: (projectId) => api.get(`/deployment/${projectId}/status`),
  
  getDeploymentMetrics: (projectId) => api.get(`/deployment/${projectId}/metrics`),
  
  deleteDeployment: (projectId) => api.delete(`/deployment/${projectId}`),
  
  listDeployments: () => api.get('/deployment'),
};

export default api;