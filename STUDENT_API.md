# Student Management API Documentation

## Overview

The Cloud Broker backend provides a complete RESTful API for managing student records with Azure Blob Storage integration.

## Base URL

- **Local Development:** `http://localhost:5000/api/students`
- **Deployed:** `/api/students` (relative to your deployment URL)

---

## Endpoints

### 1. Store Student Record

**POST** `/api/students/store`

Store a new student record in Azure Blob Storage (or local storage if Azure is not configured).

**Request Body:**
```json
{
  "roll": "101",
  "name": "John Doe",
  "marks": "85",
  "attendance": "92",
  "timestamp": "2025-10-28T17:52:32.991Z"  // Optional
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "message": "Student record stored successfully",
  "data": {
    "success": true,
    "id": "101_1761673952992",
    "storage": "local"
  }
}
```

**Error Response:** (400 Bad Request)
```json
{
  "error": "Missing required fields",
  "message": "Please provide roll, name, marks, and attendance"
}
```

---

### 2. List All Student Records

**GET** `/api/students/list`

Retrieve all student records, sorted by timestamp (newest first).

**Request:** No body required

**Response:** (200 OK)
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "102_1761673953513",
      "roll": "102",
      "name": "Jane Smith",
      "marks": 92,
      "attendance": 88,
      "timestamp": "2025-10-28T17:52:33.513Z"
    },
    {
      "id": "101_1761673952992",
      "roll": "101",
      "name": "John Doe",
      "marks": 85,
      "attendance": 92,
      "timestamp": "2025-10-28T17:52:32.991Z"
    }
  ]
}
```

---

### 3. Get Storage Status

**GET** `/api/students/status`

Get the current status of the student storage system.

**Request:** No body required

**Response:** (200 OK)
```json
{
  "success": true,
  "storage": {
    "mode": "local",
    "containerName": "student-records",
    "initialized": true
  },
  "totalRecords": 2
}
```

**Storage Modes:**
- `local` - Using local file storage (`backend/uploads/student-records.json`)
- `azure` - Using Azure Blob Storage

---

### 4. Delete Student Record

**DELETE** `/api/students/:recordId`

Delete a specific student record by ID.

**Parameters:**
- `recordId` - The unique ID of the record (e.g., `101_1761673952992`)

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Student record deleted successfully",
  "data": {
    "success": true,
    "storage": "local"
  }
}
```

**Error Response:** (404 Not Found)
```json
{
  "error": "Record not found",
  "message": "No record exists with the provided ID"
}
```

---

## Data Model

Each student record has the following structure:

```typescript
interface StudentRecord {
  id: string;           // Unique identifier (format: "{roll}_{timestamp}")
  roll: string;         // Roll number
  name: string;         // Student name
  marks: number;        // Marks scored
  attendance: number;   // Attendance percentage
  timestamp: string;    // ISO 8601 timestamp
}
```

---

## Storage Backend

### Azure Blob Storage (Preferred)

When `AZURE_STORAGE_ACCOUNT_NAME` is configured:
- Records stored as JSON blobs in `student-records` container
- Blob naming: `record_{id}.json`
- Public read access enabled
- Automatic authentication via Azure CLI credentials

**Setup:**
```bash
# Set environment variable
export AZURE_STORAGE_ACCOUNT_NAME=yourstorageaccount

# Login to Azure
az login

# Restart backend server
node src/server.js
```

### Local File Storage (Fallback)

When Azure is not configured:
- Records stored in `backend/uploads/student-records.json`
- JSON array format
- Automatic directory creation
- Perfect for development and testing

---

## Example Usage

### JavaScript (Fetch API)

```javascript
// Store a record
async function storeStudent() {
  const response = await fetch('http://localhost:5000/api/students/store', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roll: '101',
      name: 'John Doe',
      marks: '85',
      attendance: '92'
    })
  });
  const data = await response.json();
  console.log(data);
}

// List all records
async function listStudents() {
  const response = await fetch('http://localhost:5000/api/students/list');
  const data = await response.json();
  console.log(data.data);
}
```

### cURL

```bash
# Store a record
curl -X POST http://localhost:5000/api/students/store \
  -H "Content-Type: application/json" \
  -d '{"roll":"101","name":"John Doe","marks":"85","attendance":"92"}'

# List all records
curl http://localhost:5000/api/students/list

# Get status
curl http://localhost:5000/api/students/status

# Delete a record
curl -X DELETE http://localhost:5000/api/students/101_1761673952992
```

### PowerShell

```powershell
# Store a record
$body = @{
  roll = '101'
  name = 'John Doe'
  marks = '85'
  attendance = '92'
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:5000/api/students/store' `
  -Method POST -Body $body -ContentType 'application/json'

# List all records
Invoke-WebRequest -Uri 'http://localhost:5000/api/students/list' | 
  Select-Object -ExpandProperty Content
```

---

## Testing

### Automated Test
Run the test script to verify all endpoints:

```bash
cd backend
node test-student-api.js
```

### Manual UI Test
Open `backend/test-student-ui.html` in your browser for a visual test interface.

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error category",
  "message": "Detailed error description"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side error

---

## CORS Configuration

The API automatically allows:
- `http://localhost:3000` (React frontend)
- Deployed frontend domains (in production)

---

## Rate Limiting

Currently no rate limiting is implemented. For production use, consider adding:
- Request throttling
- API key authentication
- User-based quotas

---

## Security Considerations

**Current Implementation:**
- ✅ Input validation
- ✅ CORS protection
- ✅ Error sanitization
- ⚠️ No authentication (add for production)
- ⚠️ No encryption (Azure handles this)

**For Production:**
- Add JWT authentication
- Implement role-based access control
- Enable HTTPS only
- Add request signing
- Implement audit logging

---

## License

MIT License - See LICENSE file for details
