# Student Management Dashboard

A modern web application for managing student records with **Azure Blob Storage** integration.

## ✨ Features
- ✅ **Add Student Records** - Store roll number, name, marks, and attendance
- ✅ **View All Records** - Retrieve and display all saved students
- ✅ **Azure Storage** - Automatically stores data in Azure Blob Storage (with local fallback)
- ✅ **Real-time Updates** - Instant save and retrieve functionality
- ✅ **Modern UI** - Beautiful gradient design with responsive layout

## 🚀 Quick Start

### Option 1: Local Testing
1. **Start the Cloud Broker backend:**
   ```bash
   cd backend
   node src/server.js
   ```

2. **Open the test page:**
   - Open `backend/test-student-ui.html` in your browser
   - Or deploy the full dashboard via Cloud Broker

3. **Test the API:**
   ```bash
   node backend/test-student-api.js
   ```

### Option 2: Deploy via Cloud Broker
1. Upload `test-websites/student-dashboard.zip` to Cloud Broker
2. Click **Deploy to Azure**
3. Access your live application at the provided URL

## 🔧 How It Works

### Backend API Endpoints
The Cloud Broker backend provides these student management endpoints:

- **POST** `/api/students/store` - Save a new student record
  ```json
  {
    "roll": "101",
    "name": "John Doe",
    "marks": "85",
    "attendance": "92"
  }
  ```

- **GET** `/api/students/list` - Retrieve all student records
  ```json
  {
    "success": true,
    "count": 2,
    "data": [...]
  }
  ```

- **GET** `/api/students/status` - Get storage status
- **DELETE** `/api/students/:recordId` - Delete a specific record

### Storage System
The system uses **Azure Blob Storage** for data persistence:
- **Azure Mode:** Stores records as JSON blobs in `student-records` container
- **Local Fallback:** If Azure isn't configured, uses local file storage
- **Auto-Detection:** Automatically selects the best storage method

### Frontend Integration
The student dashboard (`index.html`) automatically:
- Detects if running locally or deployed
- Uses correct API endpoints (`localhost:5000` or relative paths)
- Handles errors gracefully with user-friendly messages

## 📁 Project Structure
```
student-dashboard/
├── index.html          # Main dashboard application
├── illustration.png    # Dashboard illustration
└── README.md          # This file
```

## 🔐 Azure Configuration (Optional)

To enable Azure Blob Storage:

1. Set the environment variable:
   ```bash
   AZURE_STORAGE_ACCOUNT_NAME=your-storage-account-name
   ```

2. Authenticate with Azure CLI:
   ```bash
   az login
   ```

3. Restart the backend - it will automatically use Azure Storage

**Note:** Without Azure configuration, the system uses local file storage automatically.

## 🧪 Testing

### API Test Script
Run the automated test:
```bash
cd backend
node test-student-api.js
```

Expected output:
```
✅ Store Response: { success: true, ... }
✅ List Response: { count: 2, data: [...] }
✨ All tests passed!
```

### UI Test Page
Open `backend/test-student-ui.html` in a browser to test the full UI locally.

## 📊 Data Format

Each student record contains:
```json
{
  "id": "101_1761673952992",
  "roll": "101",
  "name": "John Doe",
  "marks": 85,
  "attendance": 92,
  "timestamp": "2025-10-28T17:52:32.991Z"
}
```

## 🎨 Customization

### Change API Endpoint
Edit `index.html` line 85:
```javascript
const API_BASE = 'your-custom-api-url/api/students';
```

### Styling
All CSS is inline in `index.html` for easy customization.

## 🐛 Troubleshooting

**Issue:** "Failed to store record"
- **Solution:** Ensure backend server is running on port 5000

**Issue:** "CORS error"
- **Solution:** Backend automatically allows `localhost:3000` and deployed domains

**Issue:** "Storage initialization failed"
- **Solution:** Check Azure credentials or let it fallback to local storage

## 📝 License
MIT License - Feel free to use and modify!
