const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const codeToContainerService = require('../services/codeToContainer');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    await fs.ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const clientId = req.body.clientId || uuidv4();
    const timestamp = Date.now();
    const filename = `${clientId}_${timestamp}_${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.zip', '.tar', '.tar.gz'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext) || file.mimetype === 'application/zip') {
      cb(null, true);
    } else {
      cb(new Error('Only zip, tar, and tar.gz files are allowed'), false);
    }
  }
});

// Upload and process code
router.post('/', upload.single('codeArchive'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please upload a zip file containing your source code'
      });
    }

    const clientId = req.body.clientId || uuidv4();
    const clientName = req.body.clientName || 'Anonymous';

    console.log(`📁 Processing upload for client: ${clientName} (${clientId})`);
    console.log(`📦 File: ${req.file.originalname} (${req.file.size} bytes)`);

    // Process the uploaded code
    const result = await codeToContainerService.processUpload(req.file.path, clientId);

    // Save processing results for deployment
    const resultPath = path.join(
      path.dirname(req.file.path), 
      `result_${result.projectId}.json`
    );
    await fs.writeJson(resultPath, result);

    res.json({
      success: true,
      message: 'Code processed successfully',
      data: {
        projectId: result.projectId,
        clientId: result.clientId,
        runtime: result.runtime,
        detectedPort: result.appPort,
        dockerfileGenerated: true,
        buildContextReady: true,
        nextStep: 'deployment'
      }
    });

  } catch (error) {
    console.error('Upload processing error:', error);
    
    // Cleanup on error
    if (req.file && req.file.path) {
      try {
        await fs.remove(req.file.path);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'Processing failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get processing status
router.get('/status/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const resultPath = path.join(
      __dirname, 
      '../../uploads', 
      `result_${projectId}.json`
    );

    if (!await fs.pathExists(resultPath)) {
      return res.status(404).json({
        error: 'Project not found',
        projectId
      });
    }

    const result = await fs.readJson(resultPath);
    
    res.json({
      success: true,
      data: {
        projectId: result.projectId,
        clientId: result.clientId,
        runtime: result.runtime,
        status: 'processed',
        detectedPort: result.appPort,
        dockerfileGenerated: true
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Status check failed',
      message: error.message
    });
  }
});

// Get generated Dockerfile
router.get('/dockerfile/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const resultPath = path.join(
      __dirname, 
      '../../uploads', 
      `result_${projectId}.json`
    );

    if (!await fs.pathExists(resultPath)) {
      return res.status(404).json({
        error: 'Project not found',
        projectId
      });
    }

    const result = await fs.readJson(resultPath);
    
    res.json({
      success: true,
      data: {
        projectId: result.projectId,
        runtime: result.runtime,
        dockerfile: result.dockerfileContent,
        port: result.appPort
      }
    });

  } catch (error) {
    console.error('Dockerfile retrieval error:', error);
    res.status(500).json({
      error: 'Dockerfile retrieval failed',
      message: error.message
    });
  }
});

// Delete project files
router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    // Find and remove all related files
    const files = await fs.readdir(uploadsDir);
    const projectFiles = files.filter(file => file.includes(projectId));
    
    for (const file of projectFiles) {
      await fs.remove(path.join(uploadsDir, file));
    }

    res.json({
      success: true,
      message: 'Project files deleted',
      projectId,
      deletedFiles: projectFiles.length
    });

  } catch (error) {
    console.error('Deletion error:', error);
    res.status(500).json({
      error: 'Deletion failed',
      message: error.message
    });
  }
});

module.exports = router;