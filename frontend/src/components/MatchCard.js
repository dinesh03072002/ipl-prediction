
import React from 'react';
import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';

const MatchCard = ({ match }) => {
  const isUpcoming = new Date(match.matchDate) > new Date();
  const isCompleted = match.status === 'completed';
  const isLive = !isUpcoming && !isCompleted;

  const getStatusBadge = () => {
    if (isCompleted) {
      return <span className="bg-gray-500 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-semibold">Completed</span>;
    }
    if (isLive) {
      return <span className="bg-red-500 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-semibold animate-pulse">Live</span>;
    }
    return <span className="bg-green-500 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-semibold">Upcoming</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 md:px-6 py-3 md:py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-white font-bold text-base md:text-xl">
            {match.team1} vs {match.team2}
          </h3>
          {getStatusBadge()}
        </div>
      </div>
      
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2 text-gray-600 text-xs md:text-sm">
            <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{new Date(match.matchDate).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 text-xs md:text-sm">
            <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{new Date(match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {isUpcoming && !isCompleted && (
          <div className="mb-4">
            <CountdownTimer targetDate={match.matchDate} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-4">
          <div className="flex items-center justify-center sm:justify-start space-x-4">
            <div className="text-center">
              <p className="text-xs md:text-sm text-gray-500">{match.team1}</p>
            </div>
            <span className="text-gray-400 text-sm">vs</span>
            <div className="text-center">
              <p className="text-xs md:text-sm text-gray-500">{match.team2}</p>
            </div>
          </div>

          {isUpcoming && !isCompleted && (
            <Link
              to={`/predict/${match.id}`}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 py-2 rounded-lg font-semibold text-sm md:text-base text-center transition-colors"
            >
              Make Predictions
            </Link>
          )}

          {isCompleted && (
            <Link
              to={`/leaderboard/match/${match.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded-lg font-semibold text-sm md:text-base text-center transition-colors"
            >
              View Match Leaderboard →
            </Link>
          )}

          {isLive && (
            <button
              className="bg-red-600 text-white px-4 md:px-6 py-2 rounded-lg font-semibold text-sm md:text-base text-center cursor-not-allowed opacity-50"
              disabled
            >
              Match in Progress
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;