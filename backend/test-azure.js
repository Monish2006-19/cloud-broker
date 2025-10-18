const azureService = require('./src/services/azure');

async function testAzureConnection() {
  console.log('🔧 Testing Azure Connection...');
  console.log('📋 Configuration:');
  console.log(`   Subscription ID: ${process.env.AZURE_SUBSCRIPTION_ID}`);
  console.log(`   Resource Group: ${process.env.AZURE_RESOURCE_GROUP}`);
  console.log(`   Location: ${process.env.AZURE_LOCATION}`);
  console.log('');

  try {
    // Test 1: Initialize Azure clients
    console.log('🔗 Test 1: Initializing Azure clients...');
    await azureService.initializeClients();
    console.log('✅ Azure clients initialized successfully');

    // Test 2: Create/verify resource group
    console.log('🏗️ Test 2: Creating resource group...');
    const rg = await azureService.ensureResourceGroup();
    console.log('✅ Resource group ready:', rg.name);

    // Test 3: List existing deployments
    console.log('📋 Test 3: Listing deployments...');
    const deployments = await azureService.listDeployments();
    console.log(`✅ Found ${deployments.length} existing deployments`);

    console.log('');
    console.log('🎉 Azure connection test successful!');
    console.log('💰 Your $100 Azure student credit is ready to use');
    console.log('🚀 You can now deploy applications to Azure');

  } catch (error) {
    console.error('❌ Azure connection test failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('');
      console.log('🔑 Authentication Issue:');
      console.log('1. Run: az login');
      console.log('2. Ensure you\'re logged into the correct account');
      console.log('3. Verify subscription access: az account show');
    } else if (error.message.includes('subscription')) {
      console.log('');
      console.log('📋 Subscription Issue:');
      console.log('1. Verify subscription ID is correct');
      console.log('2. Check if subscription is active');
      console.log('3. Ensure you have Contributor access');
    } else {
      console.log('');
      console.log('🔧 General troubleshooting:');
      console.log('1. Check internet connection');
      console.log('2. Verify Azure CLI is installed: az --version');
      console.log('3. Try: az account clear && az login');
    }
  }
}

// Load environment variables
require('dotenv').config();

// Run the test
testAzureConnection();