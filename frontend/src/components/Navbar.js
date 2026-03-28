// frontend/src/components/Navbar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);
    
    // Get user name from localStorage if exists
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Check if we're on admin page
  const isAdminPage = location.pathname.startsWith('/admin');

  // Don't show navbar on admin pages at all for a cleaner admin experience
  if (isAdminPage) {
    return (
      <nav className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-white font-bold text-xl">Admin Panel</span>
            </Link>

            {/* Admin Navigation */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminEmail');
                  window.location.href = '/admin/login';
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Regular user navbar
  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-white font-bold text-xl">IPL Predictor</span>
          </Link>

          {/* Navigation Links - Only Public Links for Regular Users */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`text-white hover:text-yellow-200 transition-colors ${
                isActive('/') ? 'border-b-2 border-yellow-200' : ''
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/leaderboard"
              className={`text-white hover:text-yellow-200 transition-colors ${
                isActive('/leaderboard') ? 'border-b-2 border-yellow-200' : ''
              }`}
            >
              Leaderboard
            </Link>
            <Link
              to="/results"
              className={`text-white hover:text-yellow-200 transition-colors ${
                isActive('/results') ? 'border-b-2 border-yellow-200' : ''
              }`}
            >
              Results
            </Link>
          </div>
        </div>
      </div>
      
      {/* Show user info ONLY for regular users (not admins) */}
      {userName && (
        <div className="bg-purple-700 text-white text-sm py-1 px-4">
          <div className="container mx-auto">
            Welcome, {userName}! 👋
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;