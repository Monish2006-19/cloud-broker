# Cloud Broker - Automated Code-to-Container Pipeline# Cloud Broker - Automated Code-to-Container Pipeline



> Transform your source code into production-ready containerized applications on Microsoft Azure with a single clickA comprehensive automated cloud brokerage system that transforms source code into scalable containerized applications on Microsoft Azure.



[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)## 🚀 Project Overview

[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)

[![Azure](https://img.shields.io/badge/Azure-Container%20Apps-0078D4.svg)](https://azure.microsoft.com/)This system provides a complete **Code-to-Container (C2C)** pipeline with:

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)- **Automated Runtime Detection**: Supports Node.js, Python, .NET, and Java

- **Smart Dockerfile Generation**: Multi-stage builds with security best practices

## 📖 Overview- **Azure Integration**: Deployment to Azure Container Instances

- **Real-time Monitoring**: Live metrics and health monitoring

Cloud Broker is an intelligent automated deployment system that streamlines the process of deploying applications to Azure Cloud. Simply upload your code, and the system automatically:- **Auto-scaling**: Horizontal scaling based on demand



- 🔍 **Detects runtime** (Node.js, Python, Static HTML)## 🏗️ Architecture

- 🐳 **Generates Dockerfile** with best practices

- ☁️ **Deploys to Azure** Container Apps```

- 🌐 **Provides public URL** for instant access┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐

- 📊 **Monitors performance** in real-time│   React Frontend │    │  Node.js Backend │    │   Azure Cloud   │

│                 │◄──►│                 │◄──►│                 │

### Perfect For│ • File Upload   │    │ • C2C Engine    │    │ • Container     │

- Developers who want quick cloud deployments│ • Monitoring    │    │ • Azure SDK     │    │   Instances     │

- Teams needing automated CI/CD pipelines│ • Dashboard     │    │ • API Gateway   │    │ • Auto-scaling  │

- Students learning cloud technologies└─────────────────┘    └─────────────────┘    └─────────────────┘

- Prototyping and proof-of-concept projects```



---## 📋 Prerequisites



## 🏗️ Architecture- **Node.js** (v16 or higher)

- **npm** or **yarn**

```- **Azure Account** (free tier supported)

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐- **Docker** (for advanced features)

│  React Frontend  │◄────►│  Express Backend │◄────►│   Azure Cloud    │

│                  │      │                  │      │                  │## 🛠️ Installation & Setup

│ • File Upload    │      │ • Code Analysis  │      │ • Container Apps │

│ • Deployment UI  │      │ • Docker Gen     │      │ • Auto-scaling   │### 1. Clone and Install

│ • Monitoring     │      │ • Azure SDK      │      │ • Public URLs    │

└──────────────────┘      └──────────────────┘      └──────────────────┘```bash

```# Clone the repository

git clone <repository-url>

---cd "Cloud Broker"



## ✨ Features# Install backend dependencies

cd backend

### 🚀 Code-to-Container Pipelinenpm install

- **Automatic Runtime Detection**: Identifies Node.js, Python, or static websites

- **Smart Dockerfile Generation**: Creates optimized, multi-stage Docker images# Install frontend dependencies

- **Dependency Management**: Automatically handles npm, pip, and other package managerscd ../frontend

npm install

### ☁️ Azure Integration```

- **Container Apps Deployment**: Leverages Azure's managed container service

- **Automatic Scaling**: Scales from 0 to multiple replicas based on load### 2. Configure Environment

- **Public URL Generation**: Each deployment gets a unique HTTPS URL

- **Resource Management**: Manages Azure resources efficientlyCopy the environment template and configure your Azure credentials:



### 📊 Monitoring & Management```bash

- **Real-time Status**: Track deployment progress live# In the backend directory

- **Health Monitoring**: Automated health checkscp .env.example .env

- **Log Access**: View application logs directly```

- **Metrics Dashboard**: CPU, memory, and request metrics

Edit `.env` file:

### 🔒 Security```env

- **Environment Variables**: Secure management of secrets# Azure Configuration

- **Azure CLI Authentication**: Uses your existing Azure credentialsAZURE_SUBSCRIPTION_ID=your_subscription_id_here

- **HTTPS by Default**: All deployments use secure connectionsAZURE_RESOURCE_GROUP=cloud-broker-rg

AZURE_LOCATION=East US

---

# Application Configuration

## 📋 PrerequisitesPORT=5000

NODE_ENV=development

Before you begin, ensure you have:```



- **Node.js** v16 or higher ([Download](https://nodejs.org/))### 3. Start the Application

- **Azure Account** ([Free tier available](https://azure.microsoft.com/free/))

- **Azure CLI** installed and configured ([Install Guide](https://docs.microsoft.com/cli/azure/install-azure-cli))```bash

- **Git** (optional, for cloning)# Terminal 1: Start Backend

cd backend

---npm run dev



## 🛠️ Installation# Terminal 2: Start Frontend

cd frontend

### 1. Clone the Repositorynpm start

```

```bash

git clone https://github.com/Monish2006-19/cloud-broker.gitThe application will be available at:

cd cloud-broker- **Frontend**: http://localhost:3000

```- **Backend API**: http://localhost:5000



### 2. Set Up Backend## 🔧 Azure Setup



```bash### Option 1: Azure CLI (Recommended)

cd backend

npm install1. Install Azure CLI

```2. Login to your account:

   ```bash

Create a `.env` file in the `backend` directory:   az login

   ```

```env3. Get your subscription ID:

# Azure Configuration   ```bash

AZURE_SUBSCRIPTION_ID=your_subscription_id_here   az account show --query id --output tsv

AZURE_RESOURCE_GROUP=cloud-broker-rg   ```

AZURE_LOCATION=southeastasia

DEPLOYMENT_TARGET=containerapp### Option 2: Azure Portal



# Application Configuration1. Go to [Azure Portal](https://portal.azure.com)

PORT=50002. Navigate to Subscriptions

NODE_ENV=development3. Copy your Subscription ID



# Security## 📁 Supported Project Types

JWT_SECRET=your_secret_key_here

| Runtime | Detected Files | Default Port | Framework Support |

# Logging|---------|---------------|--------------|-------------------|

LOG_LEVEL=info| **Node.js** | `package.json`, `app.js`, `index.js` | 3000 | Express, Next.js, Nest.js |

```| **Python** | `requirements.txt`, `app.py`, `main.py` | 5000 | Flask, Django, FastAPI |

| **.NET** | `*.csproj`, `*.sln`, `Program.cs` | 80 | ASP.NET Core, Blazor |

### 3. Set Up Frontend| **Java** | `pom.xml`, `build.gradle`, `*.java` | 8080 | Spring Boot, Maven, Gradle |



```bash## 🎯 Usage Workflow

cd ../frontend

npm install### 1. Upload Code

```- Package your application in a `.zip` file

- Include all source code and dependency files

### 4. Configure Azure- Upload through the web interface



```bash### 2. Automatic Processing

# Login to Azure- Runtime detection based on project files

az login- Optimized Dockerfile generation

- Security scanning and optimization

# Set your subscription (if you have multiple)

az account set --subscription "your_subscription_id"### 3. Deploy to Azure

- Automatic Azure Container Instance creation

# Create a resource group- Public URL assignment

az group create --name cloud-broker-rg --location southeastasia- Health monitoring setup



# Create a Container Apps environment### 4. Monitor & Scale

az containerapp env create \- Real-time metrics dashboard

  --name cloud-broker-env \- Automatic scaling based on load

  --resource-group cloud-broker-rg \- Cost optimization

  --location southeastasia

```## 🔍 API Endpoints



---### Upload & Processing

```http

## 🚀 Running the ApplicationPOST /api/upload                    # Upload source code

GET  /api/upload/status/:projectId  # Check processing status

### Development ModeGET  /api/upload/dockerfile/:projectId # Get generated Dockerfile

```

**Terminal 1 - Start Backend:**

```bash### Deployment

cd backend```http

npm startPOST /api/deploy/:projectId         # Deploy to Azure

```GET  /api/deploy/:projectId/status  # Get deployment status

Backend will run on `http://localhost:5000`GET  /api/deploy/:projectId/metrics # Get application metrics

```

**Terminal 2 - Start Frontend:**

```bash### Azure Integration

cd frontend```http

npm startGET  /api/azure/health              # Check Azure connectivity

```GET  /api/azure/deployments         # List all deployments

Frontend will open automatically at `http://localhost:3000`GET  /api/azure/deployment/:name/status # Container status

```

### Production Mode

## 📊 Features Showcase

**Backend:**

```bash### ✅ Completed Features

cd backend- [x] Multi-runtime code detection

NODE_ENV=production npm start- [x] Secure Dockerfile generation

```- [x] Azure Container Instance deployment

- [x] Real-time monitoring dashboard

**Frontend:**- [x] Responsive React interface

```bash- [x] Error handling and logging

cd frontend

npm run build### 🚧 Advanced Features (Roadmap)

# Serve the build folder with your preferred web server- [ ] Azure Kubernetes Service (AKS) integration

```- [ ] Azure Container Registry (ACR) builds

- [ ] CI/CD pipeline integration

---- [ ] Advanced monitoring with Azure Monitor

- [ ] Cost analysis and optimization

## 📖 Usage Guide- [ ] Multi-environment deployments



### Deploying Your First Application## 🛡️ Security Features



1. **Access the Web Interface**- **Multi-stage Docker builds** for smaller, secure images

   - Open your browser to `http://localhost:3000`- **Non-root container execution**

- **Azure Managed Identity** support

2. **Prepare Your Code**- **Secure secret management**

   - Package your application as a `.zip` file- **Network isolation** with Azure VNet integration

   - Ensure it includes:

     - `package.json` (for Node.js apps)## 📈 Monitoring & Metrics

     - `requirements.txt` (for Python apps)

     - `index.html` (for static websites)The system provides comprehensive monitoring:



3. **Upload & Deploy**- **Resource Usage**: CPU, Memory, Network

   - Click "Upload Code" on the homepage- **Application Health**: Response time, Error rates

   - Select your `.zip` file- **Azure Metrics**: Container state, Provisioning status

   - Click "Upload and Process"- **Cost Tracking**: Resource consumption and billing

   - Once processed, click "Deploy to Azure"

## 🔧 Troubleshooting

4. **Access Your Application**

   - Wait 2-5 minutes for deployment### Common Issues

   - Copy the provided public URL

   - Your app is now live! 🎉1. **Azure Authentication Failed**

   - Verify `AZURE_SUBSCRIPTION_ID` is correct

### Example Projects   - Check Azure CLI login status: `az account show`



We've included sample applications in the `sample-apps/` and `test-websites/` directories:2. **Upload Processing Failed**

   - Ensure zip file contains required dependency files

#### Node.js Application   - Check file size (max 100MB)

```bash

cd sample-apps/sample-node-app3. **Deployment Timeout**

zip -r ../node-app.zip .   - Verify Azure quota limits

# Upload node-app.zip via the web interface   - Check resource group permissions

```

### Debug Mode

#### Python Application

```bashEnable debug logging:

cd sample-apps/sample-python-app```env

zip -r ../python-app.zip .NODE_ENV=development

# Upload python-app.zip via the web interfaceLOG_LEVEL=debug

``````



#### Static Website## 🤝 Contributing

```bash

cd test-websites/portfolio-site1. Fork the repository

zip -r ../portfolio.zip .2. Create a feature branch: `git checkout -b feature/amazing-feature`

# Upload portfolio.zip via the web interface3. Commit changes: `git commit -m 'Add amazing feature'`

```4. Push to branch: `git push origin feature/amazing-feature`

5. Open a Pull Request

---

## 📄 License

## 📁 Project Structure

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```

cloud-broker/## 🙋‍♂️ Support

├── backend/                 # Express.js backend server

│   ├── src/For support and questions:

│   │   ├── server.js       # Main server file- Create an issue in the repository

│   │   ├── routes/         # API route handlers- Check the [documentation](docs/)

│   │   │   ├── upload.js   # File upload endpoints- Review [troubleshooting guide](docs/troubleshooting.md)

│   │   │   ├── deployment.js # Deployment endpoints

│   │   │   └── azure.js    # Azure management endpoints## 🎉 Acknowledgments

│   │   └── services/       # Business logic

│   │       ├── azure.js    # Azure SDK integration- Microsoft Azure for cloud infrastructure

│   │       ├── codeToContainer.js # Code analysis- Docker for containerization technology

│   │       └── dockerService.js   # Docker operations- React and Node.js communities for excellent frameworks

│   ├── uploads/            # Temporary upload storage

│   ├── generated/          # Generated Dockerfiles---

│   ├── package.json

│   └── .env               # Configuration (create this)**Built with ❤️ for the Cloud Computing Revolution**
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── App.js         # Main App component
│   │   ├── pages/         # Page components
│   │   │   ├── HomePage.js
│   │   │   ├── UploadPage.js
│   │   │   ├── DeploymentPage.js
│   │   │   └── DashboardPage.js
│   │   ├── components/    # Reusable components
│   │   └── services/      # API client
│   │       └── api.js     # Backend API calls
│   ├── public/
│   └── package.json
│
├── sample-apps/            # Example applications for testing
│   ├── sample-node-app/   # Express.js example
│   └── sample-python-app/ # Flask example
│
├── test-websites/          # Example static websites
│   ├── gaming-site/       # Gaming themed site
│   ├── gaming-website.zip
│   ├── portfolio-site/    # Portfolio template
│   └── portfolio-website.zip
│
├── .gitignore
├── .github/
│   └── copilot-instructions.md
└── README.md              # This file
```

---

## 🔧 Configuration

### Backend Configuration (`.env`)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `AZURE_SUBSCRIPTION_ID` | Your Azure subscription ID | - | ✅ |
| `AZURE_RESOURCE_GROUP` | Azure resource group name | `cloud-broker-rg` | ✅ |
| `AZURE_LOCATION` | Azure region | `southeastasia` | ✅ |
| `DEPLOYMENT_TARGET` | Deployment type | `containerapp` | ✅ |
| `PORT` | Backend server port | `5000` | ❌ |
| `NODE_ENV` | Environment mode | `development` | ❌ |
| `JWT_SECRET` | Secret for JWT tokens | - | ✅ |
| `LOG_LEVEL` | Logging level | `info` | ❌ |

### Frontend Configuration

The frontend automatically connects to `http://localhost:5000` in development. For production, set `REACT_APP_API_URL` environment variable.

---

## 🔌 API Reference

### Upload Endpoints

#### `POST /api/upload`
Upload and process code archive

**Request:**
- Content-Type: `multipart/form-data`
- Body: `codeArchive` (file)

**Response:**
```json
{
  "success": true,
  "data": {
    "projectId": "uuid",
    "runtime": "nodejs",
    "detectedPort": 3000,
    "dockerfileGenerated": true
  }
}
```

### Deployment Endpoints

#### `POST /api/deployment/:projectId`
Deploy project to Azure

**Response:**
```json
{
  "success": true,
  "data": {
    "containerName": "app-name",
    "publicUrl": "https://app-name....azurecontainerapps.io",
    "status": "Running"
  }
}
```

#### `GET /api/deployment/:projectId/status`
Get deployment status

#### `GET /api/deployment/:projectId/metrics`
Get deployment metrics

#### `DELETE /api/deployment/:projectId`
Delete deployment

### Health Check

#### `GET /api/health`
Check system health

**Response:**
```json
{
  "status": "healthy",
  "azure": {
    "status": "Connected",
    "subscription": "Configured"
  }
}
```

---

## 🧪 Testing

### Test the Backend

```bash
cd backend
npm test
```

### Test with Sample Applications

1. Use the provided sample applications in `sample-apps/`
2. Zip the application folder
3. Upload via the web interface
4. Verify deployment completes successfully

### Manual API Testing

```bash
# Health check
curl http://localhost:5000/api/health

# Upload code (replace with your file)
curl -X POST -F "codeArchive=@test-app.zip" http://localhost:5000/api/upload

# Deploy (replace project-id)
curl -X POST http://localhost:5000/api/deployment/{project-id}
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: "Azure authentication failed"**
- **Solution:** Run `az login` and ensure you're logged in
- Verify your subscription ID is correct in `.env`

**Issue: "Port 5000 already in use"**
- **Solution:** Change `PORT` in `.env` or stop the process using port 5000
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <pid> /F

# Linux/Mac
lsof -i :5000
kill -9 <pid>
```

**Issue: "Deployment stuck in 'InProgress'"**
- **Solution:** Azure Container Apps can take 2-5 minutes to provision
- Wait and refresh the status
- Check Azure Portal for any errors

**Issue: "No public URL generated"**
- **Solution:** Ensure ingress is enabled on the Container App
- Verify the Container App has fully provisioned
- Check container logs for startup errors

### Checking Azure Resources

```bash
# List Container Apps
az containerapp list --resource-group cloud-broker-rg --output table

# View Container App details
az containerapp show --name <app-name> --resource-group cloud-broker-rg

# View logs
az containerapp logs show --name <app-name> --resource-group cloud-broker-rg --follow
```

---

## 📊 Performance & Limits

### Azure Container Apps Limits (Free Tier)

- **CPU:** 0.25-0.5 cores per container
- **Memory:** 0.5-1 GB per container
- **Scaling:** 0-10 replicas (configurable)
- **Requests:** Unlimited (subject to Azure quotas)

### File Upload Limits

- **Max File Size:** 100 MB
- **Supported Formats:** `.zip`, `.tar`, `.tar.gz`
- **Timeout:** 5 minutes for deployment operations

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Monish K**  
GitHub: [@Monish2006-19](https://github.com/Monish2006-19)

---

## 🙏 Acknowledgments

- Microsoft Azure for cloud infrastructure
- React and Node.js communities
- All contributors and testers

---

## 📮 Support

For support, email monish.k2023@vitstudent.ac.in or open an issue on GitHub.

---

## 🗺️ Roadmap

- [ ] Support for more runtimes (Go, Rust, .NET)
- [ ] Custom domain support
- [ ] CI/CD pipeline integration
- [ ] Multi-cloud support (AWS, GCP)
- [ ] Docker Compose support
- [ ] Database integration templates
- [ ] Cost optimization features
- [ ] Team collaboration features

---

Made with ❤️ for developers who love automation
