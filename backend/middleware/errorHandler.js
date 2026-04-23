const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation error', errors: err.errors });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
  
};

module.exports = errorHandler;