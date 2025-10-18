const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const azureService = require('../services/azure');

const router = express.Router();

// Deploy processed project to Azure
router.post('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const resultPath = path.join(
      __dirname, 
      '../../uploads', 
      `result_${projectId}.json`
    );

    // Load project information
    if (!await fs.pathExists(resultPath)) {
      console.log(`❌ Project file not found: ${resultPath}`);
      console.log(`📁 Available projects:`);
      
      try {
        const uploadDir = path.join(__dirname, '../../uploads');
        const files = await fs.readdir(uploadDir);
        const resultFiles = files.filter(f => f.startsWith('result_') && f.endsWith('.json'));
        
        if (resultFiles.length > 0) {
          console.log(`   Found ${resultFiles.length} projects:`);
          resultFiles.slice(0, 5).forEach(file => {
            const id = file.replace('result_', '').replace('.json', '');
            console.log(`   - ${id}`);
          });
          if (resultFiles.length > 5) {
            console.log(`   ... and ${resultFiles.length - 5} more`);
          }
        } else {
          console.log(`   No project files found in uploads directory`);
        }
      } catch (listError) {
        console.log(`   Could not list files: ${listError.message}`);
      }
      
      return res.status(404).json({
        error: 'Project not found',
        message: `Please upload and process your code first. Project ID "${projectId}" was not found.`,
        projectId,
        suggestion: 'Go to the homepage and upload your project files first.'
      });
    }

    const projectInfo = await fs.readJson(resultPath);
    
    console.log(`🚀 Starting deployment for project: ${projectId}`);
    console.log(`📋 Runtime: ${projectInfo.runtime}, Port: ${projectInfo.appPort}`);

    let buildInfo;
    
    // For static websites, skip the build process and use simple config
    if (projectInfo.runtime === 'static' || projectInfo.runtime === 'html') {
      console.log('📁 Static website detected - skipping build process');
      buildInfo = {
        imageName: 'nginx:alpine',
        imageTag: 'latest',
        staticWebsite: true
      };
    } else {
      // Build and prepare context for non-static applications
      buildInfo = await azureService.buildAndUploadContext(projectInfo);
    }
    
    // Deploy to Azure
    const deployment = await azureService.deployToAzure(projectInfo, buildInfo);
    
    // Save deployment info
    const deploymentPath = path.join(
      path.dirname(resultPath),
      `deployment_${projectId}.json`
    );
    await fs.writeJson(deploymentPath, {
      ...projectInfo,
      deployment,
      deployedAt: new Date().toISOString(),
      runtime: projectInfo.runtime,
      appPort: projectInfo.appPort
    });

    res.json({
      success: true,
      message: 'Deployment successful',
      data: {
        projectId,
        containerName: deployment.containerName,
        publicUrl: deployment.publicUrl,
        ipAddress: deployment.ipAddress,
        status: deployment.status,
        runtime: projectInfo.runtime,
        port: projectInfo.appPort,
        demoMode: deployment.demoMode,
        deployment: deployment
      }
    });

  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({
      error: 'Deployment failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get deployment status
router.get('/:projectId/status', async (req, res) => {
  try {
    const { projectId } = req.params;
    const deploymentPath = path.join(
      __dirname, 
      '../../uploads', 
      `deployment_${projectId}.json`
    );

    if (!await fs.pathExists(deploymentPath)) {
      return res.status(404).json({
        error: 'Deployment not found',
        projectId
      });
    }

    const deploymentInfo = await fs.readJson(deploymentPath);
    const deployment = deploymentInfo.deployment;
    
    // Get current status from Azure (if not in demo mode)
    let currentStatus = null;
    if (!deployment.demoMode) {
      try {
        currentStatus = await azureService.getDeploymentStatus(deployment.containerName);
        console.log('Live Azure status:', currentStatus);
      } catch (error) {
        console.log('Could not get live status, using cached data:', error.message);
      }
    }
    
    // Extract the actual deployment info (handle nested structure)
    const actualDeployment = deployment.deployment || deployment;
    
    // Structure the response to match frontend expectations
    const responseData = {
      projectId,
      containerName: deployment.containerName,
      publicUrl: currentStatus?.url || deployment.publicUrl,
      runtime: deploymentInfo.runtime,
      currentStatus,
      deployedAt: deploymentInfo.deployedAt,
      demoMode: deployment.demoMode || false,
      deployment: {
        containerName: deployment.containerName,
        buildInfo: actualDeployment.buildInfo || {
          registry: 'cloud-broker-registry.azurecr.io',
          buildId: actualDeployment.buildId || 'build-' + Date.now(),
          imageTag: actualDeployment.imageTag || 'latest'
        },
        deployedAt: actualDeployment.deployedAt || deploymentInfo.deployedAt
      },
      status: currentStatus?.status || deployment.status || 'Running',
      location: currentStatus?.location || deployment.location,
      resourceGroup: currentStatus?.resourceGroup || deployment.resourceGroup
    };
    
    res.json({
      success: true,
      data: responseData
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
router.get('/:projectId/metrics', async (req, res) => {
  try {
    const { projectId } = req.params;
    const deploymentPath = path.join(
      __dirname, 
      '../../uploads', 
      `deployment_${projectId}.json`
    );

    if (!await fs.pathExists(deploymentPath)) {
      return res.status(404).json({
        error: 'Deployment not found',
        projectId
      });
    }

    const deploymentInfo = await fs.readJson(deploymentPath);
    const containerName = deploymentInfo.deployment.containerName;
    
    // Get metrics from Azure
    console.log(`📊 Getting metrics for container: ${containerName}`);
    const metrics = await azureService.getMetrics(containerName);
    console.log(`📊 Retrieved metrics:`, JSON.stringify(metrics, null, 2));
    
    res.json({
      success: true,
      data: {
        projectId,
        containerName,
        metrics: metrics.metrics,
        timestamp: metrics.timestamp
      }
    });

  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({
      error: 'Failed to get metrics',
      message: error.message
    });
  }
});

// Delete deployment
router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const deploymentPath = path.join(
      __dirname, 
      '../../uploads', 
      `deployment_${projectId}.json`
    );

    if (!await fs.pathExists(deploymentPath)) {
      return res.status(404).json({
        error: 'Deployment not found',
        projectId
      });
    }

    const deploymentInfo = await fs.readJson(deploymentPath);
    const containerName = deploymentInfo.deployment.containerName;
    
    // Delete from Azure
    await azureService.deleteDeployment(containerName);
    
    // Remove local deployment info
    await fs.remove(deploymentPath);
    
    res.json({
      success: true,
      message: 'Deployment deleted',
      data: {
        projectId,
        containerName
      }
    });

  } catch (error) {
    console.error('Deployment deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete deployment',
      message: error.message
    });
  }
});

// List all deployments
router.get('/', async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const files = await fs.readdir(uploadsDir);
    const deploymentFiles = files.filter(file => file.startsWith('deployment_') && file.endsWith('.json'));
    
    const deployments = [];
    for (const file of deploymentFiles) {
      try {
        const deploymentInfo = await fs.readJson(path.join(uploadsDir, file));
        deployments.push({
          projectId: deploymentInfo.projectId,
          clientId: deploymentInfo.clientId,
          runtime: deploymentInfo.runtime,
          containerName: deploymentInfo.deployment.containerName,
          publicUrl: deploymentInfo.deployment.publicUrl,
          deployedAt: deploymentInfo.deployedAt
        });
      } catch (error) {
        console.warn(`Failed to read deployment file ${file}:`, error.message);
      }
    }
    
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

module.exports = router;