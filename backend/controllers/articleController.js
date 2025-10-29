const Article = require('../models/Article');

// Create article
const createArticle = async (req, res) => {
  try {
    const { title, content, tags, summary } = req.body;

    // Validate required fields
    if (!title || !content || !summary) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, content, and summary.'
      });
    }

    // Create article
    const article = new Article({
      title,
      content,
      tags: tags || [],
      summary,
      createdBy: req.user._id
    });

    await article.save();
    await article.populate('createdBy', 'username email role');

    res.status(201).json({
      success: true,
      message: 'Article created successfully.',
      data: {
        article
      }
    });
  } catch (error) {
    console.error('Create article error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(' ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating article.'
    });
  }
};

// Get all articles
const getAllArticles = async (req, res) => {
  try {
    // Optional query parameters for filtering
    const { tags, search, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    // Filter by tags
    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagsArray };
    }
    
    // Search in title and content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const articles = await Article.find(query)
      .populate('createdBy', 'username email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Article.countDocuments(query);

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: {
        articles
      }
    });
  } catch (error) {
    console.error('Get all articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching articles.'
    });
  }
};

// Get single article
const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('createdBy', 'username email role');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        article
      }
    });
  } catch (error) {
    console.error('Get article error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching article.'
    });
  }
};

// Update article (owner or admin only)
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found.'
      });
    }

    // Check if user is the owner or admin
    const isOwner = article.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this article. Only the owner or admin can update.'
      });
    }

    // Update fields
    const { title, content, tags, summary } = req.body;
    
    if (title !== undefined) article.title = title;
    if (content !== undefined) article.content = content;
    if (tags !== undefined) article.tags = tags;
    if (summary !== undefined) article.summary = summary;

    await article.save();
    await article.populate('createdBy', 'username email role');

    res.status(200).json({
      success: true,
      message: 'Article updated successfully.',
      data: {
        article
      }
    });
  } catch (error) {
    console.error('Update article error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(' ')
      });
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating article.'
    });
  }
};

// Delete article (admin only)
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully.',
      data: {
        deletedArticle: {
          id: article._id,
          title: article.title
        }
      }
    });
  } catch (error) {
    console.error('Delete article error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting article.'
    });
  }
};

// Get user's own articles
const getMyArticles = async (req, res) => {
  try {
    const articles = await Article.find({ createdBy: req.user._id })
      .populate('createdBy', 'username email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: articles.length,
      data: {
        articles
      }
    });
  } catch (error) {
    console.error('Get my articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching articles.'
    });
  }
};

module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getMyArticles
};
