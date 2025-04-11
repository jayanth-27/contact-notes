/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error(err);

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Handle database errors
  if (err.code === '23505') { // PostgreSQL unique violation
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Handle Postgres foreign key violation
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced record does not exist';
  }

  // Return standardized error response
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
