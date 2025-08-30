const express = require('express');
const router = express.Router();

// Mock users storage
let users = new Map();

// User registration
router.post('/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (users.has(email)) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    const user = {
      id: users.size + 1,
      email,
      password, // In production, hash the password
      name,
      createdAt: new Date().toISOString(),
      preferences: {
        theme: 'dark',
        notifications: true
      }
    };
    
    users.set(email, user);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// User login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.get(email);
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      data: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

// Get user profile
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = Array.from(users.values()).find(u => u.id === parseInt(userId));
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name, preferences: user.preferences }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
});

module.exports = router;
