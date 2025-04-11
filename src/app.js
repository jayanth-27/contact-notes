const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import route files
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/contacts', contactRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Contact Notes API',
    version: '1.0.0'
  });
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Error handler
app.use(errorHandler);

// Set port from environment or default
const PORT = process.env.PORT || 3000;

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

module.exports = app; // Export for testing
