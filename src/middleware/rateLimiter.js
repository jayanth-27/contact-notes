const rateLimit = require('express-rate-limit');

/**
 * Basic rate limiter for API endpoints
 */
exports.apiLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes by default
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  // Add retry-after header
  handler: (req, res, _, options) => {
    res.status(options.statusCode).json(options.message);
    res.set('Retry-After', Math.ceil(options.windowMs / 1000));
  },
});

/**
 * Stricter rate limiter for auth routes to prevent brute force
 */
exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // 10 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  handler: (req, res, _, options) => {
    res.status(options.statusCode).json(options.message);
    res.set('Retry-After', Math.ceil(options.windowMs / 1000));
  },
});

/**
 * Simulated external service rate limiter with exponential backoff
 * For demonstration purposes to simulate a rate-limited external service
 */
const backoffMap = new Map(); // Store IP to backoff time mapping

exports.simulateExternalServiceLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  // Check if this IP is in backoff period
  if (backoffMap.has(ip)) {
    const backoffData = backoffMap.get(ip);
    
    // If we're still in the backoff window
    if (now < backoffData.nextAllowedTime) {
      const waitTimeSeconds = Math.ceil((backoffData.nextAllowedTime - now) / 1000);
      
      res.set('Retry-After', waitTimeSeconds);
      return res.status(429).json({
        success: false,
        message: `Rate limited by external service. Try again in ${waitTimeSeconds} seconds.`
      });
    }
    
    // If we've passed the backoff window, reset count but keep track of history
    backoffData.count = 0;
    backoffData.nextAllowedTime = 0;
    backoffMap.set(ip, backoffData);
  } else {
    // First time seeing this IP
    backoffMap.set(ip, {
      count: 0,
      nextAllowedTime: 0,
      backoffFactor: 2 // Initial backoff factor
    });
  }
  
  // Increment count
  const backoffData = backoffMap.get(ip);
  backoffData.count += 1;
  
  // If count exceeds threshold, apply exponential backoff
  if (backoffData.count > 5) { // Arbitrary threshold
    const backoffTimeMs = 1000 * Math.pow(backoffData.backoffFactor, backoffData.count - 5);
    const maxBackoffMs = 30 * 60 * 1000; // Cap at 30 minutes
    
    backoffData.nextAllowedTime = now + Math.min(backoffTimeMs, maxBackoffMs);
    backoffData.backoffFactor = Math.min(backoffData.backoffFactor * 1.5, 10); // Increase factor but cap it
    
    backoffMap.set(ip, backoffData);
    
    const waitTimeSeconds = Math.ceil((backoffData.nextAllowedTime - now) / 1000);
    res.set('Retry-After', waitTimeSeconds);
    return res.status(429).json({
      success: false,
      message: `Rate limited by external service. Try again in ${waitTimeSeconds} seconds.`
    });
  }
  
  next();
}; 