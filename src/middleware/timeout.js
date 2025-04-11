/**
 * Middleware to handle request timeouts
 * @param {number} time - Timeout duration in milliseconds
 */
const timeout = (time = process.env.REQUEST_TIMEOUT || 5000) => {
  return (req, res, next) => {
    // Set timeout flag to track if the request has timed out
    req.timeoutFlag = false;
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      req.timeoutFlag = true;
      
      // Only send response if headers haven't been sent yet
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          message: 'Request timed out. Please try again later.'
        });
      }
    }, time);
    
    // Store original end method
    const originalEnd = res.end;
    
    // Override end method to clear timeout
    res.end = function(...args) {
      clearTimeout(timeoutId);
      return originalEnd.apply(this, args);
    };
    
    next();
  };
};

module.exports = timeout; 