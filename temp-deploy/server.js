const express = require('express');
const cors = require('cors');
const path = require('path');

// Simple backend with student API
const app = express();
const PORT = process.env.PORT || 8080;

// Import storage service
const studentStorage = require('./services/studentStorage');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Student Management API'
  });
});

// Initialize storage
let storageInitialized = false;
const ensureStorageInitialized = async (req, res, next) => {
  if (!storageInitialized) {
    try {
      await studentStorage.initialize();
      storageInitialized = true;
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      return res.status(500).json({
        error: 'Storage initialization failed',
        message: error.message
      });
    }
  }
  next();
};

// Student API endpoints
app.post('/api/students/store', ensureStorageInitialized, async (req, res) => {
  try {
    const { roll, name, marks, attendance, timestamp } = req.body;

    if (!roll || !name || !marks || !attendance) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide roll, name, marks, and attendance'
      });
    }

    if (isNaN(marks) || isNaN(attendance)) {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Marks and attendance must be numbers'
      });
    }

    const record = {
      roll: roll.toString().trim(),
      name: name.toString().trim(),
      marks: parseFloat(marks),
      attendance: parseFloat(attendance),
      timestamp: timestamp || new Date().toISOString()
    };

    const result = await studentStorage.storeRecord(record);

    res.status(201).json({
      success: true,
      message: 'Student record stored successfully',
      data: result
    });

  } catch (error) {
    console.error('Error in /store:', error);
    res.status(500).json({
      error: 'Failed to store record',
      message: error.message
    });
  }
});

app.get('/api/students/list', ensureStorageInitialized, async (req, res) => {
  try {
    const records = await studentStorage.listRecords();

    res.json({
      success: true,
      count: records.length,
      data: records
    });

  } catch (error) {
    console.error('Error in /list:', error);
    res.status(500).json({
      error: 'Failed to retrieve records',
      message: error.message
    });
  }
});

app.get('/api/students/status', ensureStorageInitialized, async (req, res) => {
  try {
    const status = studentStorage.getStatus();
    const records = await studentStorage.listRecords();

    res.json({
      success: true,
      storage: status,
      totalRecords: records.length
    });

  } catch (error) {
    console.error('Error in /status:', error);
    res.status(500).json({
      error: 'Failed to get status',
      message: error.message
    });
  }
});

app.delete('/api/students/:recordId', ensureStorageInitialized, async (req, res) => {
  try {
    const { recordId } = req.params;

    if (!recordId) {
      return res.status(400).json({
        error: 'Missing record ID',
        message: 'Please provide a record ID to delete'
      });
    }

    const result = await studentStorage.deleteRecord(recordId);

    res.json({
      success: true,
      message: 'Student record deleted successfully',
      data: result
    });

  } catch (error) {
    console.error('Error in DELETE /:recordId:', error);
    
    if (error.message === 'Record not found') {
      return res.status(404).json({
        error: 'Record not found',
        message: 'No record exists with the provided ID'
      });
    }

    res.status(500).json({
      error: 'Failed to delete record',
      message: error.message
    });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎓 Student Management API`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`📚 API: http://localhost:${PORT}/api/students/*`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
});

module.exports = app;
