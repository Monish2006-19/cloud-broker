const express = require('express');
const router = express.Router();
const studentStorage = require('../services/studentStorage');

/**
 * Initialize storage on first request
 */
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

/**
 * POST /api/students/store
 * Store a new student record
 */
router.post('/store', ensureStorageInitialized, async (req, res) => {
  try {
    const { roll, name, marks, attendance, timestamp } = req.body;

    // Validate required fields
    if (!roll || !name || !marks || !attendance) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide roll, name, marks, and attendance'
      });
    }

    // Validate data types
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

/**
 * GET /api/students/list
 * Retrieve all student records
 */
router.get('/list', ensureStorageInitialized, async (req, res) => {
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

/**
 * DELETE /api/students/:recordId
 * Delete a specific student record
 */
router.delete('/:recordId', ensureStorageInitialized, async (req, res) => {
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

/**
 * GET /api/students/status
 * Get storage service status
 */
router.get('/status', ensureStorageInitialized, async (req, res) => {
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

module.exports = router;
