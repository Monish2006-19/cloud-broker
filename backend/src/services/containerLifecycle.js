const azureService = require('./azure');

class ContainerLifecycleManager {
  constructor() {
    this.deploymentRegistry = new Map(); // Track active deployments
    this.cleanupInterval = 5 * 60 * 1000; // Check every 5 minutes
    this.facultyDemoMode = true; // Enable automatic cleanup for demos
  }

  // Register a new deployment
  registerDeployment(projectId, deploymentInfo) {
    const deployment = {
      ...deploymentInfo,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
      demoMode: this.facultyDemoMode
    };

    this.deploymentRegistry.set(projectId, deployment);
    console.log(`📝 Registered deployment: ${projectId}`);

    // Start monitoring this deployment
    this.startDeploymentMonitoring(projectId);
  }

  // Update deployment activity (when user interacts with it)
  updateActivity(projectId) {
    const deployment = this.deploymentRegistry.get(projectId);
    if (deployment) {
      deployment.lastActivity = new Date();
      deployment.isActive = true;
      console.log(`🔄 Updated activity for: ${projectId}`);
    }
  }

  // Mark deployment as stopped by user
  stopDeployment(projectId) {
    const deployment = this.deploymentRegistry.get(projectId);
    if (deployment) {
      deployment.isActive = false;
      deployment.stoppedAt = new Date();
      console.log(`⏹️ Deployment stopped by user: ${projectId}`);

      // Immediate cleanup for faculty demo
      if (this.facultyDemoMode) {
        this.scheduleCleanup(projectId, 30000); // 30 seconds delay
      }
    }
  }

  // Schedule cleanup for a deployment
  scheduleCleanup(projectId, delay = 0) {
    setTimeout(async () => {
      await this.cleanupDeployment(projectId);
    }, delay);
  }

  // Cleanup a specific deployment
  async cleanupDeployment(projectId) {
    try {
      const deployment = this.deploymentRegistry.get(projectId);
      if (!deployment) {
        console.log(`⚠️ Deployment not found for cleanup: ${projectId}`);
        return;
      }

      console.log(`🧹 Starting cleanup for: ${projectId}`);

      // Delete from Azure
      if (deployment.containerName) {
        await azureService.deleteDeployment(deployment.containerName);
        console.log(`☁️ Azure container deleted: ${deployment.containerName}`);
      }

      // Remove from registry
      this.deploymentRegistry.delete(projectId);

      // Log cleanup
      const cleanupInfo = {
        projectId,
        containerName: deployment.containerName,
        createdAt: deployment.createdAt,
        cleanedAt: new Date(),
        reason: deployment.isActive ? 'Auto-cleanup' : 'User-stopped',
        runtime: deployment.runtime,
        costSaved: this.estimateCostSaved(deployment)
      };

      console.log(`✅ Cleanup completed:`, cleanupInfo);
      return cleanupInfo;

    } catch (error) {
      console.error(`❌ Cleanup failed for ${projectId}:`, error.message);
    }
  }

  // Start monitoring a deployment for auto-cleanup
  startDeploymentMonitoring(projectId) {
    const monitoringInterval = setInterval(async () => {
      const deployment = this.deploymentRegistry.get(projectId);
      
      if (!deployment) {
        clearInterval(monitoringInterval);
        return;
      }

      // Check if deployment should be cleaned up
      const shouldCleanup = this.shouldCleanupDeployment(deployment);
      
      if (shouldCleanup.cleanup) {
        console.log(`🔔 Auto-cleanup triggered for ${projectId}: ${shouldCleanup.reason}`);
        clearInterval(monitoringInterval);
        await this.cleanupDeployment(projectId);
      }
    }, this.cleanupInterval);
  }

  // Determine if a deployment should be cleaned up
  shouldCleanupDeployment(deployment) {
    const now = new Date();
    const timeSinceCreation = now - deployment.createdAt;
    const timeSinceActivity = now - deployment.lastActivity;

    // Faculty demo mode: cleanup stopped deployments quickly
    if (this.facultyDemoMode && !deployment.isActive) {
      return {
        cleanup: true,
        reason: 'Faculty demo - deployment stopped by user'
      };
    }

    // Auto-cleanup after 2 hours of inactivity (for cost savings)
    if (timeSinceActivity > 2 * 60 * 60 * 1000) {
      return {
        cleanup: true,
        reason: 'Inactive for over 2 hours'
      };
    }

    // Force cleanup after 6 hours (prevent runaway costs)
    if (timeSinceCreation > 6 * 60 * 60 * 1000) {
      return {
        cleanup: true,
        reason: 'Maximum runtime exceeded (6 hours)'
      };
    }

    return { cleanup: false };
  }

  // Estimate cost saved by cleanup
  estimateCostSaved(deployment) {
    const runtimeHours = (new Date() - deployment.createdAt) / (1000 * 60 * 60);
    const costPerHour = 0.0012; // Approximate cost for small container instance
    return (runtimeHours * costPerHour).toFixed(4);
  }

  // Get all active deployments
  getActiveDeployments() {
    const active = [];
    for (const [projectId, deployment] of this.deploymentRegistry) {
      if (deployment.isActive) {
        active.push({
          projectId,
          containerName: deployment.containerName,
          runtime: deployment.runtime,
          createdAt: deployment.createdAt,
          lastActivity: deployment.lastActivity,
          uptime: new Date() - deployment.createdAt
        });
      }
    }
    return active;
  }

  // Force cleanup all deployments (for demo reset)
  async cleanupAllDeployments() {
    console.log('🧹 Starting cleanup of all deployments...');
    const cleanupPromises = [];

    for (const projectId of this.deploymentRegistry.keys()) {
      cleanupPromises.push(this.cleanupDeployment(projectId));
    }

    const results = await Promise.allSettled(cleanupPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Cleanup complete: ${successful} successful, ${failed} failed`);
    return { successful, failed };
  }

  // Faculty demo specific methods
  enableFacultyDemoMode() {
    this.facultyDemoMode = true;
    console.log('🎓 Faculty demo mode enabled - aggressive cleanup activated');
  }

  disableFacultyDemoMode() {
    this.facultyDemoMode = false;
    console.log('🏭 Production mode enabled - normal cleanup timers activated');
  }

  // Get cleanup statistics for faculty demo
  getCleanupStats() {
    const activeCount = this.getActiveDeployments().length;
    const totalRegistered = this.deploymentRegistry.size;
    
    return {
      activeDeployments: activeCount,
      totalDeployments: totalRegistered,
      facultyDemoMode: this.facultyDemoMode,
      cleanupInterval: this.cleanupInterval / 1000 / 60, // in minutes
      autoCleanupEnabled: true
    };
  }
}

module.exports = new ContainerLifecycleManager();