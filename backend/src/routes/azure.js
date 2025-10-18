const express = require('express');
const azureService = require('../services/azure');

const router = express.Router();

// Authenticate with Azure (browser-based)
router.post('/authenticate', async (req, res) => {
  try {
    // For demo purposes, provide instructions for manual authentication
    res.json({
      success: false,
      error: 'Manual authentication required',
      message: 'Please set up Azure credentials manually for this demo',
      instructions: [
        'Option 1: Set AZURE_SUBSCRIPTION_ID environment variable',
        'Option 2: Use Azure CLI: az login (if installed)',
        'Option 3: Continue with upload/processing without Azure deployment'
      ],
      demoMode: true
    });
  } catch (error) {
    console.error('Azure authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
});

// Check Azure connection and configuration
router.get('/health', async (req, res) => {
  try {
    // Basic configuration check
    const config = {
      subscriptionId: !!process.env.AZURE_SUBSCRIPTION_ID,
      resourceGroup: azureService.resourceGroupName,
      location: azureService.location,
      configured: !!process.env.AZURE_SUBSCRIPTION_ID
    };

    res.json({
      success: true,
      message: 'Azure service status',
      data: config
    });

  } catch (error) {
    console.error('Azure health check error:', error);
    res.status(500).json({
      error: 'Azure health check failed',
      message: error.message
    });
  }
});

// Get Azure resource group status
router.get('/resource-group', async (req, res) => {
  try {
    const result = await azureService.ensureResourceGroup();
    
    res.json({
      success: true,
      message: 'Resource group ready',
      data: {
        name: azureService.resourceGroupName,
        location: azureService.location,
        status: 'ready'
      }
    });

  } catch (error) {
    console.error('Resource group check error:', error);
    res.status(500).json({
      error: 'Resource group check failed',
      message: error.message,
      suggestion: 'Please ensure Azure credentials are configured and subscription ID is set'
    });
  }
});

// List all deployments
router.get('/deployments', async (req, res) => {
  try {
    const deployments = await azureService.listDeployments();
    
    res.json({
      success: true,
      message: 'Deployments retrieved',
      data: deployments
    });

  } catch (error) {
    console.error('List deployments error:', error);
    res.status(500).json({
      error: 'Failed to list deployments',
      message: error.message
    });
  }
});

// Get deployment status
router.get('/deployment/:containerName/status', async (req, res) => {
  try {
    const { containerName } = req.params;
    const status = await azureService.getDeploymentStatus(containerName);
    
    res.json({
      success: true,
      message: 'Deployment status retrieved',
      data: status
    });

  } catch (error) {
    console.error('Deployment status error:', error);
    res.status(500).json({
      error: 'Failed to get deployment status',
      message: error.message
    });
  }
});

// Get deployment metrics
router.get('/deployment/:containerName/metrics', async (req, res) => {
  try {
    const { containerName } = req.params;
    const metrics = await azureService.getMetrics(containerName);
    
    res.json({
      success: true,
      message: 'Metrics retrieved',
      data: metrics
    });

  } catch (error) {
    console.error('Metrics retrieval error:', error);
    res.status(500).json({
      error: 'Failed to get metrics',
      message: error.message
    });
  }
});

// Delete deployment
router.delete('/deployment/:containerName', async (req, res) => {
  try {
    const { containerName } = req.params;
    const result = await azureService.deleteDeployment(containerName);
    
    res.json({
      success: true,
      message: 'Deployment deletion initiated',
      data: result
    });

  } catch (error) {
    console.error('Deployment deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete deployment',
      message: error.message
    });
  }
});

module.exports = router;