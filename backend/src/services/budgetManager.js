const { BillingManagementClient } = require('@azure/arm-billing');
const { ConsumptionManagementClient } = require('@azure/arm-consumption');
const { MonitorManagementClient } = require('@azure/arm-monitor');
const { DefaultAzureCredential } = require('@azure/identity');

class AzureBudgetManager {
  constructor() {
    this.subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
    this.credential = new DefaultAzureCredential();
    this.studentBudgetLimit = 100; // $100 Azure Student Credit
    this.alertThresholds = [50, 80, 95]; // Alert at 50%, 80%, and 95%
  }

  async initializeClients() {
    this.consumptionClient = new ConsumptionManagementClient(
      this.credential,
      this.subscriptionId
    );
    this.monitorClient = new MonitorManagementClient(
      this.credential,
      this.subscriptionId
    );
  }

  async createBudgetAlerts() {
    try {
      await this.initializeClients();

      // Create budget for Cloud Broker project
      const budgetName = 'cloud-broker-budget';
      const budget = {
        category: 'Cost',
        amount: this.studentBudgetLimit,
        timeGrain: 'Monthly',
        timePeriod: {
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        },
        filters: {
          resourceGroups: [process.env.AZURE_RESOURCE_GROUP]
        },
        notifications: {
          // 50% Alert
          'alert-50': {
            enabled: true,
            operator: 'GreaterThan',
            threshold: 50,
            contactEmails: [], // Will be configured via environment
            contactGroups: [],
            contactRoles: ['Owner', 'Contributor'],
            thresholdType: 'Actual'
          },
          // 80% Alert (Critical)
          'alert-80': {
            enabled: true,
            operator: 'GreaterThan',
            threshold: 80,
            contactEmails: [], // Will be configured via environment
            contactGroups: [],
            contactRoles: ['Owner', 'Contributor'],
            thresholdType: 'Actual'
          },
          // 95% Alert (Immediate Action Required)
          'alert-95': {
            enabled: true,
            operator: 'GreaterThan',
            threshold: 95,
            contactEmails: [], // Will be configured via environment
            contactGroups: [],
            contactRoles: ['Owner', 'Contributor'],
            thresholdType: 'Actual'
          }
        }
      };

      console.log('🔔 Creating budget alerts for Cloud Broker project...');
      console.log(`💰 Budget limit: $${this.studentBudgetLimit}`);
      console.log(`📊 Alert thresholds: ${this.alertThresholds.join('%, ')}%`);

      return budget;
    } catch (error) {
      console.error('Failed to create budget alerts:', error.message);
      throw error;
    }
  }

  async getCurrentSpending() {
    try {
      await this.initializeClients();

      // Get current month's usage
      const startDate = new Date();
      startDate.setDate(1); // First day of current month
      
      const endDate = new Date();
      
      const usageDetails = await this.consumptionClient.usageDetails.list(
        `/subscriptions/${this.subscriptionId}`,
        {
          expand: 'properties/additionalInfo',
          filter: `properties/usageStart ge '${startDate.toISOString()}' and properties/usageEnd le '${endDate.toISOString()}'`,
          top: 100
        }
      );

      let totalCost = 0;
      const resourceCosts = {};

      for await (const usage of usageDetails) {
        if (usage.pretaxCost) {
          totalCost += usage.pretaxCost;
          
          const resourceGroup = usage.resourceGroup || 'Unknown';
          if (!resourceCosts[resourceGroup]) {
            resourceCosts[resourceGroup] = 0;
          }
          resourceCosts[resourceGroup] += usage.pretaxCost;
        }
      }

      const budgetUsage = (totalCost / this.studentBudgetLimit) * 100;
      
      return {
        totalSpent: totalCost,
        budgetLimit: this.studentBudgetLimit,
        percentageUsed: budgetUsage,
        remainingBudget: this.studentBudgetLimit - totalCost,
        resourceBreakdown: resourceCosts,
        alertStatus: this.getAlertStatus(budgetUsage),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get current spending:', error.message);
      return {
        totalSpent: 0,
        budgetLimit: this.studentBudgetLimit,
        percentageUsed: 0,
        remainingBudget: this.studentBudgetLimit,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  getAlertStatus(percentage) {
    if (percentage >= 95) {
      return {
        level: 'CRITICAL',
        message: 'Budget almost exhausted! Immediate action required.',
        color: 'red'
      };
    } else if (percentage >= 80) {
      return {
        level: 'WARNING',
        message: 'High budget usage detected. Monitor spending closely.',
        color: 'orange'
      };
    } else if (percentage >= 50) {
      return {
        level: 'CAUTION',
        message: 'Half of budget used. Consider optimizing resources.',
        color: 'yellow'
      };
    } else {
      return {
        level: 'HEALTHY',
        message: 'Budget usage is within normal limits.',
        color: 'green'
      };
    }
  }

  // Email notification integration
  async sendBudgetAlert(alertData, userEmail) {
    // Integration with email service (Azure Communication Services, SendGrid, etc.)
    const alertMessage = {
      to: userEmail,
      subject: `🚨 Azure Budget Alert - ${alertData.level}`,
      body: `
        Hello,
        
        Your Azure student account budget alert has been triggered:
        
        💰 Current Spending: $${alertData.totalSpent.toFixed(2)}
        📊 Budget Usage: ${alertData.percentageUsed.toFixed(1)}%
        💳 Remaining Budget: $${alertData.remainingBudget.toFixed(2)}
        
        Alert Level: ${alertData.level}
        Message: ${alertData.message}
        
        Cloud Broker Project Dashboard: http://localhost:3000/dashboard
        
        Best regards,
        Cloud Broker System
      `
    };

    console.log('📧 Budget alert notification:', alertMessage);
    return alertMessage;
  }
}

module.exports = new AzureBudgetManager();