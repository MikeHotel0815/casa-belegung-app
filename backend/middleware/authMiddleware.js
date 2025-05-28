const jwt = require('jsonwebtoken');

// Placeholder for JWT secret - TODO: Use environment variable
const JWT_SECRET = 'YOUR_SECRET_KEY';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Add user payload to request object
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token is expired' });
      }
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } else {
    return res.status(403).json({ message: 'No authorization header, authorization denied' });
  }
};
