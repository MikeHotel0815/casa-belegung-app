const express = require('express');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api'); // Import API routes
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// Auth routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes); // Use API routes with /api prefix

// Example protected route
app.get('/protected', authMiddleware, (req, res) => {
  // req.user is available here from authMiddleware
  res.json({ message: 'This is a protected route', user: req.user });
});

// Test route that throws an error
app.get('/error', (req, res, next) => {
  next(new Error('Test error!')); // Pass error to next()
});

// Error handling middleware (should be last middleware)
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Keep existing error status if set
  res.status(statusCode).json({
    message: err.message || 'Something went wrong!',
    // Optionally, include stack in development
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
