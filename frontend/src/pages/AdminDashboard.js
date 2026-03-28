// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchAPI, questionAPI, resultAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [newMatch, setNewMatch] = useState({
    team1: '',
    team2: '',
    matchDate: ''
  });
  const [newQuestion, setNewQuestion] = useState({
    matchId: '',
    questionText: '',
    type: 'MCQ',
    options: '',
    minValue: null,
    maxValue: null,
    points: 10
  });
  const [results, setResults] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
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
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (matchId) => {
    try {
      const response = await questionAPI.getByMatch(matchId);
      setQuestions(response.data);
    } catch (error) {
      toast.error('Failed to load questions');
      console.error('Error loading questions:', error);
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (!newMatch.team1 || !newMatch.team2 || !newMatch.matchDate) {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      setLoading(true);
      await matchAPI.create(newMatch);
      toast.success('Match created successfully');
      setNewMatch({ team1: '', team2: '', matchDate: '' });
      loadMatches();
    } catch (error) {
      toast.error('Failed to create match');
      console.error('Error creating match:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    
    if (!newQuestion.matchId) {
      toast.error('Please select a match first');
      return;
    }
    
    if (!newQuestion.questionText.trim()) {
      toast.error('Please enter question text');
      return;
    }
    
    if (newQuestion.type === 'MCQ' && !newQuestion.options.trim()) {
      toast.error('Please enter options for MCQ');
      return;
    }
    
    // Prepare question data
    const questionData = {
      matchId: parseInt(newQuestion.matchId),
      questionText: newQuestion.questionText.trim(),
      type: newQuestion.type,
      points: parseInt(newQuestion.points)
    };
    
    // Add type-specific data
    if (newQuestion.type === 'MCQ') {
      const optionsArray = newQuestion.options.split(',').map(opt => opt.trim());
      if (optionsArray.length < 2) {
        toast.error('Please enter at least 2 options separated by commas');
        return;
      }
      questionData.options = JSON.stringify(optionsArray);
    }
    
    if (newQuestion.type === 'RANGE') {
      if (!newQuestion.minValue || !newQuestion.maxValue) {
        toast.error('Please enter both min and max values for range');
        return;
      }
      questionData.minValue = parseInt(newQuestion.minValue);
      questionData.maxValue = parseInt(newQuestion.maxValue);
    }
    
    try {
      setLoading(true);
      await questionAPI.create(questionData);
      toast.success('Question added successfully!');
      
      setNewQuestion({
        ...newQuestion,
        questionText: '',
        options: '',
        minValue: null,
        maxValue: null,
        points: 10
      });
      
      if (selectedMatch) {
        await loadQuestions(selectedMatch.id);
      }
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error(error.response?.data?.error || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResults = async (resultsData) => {
  if (!resultsData.results || resultsData.results.length === 0) {
    toast.error('Please add at least one result');
    return;
  }
  
  // Validate all results have answers
  const missingAnswers = resultsData.results.filter(r => !r.correctAnswer || r.correctAnswer === '');
  if (missingAnswers.length > 0) {
    toast.error(`Please fill answers for all questions. Missing: ${missingAnswers.length} question(s)`);
    return;
  }
  
  try {
    setLoading(true);
    console.log('Submitting results:', {
      matchId: resultsData.matchId,
      results: resultsData.results
    });
    
    const response = await resultAPI.updateResults({
      matchId: resultsData.matchId,
      results: resultsData.results
    });
    
    console.log('Response:', response.data);
    toast.success(`Results updated successfully! Updated ${response.data.updatedCount} answers`);
    
    // Clear the results form
    setResults([]);
    
    // Refresh the questions to show updated results
    if (selectedMatch) {
      await loadQuestions(selectedMatch.id);
    }
    
    // DO NOT automatically mark match as completed - removed that line
    
    // Reload matches to show updated status (if needed)
    await loadMatches();
    
  } catch (error) {
    console.error('Error updating results:', error);
    toast.error(error.response?.data?.error || 'Failed to update results');
  } finally {
    setLoading(false);
  }
};

  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
    setNewQuestion(prev => ({
      ...prev,
      matchId: match.id.toString()
    }));
    loadQuestions(match.id);
    setActiveTab('questions');
  };

  const handleStatusUpdate = async (matchId, status) => {
    try {
      await matchAPI.updateStatus(matchId, status);
      toast.success(`Match status updated to ${status}`);
      loadMatches();
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const renderMatchesTab = () => (
  <div className="space-y-6">
    {/* Create Match Form */}
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create New Match
      </h3>
      <form onSubmit={handleCreateMatch}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team 1</label>
            <input
              type="text"
              value={newMatch.team1}
              onChange={(e) => setNewMatch({ ...newMatch, team1: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Mumbai Indians"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team 2</label>
            <input
              type="text"
              value={newMatch.team2}
              onChange={(e) => setNewMatch({ ...newMatch, team2: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Chennai Super Kings"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Match Date & Time</label>
          <input
            type="datetime-local"
            value={newMatch.matchDate}
            onChange={(e) => setNewMatch({ ...newMatch, matchDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Match'}
        </button>
      </form>
    </div>

    {/* Existing Matches */}
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Existing Matches</h3>
      <div className="space-y-3">
        {matches.map(match => (
          <div key={match.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-lg">{match.team1} vs {match.team2}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    match.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                    match.status === 'live' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {match.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(match.matchDate).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                {/* Mark Completed button - ONLY in Matches tab */}
                {match.status !== 'completed' && (
                  <button
                    onClick={() => handleStatusUpdate(match.id, 'completed')}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  >
                    Mark Completed
                  </button>
                )}
                <button
                  onClick={() => handleMatchSelect(match)}
                  className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                >
                  Add Questions
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

  const renderQuestionsTab = () => (
    <div className="space-y-6">
      {selectedMatch && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Selected Match:</strong> {selectedMatch.team1} vs {selectedMatch.team2}
          </p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          Add Question for {selectedMatch?.team1} vs {selectedMatch?.team2}
        </h3>
        <form onSubmit={handleAddQuestion}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <input
                type="text"
                value={newQuestion.questionText}
                onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Who will win the match?"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type *
                </label>
                <select
                  value={newQuestion.type}
                  onChange={(e) => {
                    setNewQuestion({ 
                      ...newQuestion, 
                      type: e.target.value,
                      options: '',
                      minValue: null,
                      maxValue: null
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                >
                  <option value="MCQ">Multiple Choice</option>
                  <option value="NUMBER">Number</option>
                  <option value="RANGE">Range</option>
                  <option value="BOOLEAN">Yes/No</option>
                  <option value="TEXT">Text</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points *
                </label>
                <input
                  type="number"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="100"
                  required
                />
              </div>
            </div>
            
            {newQuestion.type === 'MCQ' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options (comma separated) *
                </label>
                <input
                  type="text"
                  value={newQuestion.options}
                  onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
                  placeholder="e.g., Mumbai Indians, Chennai Super Kings, Tie"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: Team A, Team B, Tie (separate with commas)
                </p>
              </div>
            )}
            
            {newQuestion.type === 'RANGE' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Value *
                  </label>
                  <input
                    type="number"
                    value={newQuestion.minValue || ''}
                    onChange={(e) => setNewQuestion({ ...newQuestion, minValue: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Value *
                  </label>
                  <input
                    type="number"
                    value={newQuestion.maxValue || ''}
                    onChange={(e) => setNewQuestion({ ...newQuestion, maxValue: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>

      
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold mb-4">Questions for this Match</h3>
  {questions.length === 0 ? (
    <p className="text-gray-500 text-center py-8">No questions added yet. Add your first question above!</p>
  ) : (
    <div className="space-y-3">
      {questions.map((question, idx) => (
        <div key={question.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                  Q{idx + 1}
                </span>
                <span className="text-xs text-gray-500">{question.type}</span>
                <span className="text-xs text-green-600 font-medium">{question.points} pts</span>
              </div>
              <p className="font-medium">{question.questionText}</p>
              {question.type === 'MCQ' && question.options && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Options:</p>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(question.options).map((option, optIdx) => (
                      <span key={optIdx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {question.type === 'RANGE' && question.minValue && question.maxValue && (
                <p className="text-sm text-gray-600 mt-1">
                  Range: {question.minValue} - {question.maxValue}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
    </div>
  );

  const renderResultsTab = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold mb-4">Update Match Results</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Match</label>
        <select
          onChange={async (e) => {
            const match = matches.find(m => m.id === parseInt(e.target.value));
            setSelectedMatch(match);
            if (match) {
              await loadQuestions(match.id);
              // Load existing results if any
              try {
                const existingResults = await resultAPI.getMatchResults(match.id);
                if (existingResults.data && existingResults.data.length > 0) {
                  // Pre-fill results if they exist
                  const formattedResults = existingResults.data
                    .filter(r => r.correctAnswer)
                    .map(r => ({
                      questionId: r.questionId,
                      correctAnswer: r.rawAnswer || r.correctAnswer
                    }));
                  setResults(formattedResults);
                  toast.success('Loaded existing results');
                } else {
                  setResults([]);
                }
              } catch (err) {
                console.log('No existing results');
                setResults([]);
              }
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
          value={selectedMatch?.id || ''}
        >
          <option value="">Select a match</option>
          {matches.map(match => (
            <option key={match.id} value={match.id}>
              {match.team1} vs {match.team2} - {new Date(match.matchDate).toLocaleDateString()} ({match.status})
            </option>
          ))}
        </select>
      </div>
      
      {selectedMatch && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Selected Match:</strong> {selectedMatch.team1} vs {selectedMatch.team2}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Status:</strong> {selectedMatch.status}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              💡 Tip: Results are saved separately. Use the Matches tab to mark the match as completed when ready.
            </p>
          </div>
          
          <h4 className="font-medium text-gray-700">Enter correct answers for {selectedMatch.team1} vs {selectedMatch.team2}:</h4>
          
          {questions.map((question) => {
            // Find existing result for this question
            const existingResult = results.find(r => r.questionId === question.id);
            
            // Parse options for MCQ type
            let mcqOptions = [];
            if (question.type === 'MCQ' && question.options) {
              try {
                mcqOptions = JSON.parse(question.options);
              } catch (e) {
                console.error('Error parsing options:', e);
              }
            }
            
            return (
              <div key={question.id} className="border rounded-lg p-4">
                <div className="mb-2">
                  <p className="font-medium">{question.questionText}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Type: {question.type} | Points: {question.points}
                  </p>
                  {question.type === 'MCQ' && mcqOptions.length > 0 && (
                    <p className="text-xs text-purple-600 mt-1">
                      Options: {mcqOptions.join(', ')}
                    </p>
                  )}
                </div>
                
                {/* Different input types based on question type */}
                {question.type === 'MCQ' ? (
                  <select
                    value={existingResult ? existingResult.correctAnswer : ''}
                    onChange={(e) => {
                      const updatedResults = [...results];
                      const answerValue = e.target.value;
                      
                      const existing = updatedResults.find(r => r.questionId === question.id);
                      if (existing) {
                        existing.correctAnswer = answerValue;
                      } else {
                        updatedResults.push({
                          questionId: question.id,
                          correctAnswer: answerValue
                        });
                      }
                      setResults(updatedResults);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select correct answer</option>
                    {mcqOptions.map((option, idx) => (
                      <option key={idx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : question.type === 'BOOLEAN' ? (
                  <select
                    value={existingResult ? existingResult.correctAnswer : ''}
                    onChange={(e) => {
                      const updatedResults = [...results];
                      const answerValue = e.target.value;
                      
                      const existing = updatedResults.find(r => r.questionId === question.id);
                      if (existing) {
                        existing.correctAnswer = answerValue;
                      } else {
                        updatedResults.push({
                          questionId: question.id,
                          correctAnswer: answerValue
                        });
                      }
                      setResults(updatedResults);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Yes or No</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                ) : question.type === 'NUMBER' ? (
                  <input
                    type="number"
                    placeholder="e.g., 150"
                    value={existingResult ? existingResult.correctAnswer : ''}
                    onChange={(e) => {
                      const updatedResults = [...results];
                      const answerValue = parseInt(e.target.value);
                      
                      const existing = updatedResults.find(r => r.questionId === question.id);
                      if (existing) {
                        existing.correctAnswer = answerValue;
                      } else {
                        updatedResults.push({
                          questionId: question.id,
                          correctAnswer: answerValue
                        });
                      }
                      setResults(updatedResults);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  />
                ) : question.type === 'RANGE' ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Min-Max (e.g., 40-60)"
                      value={existingResult ? existingResult.correctAnswer : ''}
                      onChange={(e) => {
                        const updatedResults = [...results];
                        let answerValue = e.target.value;
                        
                        if (answerValue.includes('-')) {
                          const [min, max] = answerValue.split('-');
                          answerValue = JSON.stringify({ min: parseInt(min), max: parseInt(max) });
                        }
                        
                        const existing = updatedResults.find(r => r.questionId === question.id);
                        if (existing) {
                          existing.correctAnswer = answerValue;
                        } else {
                          updatedResults.push({
                            questionId: question.id,
                            correctAnswer: answerValue
                          });
                        }
                        setResults(updatedResults);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter correct answer"
                    value={existingResult ? existingResult.correctAnswer : ''}
                    onChange={(e) => {
                      const updatedResults = [...results];
                      const answerValue = e.target.value;
                      
                      const existing = updatedResults.find(r => r.questionId === question.id);
                      if (existing) {
                        existing.correctAnswer = answerValue;
                      } else {
                        updatedResults.push({
                          questionId: question.id,
                          correctAnswer: answerValue
                        });
                      }
                      setResults(updatedResults);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  />
                )}
                
                {existingResult && existingResult.correctAnswer && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Previously saved: {existingResult.correctAnswer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {selectedMatch && questions.length > 0 && (
        <button
          onClick={() => {
            if (results.length === 0) {
              toast.error('Please add at least one result');
              return;
            }
            
            // Check if all questions have answers
            const missingQuestions = questions.filter(q => 
              !results.find(r => r.questionId === q.id)
            );
            
            if (missingQuestions.length > 0) {
              toast.error(`Please fill answers for all ${questions.length} questions. Missing: ${missingQuestions.length}`);
              return;
            }
            
            handleUpdateResults({
              matchId: selectedMatch.id,
              results: results
            });
          }}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 w-full"
        >
          {loading ? 'Updating...' : 'Save Results Only'}
        </button>
      )}
      
      {selectedMatch && questions.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          Please add questions for this match first.
        </div>
      )}
    </div>
  </div>
);

  if (loading && matches.length === 0) {
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Loading admin dashboard..." />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white p-8 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="opacity-90">Manage matches, questions, and results</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                <span className="text-sm">Logged in as: {localStorage.getItem('adminEmail')}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['matches', 'questions', 'results'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                      activeTab === tab
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab === 'matches' && '📋 Matches'}
                    {tab === 'questions' && '❓ Questions'}
                    {tab === 'results' && '🏆 Results'}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */} 
          {activeTab === 'matches' && renderMatchesTab()}
          {activeTab === 'questions' && renderQuestionsTab()}
          {activeTab === 'results' && renderResultsTab()}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;