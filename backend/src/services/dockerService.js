const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class DockerService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads');
  }

  /**
   * Auto-detect project runtime based on files
   */
  detectRuntime(projectPath) {
    const files = fs.readdirSync(projectPath);
    
    if (files.includes('package.json')) {
      return 'nodejs';
    } else if (files.includes('requirements.txt') || files.includes('app.py') || files.includes('main.py')) {
      return 'python';
    } else if (files.includes('index.php') || files.includes('composer.json')) {
      return 'php';
    } else if (files.includes('Gemfile') || files.some(f => f.endsWith('.rb'))) {
      return 'ruby';
    } else if (files.includes('go.mod') || files.some(f => f.endsWith('.go'))) {
      return 'go';
    } else if (files.includes('pom.xml') || files.includes('build.gradle')) {
      return 'java';
    }
    
    return 'nodejs'; // Default fallback
  }

  /**
   * Generate Dockerfile based on runtime
   */
  generateDockerfile(projectPath, runtime) {
    let dockerfile = '';
    
    switch (runtime) {
      case 'nodejs':
        dockerfile = `
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
        `.trim();
        break;
        
      case 'python':
        dockerfile = `
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt* ./
RUN pip install -r requirements.txt || pip install flask
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
        `.trim();
        break;
        
      case 'php':
        dockerfile = `
FROM php:8.1-apache
COPY . /var/www/html/
EXPOSE 80
        `.trim();
        break;
        
      case 'ruby':
        dockerfile = `
FROM ruby:3.0-slim
WORKDIR /app
COPY Gemfile* ./
RUN bundle install || gem install sinatra
COPY . .
EXPOSE 4567
CMD ["ruby", "app.rb"]
        `.trim();
        break;
        
      case 'go':
        dockerfile = `
FROM golang:1.19-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
        `.trim();
        break;
        
      case 'java':
        dockerfile = `
FROM openjdk:11-jre-slim
WORKDIR /app
COPY . .
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
        `.trim();
        break;
        
      default:
        dockerfile = `
FROM node:18-alpine
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
        `.trim();
    }
    
    return dockerfile;
  }

  /**
   * Create Dockerfile and .dockerignore
   */
  async createDockerFiles(projectPath, runtime) {
    const dockerfile = this.generateDockerfile(projectPath, runtime);
    const dockerfilePath = path.join(projectPath, 'Dockerfile');
    
    // Write Dockerfile
    await fs.writeFile(dockerfilePath, dockerfile);
    
    // Create .dockerignore
    const dockerignore = `
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.DS_Store
*.log
__pycache__
*.pyc
.pytest_cache
    `.trim();
    
    const dockerignorePath = path.join(projectPath, '.dockerignore');
    await fs.writeFile(dockerignorePath, dockerignore);
    
    return { dockerfilePath, dockerignorePath };
  }

  /**
   * Build Docker image
   */
  async buildImage(projectPath, imageName, tag = 'latest') {
    try {
      console.log(`Building Docker image: ${imageName}:${tag}`);
      
      const buildCommand = `docker build -t ${imageName}:${tag} "${projectPath}"`;
      console.log(`Executing: ${buildCommand}`);
      
      const { stdout, stderr } = await execAsync(buildCommand);
      
      if (stderr && !stderr.includes('WARNING')) {
        console.error('Docker build stderr:', stderr);
      }
      
      console.log('Docker build output:', stdout);
      return {
        success: true,
        imageName: `${imageName}:${tag}`,
        output: stdout
      };
      
    } catch (error) {
      console.error('Docker build failed:', error);
      return {
        success: false,
        error: error.message,
        output: error.stdout || '',
        stderr: error.stderr || ''
      };
    }
  }

  /**
   * Tag image for Azure Container Registry
   */
  async tagForACR(localImageName, acrName, repositoryName, tag = 'latest') {
    try {
      const acrImageName = `${acrName}.azurecr.io/${repositoryName}:${tag}`;
      const tagCommand = `docker tag ${localImageName} ${acrImageName}`;
      
      console.log(`Tagging image: ${tagCommand}`);
      const { stdout, stderr } = await execAsync(tagCommand);
      
      return {
        success: true,
        acrImageName,
        output: stdout
      };
      
    } catch (error) {
      console.error('Docker tag failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Push image to Azure Container Registry
   */
  async pushToACR(acrImageName) {
    try {
      console.log(`Pushing image to ACR: ${acrImageName}`);
      const pushCommand = `docker push ${acrImageName}`;
      
      const { stdout, stderr } = await execAsync(pushCommand);
      
      return {
        success: true,
        imageName: acrImageName,
        output: stdout
      };
      
    } catch (error) {
      console.error('Docker push failed:', error);
      return {
        success: false,
        error: error.message,
        stderr: error.stderr || ''
      };
    }
  }

  /**
   * Check if Docker is installed and running
   */
  async checkDockerAvailability() {
    try {
      const { stdout } = await execAsync('docker --version');
      console.log('Docker version:', stdout.trim());
      
      // Test if Docker daemon is running
      await execAsync('docker ps');
      
      return { available: true, version: stdout.trim() };
    } catch (error) {
      console.error('Docker not available:', error.message);
      return { available: false, error: error.message };
    }
  }

  /**
   * Build and prepare image for Azure deployment
   */
  async buildForAzure(projectId, runtime = null) {
    try {
      const projectPath = path.join(this.uploadsDir, projectId);
      
      if (!await fs.pathExists(projectPath)) {
        throw new Error(`Project path not found: ${projectPath}`);
      }

      // Auto-detect runtime if not provided
      if (!runtime) {
        runtime = this.detectRuntime(projectPath);
      }

      console.log(`Detected runtime: ${runtime} for project: ${projectId}`);

      // Create Docker files
      await this.createDockerFiles(projectPath, runtime);

      // Generate image name
      const imageName = `cloudbroker-app-${projectId}`.toLowerCase();

      // Build Docker image
      const buildResult = await this.buildImage(projectPath, imageName);

      if (!buildResult.success) {
        throw new Error(`Docker build failed: ${buildResult.error}`);
      }

      return {
        success: true,
        projectId,
        runtime,
        imageName: buildResult.imageName,
        projectPath,
        buildOutput: buildResult.output
      };

    } catch (error) {
      console.error('Build for Azure failed:', error);
      return {
        success: false,
        error: error.message,
        projectId
      };
    }
  }
}

module.exports = new DockerService();