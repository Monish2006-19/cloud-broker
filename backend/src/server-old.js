const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Increase timeout for Azure deployment operations
app.use((req, res, next) => {
  // Set timeout to 5 minutes for deployment endpoints
  if (req.path.includes('/deployment')) {
    req.setTimeout(300000); // 5 minutes
    res.setTimeout(300000); // 5 minutes
  }
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure uploads directory exists
fs.ensureDirSync(path.join(__dirname, '../uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/upload', require('./routes/upload'));
app.use('/api/deployment', require('./routes/deployment'));
app.use('/api/azure', require('./routes/azure'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Cloud Broker Backend API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'POST /api/upload',
      'GET /api/deploy',
      'POST /api/deploy/:projectId',
      'GET /api/deploy/:projectId/status',
      'GET /api/deploy/:projectId/metrics',
      'DELETE /api/deploy/:projectId',
      'GET /api/azure/status'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cloud Broker Backend running on port ${PORT}`);
  console.log(`� Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`☁️  Azure Region: ${process.env.AZURE_LOCATION || 'southeastasia'}`);
  console.log(`🔑 Azure Subscription: ${process.env.AZURE_SUBSCRIPTION_ID ? 'Configured' : 'Not Configured'}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;