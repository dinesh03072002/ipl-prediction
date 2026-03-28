import React from 'react';
import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';

const MatchCard = ({ match, onPredictClick }) => {
  const isUpcoming = new Date(match.matchDate) > new Date();
  const isCompleted = match.status === 'completed';
  const isLive = !isUpcoming && !isCompleted;

  const getStatusBadge = () => {
    if (isCompleted) {
      return <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Completed</span>;
    }
    if (isLive) {
      return <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">Live</span>;
    }
    return <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Upcoming</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-bold text-xl">
            {match.team1} vs {match.team2}
          </h3>
          {getStatusBadge()}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{new Date(match.matchDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{new Date(match.matchDate).toLocaleTimeString()}</span>
          </div>
        </div>

        {isUpcoming && !isCompleted && (
          <div className="mb-4">
            <CountdownTimer targetDate={match.matchDate} />
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">{match.team1}</p>
            </div>
            <span className="text-gray-400">vs</span>
            <div className="text-center">
              <p className="text-sm text-gray-500">{match.team2}</p>
            </div>
          </div>

          {isUpcoming && !isCompleted && (
            <Link
              to={`/predict/${match.id}`}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Make Predictions
            </Link>
          )}
          <Link
  to={`/leaderboard/match/${match.id}`}
  className="text-sm text-purple-600 hover:text-purple-800 mt-2 inline-block"
>
  View Match Leaderboard →
</Link>

          {isCompleted && (
            <button
              onClick={() => onPredictClick?.(match.id)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold cursor-not-allowed opacity-50"
              disabled
            >
              Predictions Closed
            </button>
          )}

          {isLive && (
            <button
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold animate-pulse"
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