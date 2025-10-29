import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ArticleView from './pages/ArticleView';
import ArticleForm from './pages/ArticleForm';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <ThemeToggle />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Dashboard />
                  </>
                </ProtectedRoute>
              }
            />
            
            {/* Placeholder for other routes - to be implemented */}
            <Route
              path="/articles/new"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <ArticleForm />
                  </>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/articles/:id"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <ArticleView />
                  </>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/articles/:id/edit"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <ArticleForm />
                  </>
                </ProtectedRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
