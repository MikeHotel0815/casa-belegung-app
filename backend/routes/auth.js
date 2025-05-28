const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Assuming models/index.js exports User
const router = express.Router();

// Placeholder for JWT secret - TODO: Use environment variable
const JWT_SECRET = 'YOUR_SECRET_KEY';

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // TODO: Implement password hashing with bcryptjs before saving
    const newUser = await User.create({
      username,
      password, // Storing plain text password (for placeholder only)
    });

    // Exclude password from the response
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
    };
    res.status(201).json({ message: 'User registered successfully', user: userResponse });
  } catch (error) {
    // Basic error handling
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Username already exists' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Placeholder password validation - uses plain text comparison
    // TODO: Replace with bcryptjs comparison after hashing is implemented
    if (!user.validPassword(password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

module.exports = router;
