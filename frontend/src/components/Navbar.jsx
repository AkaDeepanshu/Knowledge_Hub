import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          📚 Knowledge Hub
        </Link>

        {user && (
          <div className="navbar-menu">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/articles/new" className="nav-link">
              New Article
            </Link>
            {isAdmin() && (
              <Link to="/admin" className="nav-link">
                Admin Panel
              </Link>
            )}
            <div className="user-menu">
              <span className="user-name">
                {user.username} {isAdmin() && '👑'}
              </span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
