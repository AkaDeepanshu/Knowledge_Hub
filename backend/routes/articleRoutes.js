const express = require('express');
const router = express.Router();
const {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getMyArticles
} = require('../controllers/articleController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllArticles);
router.get('/:id', getArticleById);

// Protected routes (require authentication)
router.post('/', authenticate, createArticle);
router.put('/:id', authenticate, updateArticle); // Owner or admin can update
router.get('/my/articles', authenticate, getMyArticles);

// Admin only routes
router.delete('/:id', authenticate, isAdmin, deleteArticle);

module.exports = router;
