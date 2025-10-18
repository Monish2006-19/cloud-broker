const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const multer = require('multer');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import services
const azureService = require('./services/azure');

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Increase timeout for Azure deployment operations
app.use((req, res, next) => {
  // Set timeout to 5 minutes for deployment endpoints
  if (req.path.includes('/deployment') || req.path.includes('/upload')) {
    req.setTimeout(300000); // 5 minutes
    res.setTimeout(300000); // 5 minutes
  }
  next();
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure required directories exist
fs.ensureDirSync(path.join(__dirname, '../uploads'));
fs.ensureDirSync(path.join(__dirname, '../uploads/temp'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check Azure authentication status
    let azureStatus = 'Not Configured';
    if (process.env.AZURE_SUBSCRIPTION_ID) {
      try {
        const authResult = await azureService.authenticateWithAzureCLI();
        azureStatus = authResult.success ? 'Connected' : 'Authentication Failed';
      } catch (error) {
        azureStatus = 'Error: ' + error.message;
      }
    }

    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      azure: {
        status: azureStatus,
        subscription: process.env.AZURE_SUBSCRIPTION_ID ? 'Configured' : 'Not Set',
        region: process.env.AZURE_LOCATION || 'southeastasia',
        resourceGroup: 'cloud-broker-seasia-rg',
        deploymentTarget: process.env.DEPLOYMENT_TARGET || 'containerapp'
      },
      server: {
        port: PORT,
        nodeVersion: process.version,
        uptime: process.uptime()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Cloud Broker Backend API is working!',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Import and use route handlers
try {
  app.use('/api/upload', require('./routes/upload'));
  app.use('/api/deployment', require('./routes/deployment'));
  app.use('/api/azure', require('./routes/azure'));
  console.log('✅ All route handlers loaded successfully');
} catch (error) {
  console.error('❌ Error loading route handlers:', error.message);
  process.exit(1);
}

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({ 
    name: 'Cloud Broker Backend API',
    version: '2.0.0',
    description: 'Backend service for deploying code to Azure Cloud with real public URLs',
    features: [
      'File upload and code analysis',
      'Automatic Dockerfile generation',
      'Real Azure Container Apps deployment',
      'Public URL generation',
      'Resource monitoring and management'
    ],
    endpoints: {
      health: 'GET /api/health - Service health check',
      upload: 'POST /api/upload - Upload and process code files',
      deploy: 'POST /api/deployment/:projectId - Deploy project to Azure',
      status: 'GET /api/deployment/:projectId/status - Get deployment status',
      metrics: 'GET /api/deployment/:projectId/metrics - Get deployment metrics',
      delete: 'DELETE /api/deployment/:projectId - Delete deployment',
      azure: 'GET /api/azure/status - Azure service status'
    },
    documentation: 'Visit the frontend at http://localhost:3000 for the web interface'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route Not Found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/test',
      'POST /api/upload',
      'POST /api/deployment/:projectId',
      'GET /api/deployment/:projectId/status'
    ]
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', reason);
  // Don't exit in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Start the server
const server = app.listen(PORT, () => {
  console.log('\n🚀 Cloud Broker Backend Server Started Successfully!');
  console.log('═══════════════════════════════════════════════════');
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`☁️  Azure Region: ${process.env.AZURE_LOCATION || 'southeastasia'}`);
  console.log(`🔑 Azure Subscription: ${process.env.AZURE_SUBSCRIPTION_ID ? '✅ Configured' : '❌ Not Configured'}`);
  console.log(`🎯 Deployment Target: ${process.env.DEPLOYMENT_TARGET || 'containerapp'}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Frontend: http://localhost:3000 (if running)`);
  console.log('═══════════════════════════════════════════════════');
  
  // Log Azure service status
  if (process.env.AZURE_SUBSCRIPTION_ID) {
    console.log('🔐 Checking Azure authentication...');
    azureService.authenticateWithAzureCLI()
      .then(result => {
        if (result.success) {
          console.log('✅ Azure CLI authentication successful!');
        } else {
          console.log('❌ Azure CLI authentication failed:', result.message);
        }
      })
      .catch(error => {
        console.log('⚠️  Azure authentication check failed:', error.message);
      });
  } else {
    console.log('⚠️  Azure not configured - running in demo mode');
  }
});

// Export for testing
module.exports = app;