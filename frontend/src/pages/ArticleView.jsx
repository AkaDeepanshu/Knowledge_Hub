import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { articleAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ArticleView.css';

const ArticleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Summarization states
  const [summarizing, setSummarizing] = useState(false);
  const [summarizeError, setSummarizeError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('gemini');

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await articleAPI.getArticleById(id);
      setArticle(response.data.data.article);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    try {
      setSummarizing(true);
      setSummarizeError('');
      
      const response = await articleAPI.summarizeArticle(id, selectedProvider);
      
      // Update article with new summary
      setArticle(response.data.data.article);
      
    } catch (err) {
      setSummarizeError(err.response?.data?.message || 'Failed to generate summary');
    } finally {
      setSummarizing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      await articleAPI.deleteArticle(id);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete article');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canEdit = () => {
    return user && (isAdmin() || article?.createdBy?._id === user._id);
  };

  const canDelete = () => {
    return user && isAdmin();
  };

  const canSummarize = () => {
    return user && (isAdmin() || article?.createdBy?._id === user._id);
  };

  if (loading) {
    return (
      <div className="article-view-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="article-view-container">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-view-container">
        <div className="error-state">
          <h2>Article Not Found</h2>
          <p>The article you're looking for doesn't exist.</p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="article-view-container">
      <div className="article-view">
        {/* Header with Actions */}
        <div className="article-header-section">
          <Link to="/dashboard" className="back-link">
            ← Back to Dashboard
          </Link>
          
          <div className="article-actions">
            {canEdit() && (
              <Link 
                to={`/articles/${id}/edit`} 
                className="btn-edit-article"
              >
                ✏️ Edit
              </Link>
            )}
            {canDelete() && (
              <button 
                onClick={handleDelete} 
                className="btn-delete-article"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </div>

        {/* Article Title */}
        <h1 className="article-title-view">{article.title}</h1>

        {/* Article Metadata */}
        <div className="article-metadata">
          <div className="metadata-item">
            <span className="metadata-icon">👤</span>
            <span className="metadata-label">Author:</span>
            <span className="metadata-value">
              {article.createdBy?.username || 'Unknown'}
            </span>
          </div>
          
          <div className="metadata-item">
            <span className="metadata-icon">📅</span>
            <span className="metadata-label">Published:</span>
            <span className="metadata-value">
              {formatDate(article.createdAt)}
            </span>
          </div>
          
          {article.updatedAt !== article.createdAt && (
            <div className="metadata-item">
              <span className="metadata-icon">🔄</span>
              <span className="metadata-label">Updated:</span>
              <span className="metadata-value">
                {formatDate(article.updatedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="article-tags-section">
            <h3 className="section-title">🏷️ Tags</h3>
            <div className="tags-list">
              {article.tags.map((tag, index) => (
                <span key={index} className="tag-item">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Summary Section */}
        {article.summary && (
          <div className="summary-section">
            <div className="summary-header">
              <h3 className="section-title">✨ AI-Generated Summary</h3>
              {canSummarize() && (
                <button
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className="btn-regenerate"
                  title="Regenerate summary"
                >
                  {summarizing ? '⏳ Generating...' : '🔄 Regenerate'}
                </button>
              )}
            </div>
            <div className="summary-content">
              <p>{article.summary}</p>
            </div>
          </div>
        )}

        {/* Generate Summary Button (if no summary exists) */}
        {!article.summary && canSummarize() && (
          <div className="generate-summary-section">
            <div className="generate-summary-card">
              <h3>✨ Generate AI Summary</h3>
              <p>Use AI to automatically generate a summary for this article.</p>
              
              <div className="provider-selector">
                <label htmlFor="provider">Choose AI Provider:</label>
                <select
                  id="provider"
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  disabled={summarizing}
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI GPT-3.5</option>
                </select>
              </div>

              <button
                onClick={handleSummarize}
                disabled={summarizing}
                className="btn-generate-summary"
              >
                {summarizing ? (
                  <>
                    <span className="spinner-small"></span>
                    Generating Summary...
                  </>
                ) : (
                  '✨ Generate Summary'
                )}
              </button>

              {summarizeError && (
                <div className="error-message">{summarizeError}</div>
              )}
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="article-content-section">
          <h3 className="section-title">📝 Content</h3>
          <div className="article-content">
            {article.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArticleView;
