const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');

// Public routes (rate-limited to prevent brute force attacks)
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);

// Protected routes
router.get('/profile', authenticate, getProfile);

module.exports = router;
