
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { matchAPI, questionAPI, predictionAPI } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import CountdownTimer from '../components/CountdownTimer';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const PredictionForm = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userName, setUserName] = useState('');
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading data for matchId:', matchId);
      
      // Load all matches
      const matchesRes = await matchAPI.getAll();
      console.log('Matches loaded:', matchesRes.data);
      
      // Find current match
      const currentMatch = matchesRes.data.find(m => m.id === parseInt(matchId));
      console.log('Current match:', currentMatch);
      
      if (!currentMatch) {
        toast.error('Match not found');
        navigate('/');
        return;
      }
      
      setMatch(currentMatch);
      
      // Load questions for this match
      const questionsRes = await questionAPI.getByMatch(matchId);
      console.log('Questions loaded:', questionsRes.data);
      
      if (!questionsRes.data || questionsRes.data.length === 0) {
        toast.error('No questions available for this match yet. Please check back later.');
        setQuestions([]);
      } else {
        setQuestions(questionsRes.data);
        
        // Initialize answers
        const initialAnswers = {};
        questionsRes.data.forEach(q => {
          initialAnswers[q.id] = q.type === 'RANGE' ? { min: '', max: '' } : '';
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [matchId, navigate]);

  useEffect(() => {
    // Load saved name from localStorage
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
    
    loadData();
  }, [loadData]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const validateAnswers = () => {
    // Check if there are any questions
    if (questions.length === 0) {
      toast.error('No questions available for this match');
      return false;
    }
    
    // Validate each answer
    for (const question of questions) {
      const answer = answers[question.id];
      
      if (!answer || answer === '' || (typeof answer === 'object' && (!answer.min || !answer.max))) {
        toast.error(`Please answer: ${question.questionText}`);
        return false;
      }
      
      if (question.type === 'RANGE') {
        if (answer.min >= answer.max) {
          toast.error(`Invalid range for: ${question.questionText}`);
          return false;
        }
      }
      
      if (question.type === 'NUMBER' && answer < 0) {
        toast.error(`Invalid number for: ${question.questionText}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (questions.length === 0) {
      toast.error('No questions available for this match');
      return;
    }
    
    if (!validateAnswers()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Format answers for API
      const formattedAnswers = questions.map(q => ({
        questionId: q.id,
        value: answers[q.id]
      }));
      
      console.log('Submitting predictions:', {
        userName: userName.trim(),
        answers: formattedAnswers
      });
      
      
      // Save name to localStorage
      localStorage.setItem('userName', userName.trim());
      
      toast.success('Predictions submitted successfully! 🎉');
      navigate('/');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit predictions');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Loading prediction form..." />
      </>
    );
  }

  if (!match) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Match not found!
          </div>
        </div>
      </>
    );
  }

  const isMatchStarted = new Date(match.matchDate) <= new Date();

  if (isMatchStarted) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <h3 className="font-bold">Match has already started!</h3>
            <p>Predictions are no longer being accepted for this match.</p>
          </div>
        </div>
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
            <h3 className="font-bold">No Questions Available</h3>
            <p>Questions for this match haven't been added yet. Please check back later.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-3 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8 text-white">
              <h1 className="text-2xl font-bold mb-2">
                {match.team1} vs {match.team2}
              </h1>
              <p className="opacity-90">
                {new Date(match.matchDate).toLocaleString()}
              </p>
            </div>

            {/* Countdown */}
            <div className="p-6 border-b">
              <CountdownTimer targetDate={match.matchDate} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* User Name Input */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your name"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This name will appear on the leaderboard
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{currentStep + 1} of {questions.length + 1}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / (questions.length + 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Questions or Welcome */}
              {currentStep === 0 ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Welcome! 👋</h3>
                  <p className="text-gray-600">
                    You'll be predicting the outcome of this IPL match. Each correct prediction earns you points.
                    Make sure to submit your predictions before the match starts!
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💡 Tip: The more accurate your predictions, the higher you'll rank on the leaderboard!
                    </p>
                  </div>
                </div>
              ) : (
                <QuestionCard
                  question={questions[currentStep - 1]}
                  value={answers[questions[currentStep - 1]?.id]}
                  onChange={handleAnswerChange}
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Previous
                  </button>
                )}
                {currentStep < questions.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Predictions'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PredictionForm;