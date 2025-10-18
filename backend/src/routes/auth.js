const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();

// Simple user authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// User registration
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // In production, save to database
    // For demo, we'll use in-memory storage
    const user = {
      id: Date.now(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // In production, fetch from database
    // For demo, using hardcoded admin user
    const adminUser = {
      id: 1,
      username: 'admin',
      password: await bcrypt.hash('admin123', 10) // Default password
    };
    
    if (username !== adminUser.username) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: adminUser.id, username: adminUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: adminUser.id,
        username: adminUser.username
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

// Protected route example
router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = { router, authenticateToken };