import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle-button" 
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <div className={`toggle-track ${theme === 'dark' ? 'dark' : 'light'}`}>
        <div className="toggle-thumb">
          {theme === 'light' ? '☀️' : '🌙'}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
