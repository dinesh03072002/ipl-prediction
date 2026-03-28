
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const isAdminPage = location.pathname.startsWith('/admin');

  // Close mobile menu when clicking a link
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Admin Navbar
  if (isAdminPage) {
    return (
      <nav className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-white font-bold text-lg md:text-xl">Admin Panel</span>
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminEmail');
                window.location.href = '/admin/login';
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg transition-colors text-sm md:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // Regular User Navbar with Mobile Menu
  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <svg className="h-7 w-7 md:h-8 md:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-white font-bold text-lg md:text-xl">IPL Predictor</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-white hover:text-yellow-200 transition-colors ${isActive('/') ? 'border-b-2 border-yellow-200' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              to="/leaderboard"
              className={`text-white hover:text-yellow-200 transition-colors ${isActive('/leaderboard') ? 'border-b-2 border-yellow-200' : ''}`}
            >
              Leaderboard
            </Link>
            <Link
              to="/results"
              className={`text-white hover:text-yellow-200 transition-colors ${isActive('/results') ? 'border-b-2 border-yellow-200' : ''}`}
            >
              Results
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-500">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                onClick={handleLinkClick}
                className={`text-white hover:text-yellow-200 transition-colors py-2 ${isActive('/') ? 'text-yellow-200' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/leaderboard"
                onClick={handleLinkClick}
                className={`text-white hover:text-yellow-200 transition-colors py-2 ${isActive('/leaderboard') ? 'text-yellow-200' : ''}`}
              >
                Leaderboard
              </Link>
              <Link
                to="/results"
                onClick={handleLinkClick}
                className={`text-white hover:text-yellow-200 transition-colors py-2 ${isActive('/results') ? 'text-yellow-200' : ''}`}
              >
                Results
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* User Welcome Banner */}
      {userName && (
        <div className="bg-purple-700 text-white text-xs md:text-sm py-1 px-4">
          <div className="container mx-auto">
            Welcome, {userName}! 👋
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;