const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');
const { v4: uuidv4 } = require('uuid');

class CodeToContainerService {
  constructor() {
    this.supportedRuntimes = {
      'static': {
        files: ['index.html', '.html', '.htm'],
        dockerfile: this.generateStaticDockerfile,
        defaultPort: 80,
        description: 'Static HTML/CSS/JS Website'
      },
      'node': {
        files: ['package.json', 'app.js', 'index.js', 'server.js'],
        dockerfile: this.generateNodeDockerfile,
        defaultPort: 3000,
        description: 'Node.js Application'
      },
      'python': {
        files: ['requirements.txt', 'app.py', 'main.py', 'run.py', 'manage.py'],
        dockerfile: this.generatePythonDockerfile,
        defaultPort: 5000,
        description: 'Python Application'
      },
      'dotnet': {
        files: ['.csproj', '.sln', 'Program.cs'],
        dockerfile: this.generateDotNetDockerfile,
        defaultPort: 80,
        description: '.NET Application'
      },
      'java': {
        files: ['pom.xml', 'build.gradle', '.java'],
        dockerfile: this.generateJavaDockerfile,
        defaultPort: 8080,
        description: 'Java Application'
      }
    };
  }

  async processUpload(filePath, clientId) {
    const extractPath = path.join(path.dirname(filePath), `extracted_${clientId}`);
    const projectId = uuidv4();
    
    try {
      // Extract uploaded zip
      await this.extractZip(filePath, extractPath);
      
      // Detect runtime
      const runtime = await this.detectRuntime(extractPath);
      
      // Generate Dockerfile
      const dockerfileContent = await this.generateDockerfile(runtime, extractPath);
      
      // Detect application port
      const appPort = await this.detectPort(runtime, extractPath);
      
      return {
        projectId,
        clientId,
        runtime: runtime.name,
        extractPath,
        dockerfileContent,
        appPort,
        buildContext: extractPath
      };
    } catch (error) {
      // Cleanup on error
      if (await fs.pathExists(extractPath)) {
        await fs.remove(extractPath);
      }
      throw error;
    }
  }

  async extractZip(zipPath, extractPath) {
    try {
      await fs.ensureDir(extractPath);
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true);
      
      // Check if extraction created a single root directory
      const entries = await fs.readdir(extractPath);
      if (entries.length === 1) {
        const rootDir = path.join(extractPath, entries[0]);
        const stat = await fs.stat(rootDir);
        if (stat.isDirectory()) {
          // Move contents up one level
          const tempDir = `${extractPath}_temp`;
          await fs.move(rootDir, tempDir);
          await fs.remove(extractPath);
          await fs.move(tempDir, extractPath);
        }
      }
    } catch (error) {
      throw new Error(`Failed to extract zip: ${error.message}`);
    }
  }

  async detectRuntime(projectPath) {
    const files = await this.getProjectFiles(projectPath);
    
    // Priority order: Check for specific runtime markers first (package.json, requirements.txt, etc.)
    // before generic markers (HTML files)
    const priorityOrder = ['node', 'python', 'dotnet', 'java', 'static'];
    
    for (const runtimeName of priorityOrder) {
      const config = this.supportedRuntimes[runtimeName];
      for (const file of config.files) {
        if (files.some(f => f.includes(file))) {
          return {
            name: runtimeName,
            config: config,
            detectedFiles: files.filter(f => f.includes(file))
          };
        }
      }
    }
    
    throw new Error('Unsupported runtime detected. Supported: Node.js, Python, .NET, Java, Static HTML');
  }

  async getProjectFiles(projectPath) {
    const files = [];
    
    const walk = async (dir) => {
      const entries = await fs.readdir(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          await walk(fullPath);
        } else if (stat.isFile()) {
          files.push(path.relative(projectPath, fullPath));
        }
      }
    };
    
    await walk(projectPath);
    return files;
  }

  async detectPort(runtime, projectPath) {
    try {
      let port = runtime.config.defaultPort;
      
      if (runtime.name === 'node') {
        port = await this.detectNodePort(projectPath);
      } else if (runtime.name === 'python') {
        port = await this.detectPythonPort(projectPath);
      }
      
      return port;
    } catch (error) {
      console.warn(`Port detection failed, using default: ${error.message}`);
      return runtime.config.defaultPort;
    }
  }

  async detectNodePort(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      
      // Check scripts for port configuration
      if (packageJson.scripts) {
        const startScript = packageJson.scripts.start || packageJson.scripts.dev;
        if (startScript) {
          const portMatch = startScript.match(/PORT[=\s]+(\d+)/i);
          if (portMatch) return parseInt(portMatch[1]);
        }
      }
    }
    
    // Check main application files
    const mainFiles = ['app.js', 'index.js', 'server.js'];
    for (const file of mainFiles) {
      const filePath = path.join(projectPath, file);
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf8');
        const portMatch = content.match(/(?:listen|port).*?(\d{4,5})/i);
        if (portMatch) return parseInt(portMatch[1]);
      }
    }
    
    return 3000; // Default Node.js port
  }

  async detectPythonPort(projectPath) {
    const mainFiles = ['app.py', 'main.py', 'run.py'];
    for (const file of mainFiles) {
      const filePath = path.join(projectPath, file);
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf8');
        const portMatch = content.match(/(?:port|PORT)[=\s]*(\d{4,5})/);
        if (portMatch) return parseInt(portMatch[1]);
      }
    }
    
    return 5000; // Default Python port
  }

  async generateDockerfile(runtime, projectPath) {
    return await runtime.config.dockerfile.call(this, projectPath);
  }

  async generateStaticDockerfile(projectPath) {
    try {
      console.log('🌐 Generating Dockerfile for static website...');
      
      // Check if index.html exists
      const indexPath = path.join(projectPath, 'index.html');
      const hasIndex = await fs.pathExists(indexPath);
      
      if (!hasIndex) {
        // Look for any HTML file as main file
        const files = await fs.readdir(projectPath);
        const htmlFiles = files.filter(f => f.endsWith('.html') || f.endsWith('.htm'));
        
        if (htmlFiles.length === 0) {
          throw new Error('No HTML files found in static website');
        }
      }

      // Generate nginx-based Dockerfile for static content
      const dockerfile = `# Static Website Dockerfile
# Generated by Cloud Broker - Static Site Deployment

FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy static files to nginx directory
COPY . /usr/share/nginx/html/

# Create custom nginx config for SPA support
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \\
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \\
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \\
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \\
    echo '    index index.html index.htm;' >> /etc/nginx/conf.d/default.conf && \\
    echo '    try_files $$uri $$uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \\
    echo '    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$$ {' >> /etc/nginx/conf.d/default.conf && \\
    echo '        expires 1y;' >> /etc/nginx/conf.d/default.conf && \\
    echo '        add_header Cache-Control "public, immutable";' >> /etc/nginx/conf.d/default.conf && \\
    echo '    }' >> /etc/nginx/conf.d/default.conf && \\
    echo '}' >> /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Labels for identification
LABEL maintainer="Cloud Broker System"
LABEL description="Static website deployment"
LABEL runtime="static-nginx"
`;

      console.log('✅ Static website Dockerfile generated successfully');
      return dockerfile;
      
    } catch (error) {
      console.error('❌ Failed to generate static Dockerfile:', error);
      throw new Error(`Static Dockerfile generation failed: ${error.message}`);
    }
  }

  async generateNodeDockerfile(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    let nodeVersion = '18';
    let startScript = 'npm start';
    let appPort = 3000;
    
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      
      // Detect Node version from engines
      if (packageJson.engines && packageJson.engines.node) {
        const version = packageJson.engines.node.replace(/[^\d.]/g, '');
        if (version) nodeVersion = version;
      }
      
      // Determine start command
      if (packageJson.scripts && packageJson.scripts.start) {
        startScript = 'npm start';
      } else if (packageJson.main) {
        startScript = `node ${packageJson.main}`;
      }
    }
    
    // Detect port from server files
    appPort = await this.detectNodePort(projectPath);

    return `# Multi-stage build for Node.js application
FROM node:${nodeVersion}-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production || npm install --production

# Production stage
FROM node:${nodeVersion}-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodeuser -u 1001

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Expose port
EXPOSE ${appPort}

# Start application
CMD ${startScript === 'npm start' ? '["npm", "start"]' : JSON.stringify(startScript.split(' '))}`;
  }

  async generatePythonDockerfile(projectPath) {
    const requirementsPath = path.join(projectPath, 'requirements.txt');
    let pythonVersion = '3.11';
    let startCommand = 'python app.py';
    
    // Detect Python version and start command
    const mainFiles = ['app.py', 'main.py', 'run.py'];
    let foundMainFile = false;
    
    // First, check for common main files
    for (const file of mainFiles) {
      if (await fs.pathExists(path.join(projectPath, file))) {
        startCommand = `python ${file}`;
        foundMainFile = true;
        break;
      }
    }
    
    // If no common main file found, look for any Python file
    if (!foundMainFile) {
      try {
        const files = await fs.readdir(projectPath);
        const pythonFiles = files.filter(f => f.endsWith('.py'));
        
        if (pythonFiles.length > 0) {
          // Use the first Python file found
          startCommand = `python ${pythonFiles[0]}`;
          console.log(`🐍 Using Python file: ${pythonFiles[0]}`);
        }
      } catch (error) {
        console.warn('Could not read directory to find Python files:', error.message);
      }
    }

    return `# Multi-stage build for Python application
FROM python:${pythonVersion}-slim AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt* ./
RUN pip install --user --no-cache-dir -r requirements.txt

# Production stage
FROM python:${pythonVersion}-slim AS production

WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy Python packages from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R appuser:appuser /app
USER appuser

# Make sure scripts in .local are usable
ENV PATH=/home/appuser/.local/bin:$PATH

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD python -c "import requests; requests.get('http://localhost:5000/health')" || exit 1

# Start application
CMD ["${startCommand}"]`;
  }

  async generateDotNetDockerfile(projectPath) {
    return `# Multi-stage build for .NET application
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY *.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "YourApp.dll"]`;
  }

  async generateJavaDockerfile(projectPath) {
    return `# Multi-stage build for Java application
FROM openjdk:11-jdk-slim AS build
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

FROM openjdk:11-jre-slim AS production
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`;
  }
}

module.exports = new CodeToContainerService();