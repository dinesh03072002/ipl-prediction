// frontend/src/pages/MatchLeaderboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { matchAPI, leaderboardAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const MatchLeaderboard = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLeaderboard, setActiveLeaderboard] = useState('match');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load match details
      const matchesRes = await matchAPI.getAll();
      const currentMatch = matchesRes.data.find(m => m.id === parseInt(matchId));
      setMatch(currentMatch);
      
      // Load match leaderboard
      const leaderboardRes = await leaderboardAPI.getMatchLeaderboard(matchId);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      toast.error('Failed to load leaderboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getMedalIcon = (rank) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return null;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Loading leaderboard..." />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white p-8 mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {match ? `${match.team1} vs ${match.team2}` : 'Match'} Leaderboard
            </h1>
            <p className="text-lg opacity-90">
              {match ? new Date(match.matchDate).toLocaleDateString() : ''}
            </p>
          </div>

          {/* Leaderboard Table */}
          {leaderboard.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg">No predictions yet for this match</p>
              <p className="text-gray-400">Be the first to make predictions!</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leaderboard.map((user, index) => (
                      <tr key={user.id} className={index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getMedalIcon(index) && (
                              <span className="text-2xl">{getMedalIcon(index)}</span>
                            )}
                            <span className={`font-bold ${index < 3 ? 'text-lg' : ''}`}>
                              #{index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-2xl font-bold text-purple-600">
                            {user.points}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">pts</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MatchLeaderboard;