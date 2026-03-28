import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchAPI } from '../services/api';
import MatchCard from '../components/MatchCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
      return;
    }
    loadMatches();
  }, [navigate]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await matchAPI.getAll();
      setMatches(response.data);
    } catch (error) {
      toast.error('Failed to load matches');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(match.matchDate) > new Date() && match.status !== 'completed';
    if (filter === 'live') return new Date(match.matchDate) <= new Date() && match.status !== 'completed';
    if (filter === 'completed') return match.status === 'completed';
    return true;
  });

  const upcomingMatches = matches.filter(m => new Date(m.matchDate) > new Date() && m.status !== 'completed').length;
  const liveMatches = matches.filter(m => new Date(m.matchDate) <= new Date() && m.status !== 'completed').length;
  const completedMatches = matches.filter(m => m.status === 'completed').length;

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Loading matches..." />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl md:rounded-2xl text-white p-6 md:p-8 mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">IPL Match Predictions</h1>
            <p className="text-sm md:text-base lg:text-lg opacity-90">Predict match outcomes, earn points, and compete with friends!</p>
          </div>

          {/* Stats Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs md:text-sm">Upcoming Matches</p>
                  <p className="text-2xl md:text-3xl font-bold text-purple-600">{upcomingMatches}</p>
                </div>
                <svg className="h-8 w-8 md:h-12 md:w-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs md:text-sm">Live Matches</p>
                  <p className="text-2xl md:text-3xl font-bold text-red-600">{liveMatches}</p>
                </div>
                <svg className="h-8 w-8 md:h-12 md:w-12 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs md:text-sm">Completed Matches</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-600">{completedMatches}</p>
                </div>
                <svg className="h-8 w-8 md:h-12 md:w-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filter Tabs - Scrollable on Mobile */}
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium text-sm md:text-base whitespace-nowrap transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium text-sm md:text-base whitespace-nowrap transition-colors ${
                filter === 'upcoming'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('live')}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium text-sm md:text-base whitespace-nowrap transition-colors ${
                filter === 'live'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium text-sm md:text-base whitespace-nowrap transition-colors ${
                filter === 'completed'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Completed
            </button>
          </div>

          {/* Matches Grid - Responsive */}
          {filteredMatches.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 md:p-12 text-center">
              <svg className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-base md:text-lg">No matches found</p>
              <p className="text-gray-400 text-sm md:text-base">Check back later for upcoming IPL matches!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {filteredMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;