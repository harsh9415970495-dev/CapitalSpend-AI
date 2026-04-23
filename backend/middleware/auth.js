const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded; // Store user in req.user
    req.user._id = decoded.userId; // For controllers using req.user._id
    req.userId = decoded.userId;   // For controllers using req.userId
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

module.exports = auth;