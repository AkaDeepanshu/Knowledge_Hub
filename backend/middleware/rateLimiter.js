const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

/**
 * Rate limiter for LLM/AI summarization endpoints
 * Prevents abuse and controls API costs
 */
const llmRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each user to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many summarization requests. Please try again later.',
    error: 'Rate limit exceeded for AI summarization'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Use user ID if authenticated, otherwise IP address (with IPv6 support)
  keyGenerator: (req, res) => {
    return req.user?.id || ipKeyGenerator(req, res);
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many summarization requests from this user. Please try again after 15 minutes.',
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000) // seconds until reset
    });
  }
});

/**
 * General API rate limiter for auth endpoints
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    error: 'Rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

/**
 * Strict rate limiter for resource-intensive operations
 */
const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour
  message: {
    success: false,
    message: 'Rate limit exceeded. Please try again later.',
    error: 'Too many requests'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  llmRateLimiter,
  authRateLimiter,
  strictRateLimiter
};
