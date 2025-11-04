# Student Dashboard - Deployment Guide

## 🎯 What You Get

A fully functional **Student Management Dashboard** that:
- ✅ Stores student records in Azure Blob Storage (or local fallback)
- ✅ Displays all saved records
- ✅ Works both locally and when deployed to Azure
- ✅ Auto-detects API endpoints

---

## 🚀 Quick Start (2 Minutes)

### Step 1: Start the Backend
```bash
cd backend
node src/server.js
```

You should see:
```
✅ All route handlers loaded successfully
🚀 Cloud Broker Backend Server Started Successfully!
📍 Server URL: http://localhost:5000
```

### Step 2: Test Locally (Optional)

Open in your browser:
- **Test UI:** `backend/test-student-ui.html`
- Add some test students
- Click "View All Records" to verify

### Step 3: Deploy via Cloud Broker

1. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```
   Opens at `http://localhost:3000`

2. **Upload the project:**
   - Go to **Upload** page
   - Select `test-websites/student-dashboard.zip`
   - Click **Upload**

3. **Deploy to Azure:**
   - After upload completes, click **Deploy to Azure**
   - Wait 2-5 minutes for deployment
   - Copy the public URL (e.g., `https://app-client-xxxxx.azurecontainerapps.io`)

4. **Access your live dashboard:**
   - Open the provided URL
   - Start adding student records!

---

## 📊 How It Works

### Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Static HTML    │ API     │  Express.js     │ Azure   │  Blob Storage   │
│  (Frontend)     │────────►│  Backend        │────────►│  or Local File  │
│  • Submit       │  HTTP   │  • Validation   │  SDK    │  • Records      │
│  • View Records │         │  • Storage API  │         │  • JSON Blobs   │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Local Mode
When running on `localhost`:
- Frontend calls: `http://localhost:5000/api/students/...`
- Backend stores in: `backend/uploads/student-records.json`
- Perfect for development

### Deployed Mode
When deployed to Azure:
- Frontend calls: `/api/students/...` (relative path)
- Backend can use Azure Blob Storage (if configured)
- Production-ready

---

## 🔧 API Endpoints Used

The dashboard uses these endpoints:

1. **Store Record**
   ```javascript
   POST /api/students/store
   Body: { roll, name, marks, attendance }
   ```

2. **List Records**
   ```javascript
   GET /api/students/list
   Response: { success: true, count: 2, data: [...] }
   ```

3. **Get Status** (optional)
   ```javascript
   GET /api/students/status
   Response: { storage: { mode: "local" }, totalRecords: 2 }
   ```

---

## 🧪 Testing

### Test 1: API Test Script
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

### Test 2: UI Test Page
```bash
# Start backend
cd backend
node src/server.js

# Open in browser
open backend/test-student-ui.html
```

Add a few students and verify they're saved!

### Test 3: Check Stored Data
```bash
# View stored records
cat backend/uploads/student-records.json
```

You should see JSON array with all records.

---

## 🐛 Troubleshooting

### Issue: "Failed to store record"
**Cause:** Backend not running
**Fix:**
```bash
cd backend
node src/server.js
```

### Issue: "CORS error in console"
**Cause:** Frontend not on localhost:3000
**Fix:** Backend automatically allows localhost:3000 and deployed domains

### Issue: "No records showing"
**Cause:** Records stored but not displayed
**Fix:**
1. Check `backend/uploads/student-records.json` exists
2. Test API directly: `http://localhost:5000/api/students/list`
3. Check browser console for errors

### Issue: "Azure Blob Storage not working"
**Cause:** Azure credentials not configured
**Fix:** System automatically falls back to local storage (no action needed)

To enable Azure:
```bash
export AZURE_STORAGE_ACCOUNT_NAME=your-account
az login
node src/server.js
```

---

## 📁 Files Included

```
student-dashboard.zip
├── index.html          # Main dashboard UI
├── illustration.png    # Dashboard image
└── README.md          # Documentation
```

**Backend Files** (already in cloud-broker):
```
backend/
├── src/
│   ├── routes/students.js          # Student API routes
│   └── services/studentStorage.js  # Storage service
├── test-student-api.js             # API test script
└── test-student-ui.html            # UI test page
```

---

## 🔐 Security Notes

**Current Implementation (Development):**
- ✅ Input validation (roll, name, marks, attendance required)
- ✅ CORS protection (localhost:3000 allowed)
- ⚠️ No authentication (anyone can add/view)
- ⚠️ No encryption (add HTTPS in production)

**For Production:**
1. Add user authentication (JWT/OAuth)
2. Enable HTTPS only
3. Add rate limiting
4. Implement user quotas
5. Add audit logging

---

## 🎨 Customization

### Change Colors
Edit `index.html` (lines 8-40) - Update CSS:
```css
.left{background:#111}              /* Sidebar color */
.right{background:linear-gradient(135deg,#a674ff,#7f5cff)}  /* Main gradient */
button{background:#9c6bff}          /* Button color */
```

### Add More Fields
1. **HTML:** Add input fields in `index.html`
2. **JavaScript:** Update payload in `submitBtn` listener
3. **Backend:** Service auto-handles new fields

### Change API URL
Edit `index.html` (line 85):
```javascript
const API_BASE = 'your-custom-api/students';
```

---

## 📈 Next Steps

After deployment, you can:

1. **Share the URL** - Give your public URL to users
2. **Add more features:**
   - Delete functionality
   - Edit records
   - Search/filter
   - Export to CSV
3. **Monitor usage:**
   - Check Azure metrics
   - View logs in Cloud Broker
4. **Scale as needed:**
   - Azure auto-scales with traffic
   - No code changes needed

---

## 💡 Example Use Cases

- **School Management** - Track student performance
- **Training Programs** - Monitor attendance and scores
- **Online Courses** - Student progress tracking
- **Exam Results** - Store and display marks
- **Demo Application** - Showcase Azure integration

---

## 📞 Support

- **API Documentation:** See `STUDENT_API.md`
- **Project README:** See `README.md`
- **Test Files:**
  - `backend/test-student-api.js`
  - `backend/test-student-ui.html`

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Backend server tested locally
- [ ] Student records can be added
- [ ] Student records can be viewed
- [ ] ZIP file uploaded to Cloud Broker
- [ ] Azure deployment successful
- [ ] Public URL accessible
- [ ] Test with real data
- [ ] Configure Azure Blob Storage (optional)
- [ ] Enable HTTPS (in production)
- [ ] Add authentication (for production)

---

**Ready to deploy? Upload `test-websites/student-dashboard.zip` to Cloud Broker!** 🚀
