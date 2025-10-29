import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articleAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    tags: '',
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchArticles();
  }, [filters]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: filters.page,
        limit: filters.limit,
      };
      
      if (filters.search) params.search = filters.search;
      if (filters.tags) params.tags = filters.tags;

      const response = await articleAPI.getAllArticles(params);
      console.log('Fetched articles:', response);
      setArticles(response.data.data.articles);
      setTotalPages(response.data.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleTagsChange = (e) => {
    setFilters({ ...filters, tags: e.target.value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo(0, 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📚 Article Dashboard</h1>
        <Link to="/articles/new" className="btn-create">
          ➕ Create New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="🔍 Search articles..."
            value={filters.search}
            onChange={handleSearchChange}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <input
            type="text"
            placeholder="🏷️ Filter by tags (comma-separated)"
            value={filters.tags}
            onChange={handleTagsChange}
            className="filter-input"
          />
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && <div className="loading">Loading articles...</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Articles Grid */}
      {!loading && !error && (
        <>
          {articles.length === 0 ? (
            <div className="no-articles">
              <p>No articles found. Create your first article!</p>
              <Link to="/articles/new" className="btn-primary">
                Create Article
              </Link>
            </div>
          ) : (
            <>
              <div className="articles-grid">
                {articles.map((article) => (
                  <div key={article._id} className="article-card">
                    <div className="article-header">
                      <h3 className="article-title">
                        <Link to={`/articles/${article._id}`}>
                          {article.title}
                        </Link>
                      </h3>
                    </div>
                    
                    {article.summary && (
                      <p className="article-summary">{article.summary}</p>
                    )}
                    
                    {article.tags && article.tags.length > 0 && (
                      <div className="article-tags">
                        {article.tags.map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="article-meta">
                      <span className="meta-item">
                        👤 {article.createdBy?.username || 'Unknown'}
                      </span>
                      <span className="meta-item">
                        📅 {formatDate(article.createdAt)}
                      </span>
                    </div>

                    
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={filters.page === 1}
                    className="btn-page"
                    title="First page"
                  >
                    ⏮️
                  </button>
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="btn-page"
                  >
                    ← Previous
                  </button>
                  <span className="page-info">
                    Page {filters.page} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === totalPages}
                    className="btn-page"
                  >
                    Next →
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={filters.page === totalPages}
                    className="btn-page"
                    title="Last page"
                  >
                    ⏭️
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
