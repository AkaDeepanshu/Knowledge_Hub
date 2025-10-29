const mongoose = require('mongoose');

/**
 * ArticleVersion Schema
 * Stores historical versions of articles for tracking edits
 */
const articleVersionSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    index: true
  },
  versionNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  editReason: {
    type: String,
    maxlength: 200
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient version queries
articleVersionSchema.index({ articleId: 1, versionNumber: -1 });

const ArticleVersion = mongoose.model('ArticleVersion', articleVersionSchema);

module.exports = ArticleVersion;
