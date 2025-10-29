const express = require('express');
const router = express.Router();
const {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getMyArticles,
  summarizeArticle,
  getArticleVersions,
  getArticleVersion
} = require('../controllers/articleController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { llmRateLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/', getAllArticles);
router.get('/:id', getArticleById);

// Protected routes (require authentication)
router.post('/', authenticate, createArticle);
router.put('/:id', authenticate, updateArticle); // Owner or admin can update
router.post('/:id/summarize', authenticate, llmRateLimiter, summarizeArticle); // Rate-limited AI summarization
router.get('/my/articles', authenticate, getMyArticles);

// Version history routes
router.get('/:id/versions', authenticate, getArticleVersions); // Get all versions
router.get('/:id/versions/:versionNumber', authenticate, getArticleVersion); // Get specific version

// Admin only routes
router.delete('/:id', authenticate, isAdmin, deleteArticle);

module.exports = router;
