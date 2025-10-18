const { DefaultAzureCredential } = require('@azure/identity');
const { ContainerInstanceManagementClient } = require('@azure/arm-containerinstance');
const { NetworkManagementClient } = require('@azure/arm-network');

class SecureAzureService {
  constructor() {
    this.subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
    this.resourceGroupName = process.env.AZURE_RESOURCE_GROUP || 'cloud-broker-rg';
    this.location = process.env.AZURE_LOCATION || 'East US';
    this.credential = new DefaultAzureCredential();
  }

  async deploySecureContainer(projectInfo, buildInfo, accessType = 'private') {
    try {
      await this.initializeClients();
      const containerName = `app-${projectInfo.clientId}-${projectInfo.projectId.substring(0, 8)}`;
      
      let containerGroupDefinition;
      
      if (accessType === 'private') {
        // Deploy with private IP only
        containerGroupDefinition = {
          location: this.location,
          containers: [
            {
              name: containerName,
              image: this.getBaseImage(projectInfo.runtime),
              resources: {
                requests: {
                  cpu: 0.5,
                  memoryInGB: 1
                }
              },
              ports: [
                {
                  port: projectInfo.appPort,
                  protocol: 'TCP'
                }
              ],
              environmentVariables: [
                {
                  name: 'PORT',
                  value: projectInfo.appPort.toString()
                },
                {
                  name: 'NODE_ENV',
                  value: 'production'
                },
                {
                  name: 'ACCESS_MODE',
                  value: 'private'
                }
              ]
            }
          ],
          osType: 'Linux',
          // NO public IP - only accessible within VNet
          restartPolicy: 'Always',
          tags: {
            project: 'cloud-broker',
            clientId: projectInfo.clientId,
            runtime: projectInfo.runtime,
            accessType: 'private'
          }
        };
      } else if (accessType === 'authenticated') {
        // Deploy with public IP but require authentication
        containerGroupDefinition = {
          location: this.location,
          containers: [
            {
              name: containerName,
              image: this.getBaseImage(projectInfo.runtime),
              resources: {
                requests: {
                  cpu: 0.5,
                  memoryInGB: 1
                }
              },
              ports: [
                {
                  port: projectInfo.appPort,
                  protocol: 'TCP'
                }
              ],
              environmentVariables: [
                {
                  name: 'PORT',
                  value: projectInfo.appPort.toString()
                },
                {
                  name: 'REQUIRE_AUTH',
                  value: 'true'
                },
                {
                  name: 'AUTH_TOKEN',
                  value: this.generateAccessToken(projectInfo.clientId)
                }
              ]
            }
          ],
          osType: 'Linux',
          ipAddress: {
            type: 'Public',
            ports: [
              {
                port: projectInfo.appPort,
                protocol: 'TCP'
              }
            ]
          },
          restartPolicy: 'Always',
          tags: {
            project: 'cloud-broker',
            clientId: projectInfo.clientId,
            runtime: projectInfo.runtime,
            accessType: 'authenticated'
          }
        };
      } else {
        // Public access (current behavior)
        containerGroupDefinition = {
          location: this.location,
          containers: [
            {
              name: containerName,
              image: this.getBaseImage(projectInfo.runtime),
              resources: {
                requests: {
                  cpu: 0.5,
                  memoryInGB: 1
                }
              },
              ports: [
                {
                  port: projectInfo.appPort,
                  protocol: 'TCP'
                }
              ]
            }
          ],
          osType: 'Linux',
          ipAddress: {
            type: 'Public',
            ports: [
              {
                port: projectInfo.appPort,
                protocol: 'TCP'
              }
            ]
          },
          restartPolicy: 'Always',
          tags: {
            project: 'cloud-broker',
            clientId: projectInfo.clientId,
            runtime: projectInfo.runtime,
            accessType: 'public'
          }
        };
      }

      console.log(`🔒 Deploying container with ${accessType} access: ${containerName}`);
      
      const deployment = await this.containerClient.containerGroups.beginCreateOrUpdate(
        this.resourceGroupName,
        containerName,
        containerGroupDefinition
      );

      const result = await deployment.pollUntilDone();
      
      let accessInfo;
      if (accessType === 'private') {
        accessInfo = {
          accessType: 'private',
          message: 'Application deployed with private access only',
          vnetAccess: 'Required'
        };
      } else if (accessType === 'authenticated') {
        const token = this.generateAccessToken(projectInfo.clientId);
        accessInfo = {
          accessType: 'authenticated',
          publicUrl: `http://${result.ipAddress.ip}:${projectInfo.appPort}`,
          accessToken: token,
          authHeader: `Authorization: Bearer ${token}`
        };
      } else {
        accessInfo = {
          accessType: 'public',
          publicUrl: `http://${result.ipAddress.ip}:${projectInfo.appPort}`,
          warning: 'This application is publicly accessible by anyone'
        };
      }
      
      return {
        containerName,
        ipAddress: result.ipAddress?.ip,
        status: result.provisioningState,
        resourceGroup: this.resourceGroupName,
        ...accessInfo
      };
      
    } catch (error) {
      console.error('Secure deployment failed:', error);
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }

  generateAccessToken(clientId) {
    const crypto = require('crypto');
    const payload = {
      clientId,
      timestamp: Date.now(),
      expiresIn: 24 * 60 * 60 * 1000 // 24 hours
    };
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }

  async initializeClients() {
    this.containerClient = new ContainerInstanceManagementClient(
      this.credential, 
      this.subscriptionId
    );
    this.networkClient = new NetworkManagementClient(
      this.credential,
      this.subscriptionId
    );
  }

  getBaseImage(runtime) {
    const images = {
      'node': 'node:18-alpine',
      'python': 'python:3.11-slim',
      'dotnet': 'mcr.microsoft.com/dotnet/aspnet:6.0',
      'java': 'openjdk:11-jre-slim'
    };
    
    return images[runtime] || 'alpine:latest';
  }
}

module.exports = new SecureAzureService();