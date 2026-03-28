import React, { useState, useEffect } from 'react';
import { matchAPI, questionAPI, resultAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const Results = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await matchAPI.getAll();
      const completedMatches = response.data.filter(m => m.status === 'completed');
      setMatches(completedMatches);
    } catch (error) {
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

 
const handleMatchSelect = async (matchId) => {
  try {
    setLoading(true);
    const match = matches.find(m => m.id === matchId);
    setSelectedMatch(match);
    
    console.log('Loading results for match:', matchId);
    
    // Load questions for this match
    const questionsResponse = await questionAPI.getByMatch(matchId);
    setQuestions(questionsResponse.data);
    console.log('Questions loaded:', questionsResponse.data.length);
    
    // Load results for this match
    const resultsResponse = await resultAPI.getMatchResults(matchId);
    console.log('Results loaded:', resultsResponse.data);
    setResults(resultsResponse.data);
    
  } catch (error) {
    console.error('Error loading results:', error);
    toast.error('Failed to load results');
  } finally {
    setLoading(false);
  }
};
  // Helper function to format answer based on question type
  const formatAnswer = (answer, type) => {
    if (!answer) return 'Not available';
    
    try {
      // Try to parse if it's JSON string
      const parsed = typeof answer === 'string' ? JSON.parse(answer) : answer;
      
      if (type === 'RANGE') {
        if (parsed && typeof parsed === 'object') {
          if (parsed.min !== undefined && parsed.max !== undefined) {
            return `${parsed.min}-${parsed.max}`;
          }
        }
        return parsed;
      } else if (type === 'BOOLEAN') {
        return parsed === 'yes' ? 'Yes' : 'No';
      } else if (type === 'NUMBER') {
        return parsed;
      }
      return parsed;
    } catch (e) {
      // Not JSON, use as is
      if (type === 'BOOLEAN') {
        return answer === 'yes' ? 'Yes' : 'No';
      }
      return answer;
    }
  };

  // Get correct answer for a question
  const getCorrectAnswer = (questionId) => {
    const result = results.find(r => r.questionId === questionId);
    return result ? result.correctAnswer : null;
  };

  if (loading && matches.length === 0) {
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Loading results..." />
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
            <h1 className="text-4xl font-bold mb-2">Match Results</h1>
            <p className="text-lg opacity-90">Check past match results and correct answers</p>
          </div>

          {/* Match Selector */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Match
            </label>
            <select
              onChange={(e) => handleMatchSelect(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={selectedMatch?.id || ''}
            >
              <option value="">Choose a completed match</option>
              {matches.map(match => (
                <option key={match.id} value={match.id}>
                  {match.team1} vs {match.team2} - {new Date(match.matchDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {/* Results Display */}
          {selectedMatch && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedMatch.team1} vs {selectedMatch.team2}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(selectedMatch.matchDate).toLocaleString()}
                </p>
              </div>

              {questions.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500">No questions available for this match</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {questions.map((question, idx) => {
                    const correctAnswer = getCorrectAnswer(question.id);
                    const formattedAnswer = formatAnswer(correctAnswer, question.type);
                    
                    return (
                      <div key={question.id} className="p-6">
                        <div 
                          className="flex justify-between items-start cursor-pointer"
                          onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                Q{idx + 1}
                              </span>
                              <span className="text-sm text-gray-500">
                                {question.type === 'MCQ' ? 'Multiple Choice' : 
                                 question.type === 'NUMBER' ? 'Number' :
                                 question.type === 'RANGE' ? 'Range' :
                                 question.type === 'BOOLEAN' ? 'Yes/No' : 'Text'}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({question.points} points)
                              </span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-800">
                              {question.questionText}
                            </h3>
                          </div>
                          <svg
                            className={`h-5 w-5 text-gray-400 transform transition-transform ${
                              expandedQuestion === question.id ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        
                        {expandedQuestion === question.id && (
                          <div className="mt-4 pl-4 border-l-4 border-purple-500">
                            <p className="text-sm text-gray-500 mb-2">✅ Correct Answer:</p>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-green-800 font-medium">
                                {correctAnswer ? formattedAnswer : 'Not yet available'}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Points awarded for correct prediction: {question.points}
                              {question.type === 'NUMBER' && ' (Half points for answers within ±10 range)'}
                              {question.type === 'TEXT' && ' (Fuzzy matching - variations like "Kohli" for "Virat Kohli" are accepted)'}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* No Match Selected */}
          {!selectedMatch && matches.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <svg className="h-12 w-12 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-blue-800 mb-2">Select a match</h3>
              <p className="text-blue-600">Choose a completed match from the dropdown above to view results</p>
            </div>
          )}

          {/* No Completed Matches */}
          {matches.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <svg className="h-12 w-12 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">No completed matches yet</h3>
              <p className="text-yellow-600">Check back after matches are completed to see results</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Results;