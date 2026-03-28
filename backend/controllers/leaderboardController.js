const User = require('../models/User');
const PredictionAnswer = require('../models/PredictionAnswer');
const PredictionQuestion = require('../models/PredictionQuestion');
const MatchResult = require('../models/MatchResult');
const Match = require('../models/Match');
const { calculatePoints } = require('../utils/pointsCalculator');

// Get overall leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.findAll({
      order: [['totalPoints', 'DESC']],
      limit: 100,
      attributes: ['id', 'name', 'totalPoints']
    });
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get match-specific leaderboard
exports.getMatchLeaderboard = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    console.log('Getting leaderboard for match:', matchId);
    
    // Get all questions for this match
    const questions = await PredictionQuestion.findAll({
      where: { matchId: parseInt(matchId) },
      attributes: ['id']
    });
    
    const questionIds = questions.map(q => q.id);
    
    if (questionIds.length === 0) {
      console.log('No questions found for match:', matchId);
      return res.json([]);
    }
    
    // Get all answers for these questions
    const answers = await PredictionAnswer.findAll({
      where: {
        questionId: questionIds
      }
    });
    
    // Get all results for these questions
    const results = await MatchResult.findAll({
      where: {
        questionId: questionIds
      }
    });
    
    // Get all questions with their details
    const questionsWithDetails = await PredictionQuestion.findAll({
      where: { id: questionIds }
    });
    
    // Create a map for quick lookup
    const resultsMap = {};
    results.forEach(result => {
      resultsMap[result.questionId] = result.correctAnswer;
    });
    
    const questionsMap = {};
    questionsWithDetails.forEach(q => {
      questionsMap[q.id] = q;
    });
    
    // Calculate points per user
    const userPoints = {};
    
    for (const answer of answers) {
      const question = questionsMap[answer.questionId];
      const correctAnswer = resultsMap[answer.questionId];
      
      if (question && correctAnswer) {
        const userAnswer = JSON.parse(answer.answer);
        let correctAnswerParsed;
        
        try {
          correctAnswerParsed = JSON.parse(correctAnswer);
        } catch (e) {
          correctAnswerParsed = correctAnswer;
        }
        
        const points = calculatePoints(question, userAnswer, correctAnswerParsed);
        
        if (!userPoints[answer.userId]) {
          userPoints[answer.userId] = 0;
        }
        userPoints[answer.userId] += points;
      }
    }
    
    // Get user details
    const userIds = Object.keys(userPoints);
    if (userIds.length === 0) {
      return res.json([]);
    }
    
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'name']
    });
    
    // Combine data
    const matchLeaderboard = users.map(user => ({
      id: user.id,
      name: user.name,
      points: userPoints[user.id] || 0
    })).sort((a, b) => b.points - a.points);
    
    console.log('Match leaderboard:', matchLeaderboard);
    res.json(matchLeaderboard);
  } catch (error) {
    console.error('Error getting match leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get user's points for a specific match
exports.getUserMatchPoints = async (req, res) => {
  try {
    const { userId, matchId } = req.params;
    
    // Get all questions for this match
    const questions = await PredictionQuestion.findAll({
      where: { matchId: parseInt(matchId) },
      attributes: ['id', 'questionText', 'type', 'points']
    });
    
    const questionIds = questions.map(q => q.id);
    
    // Get user's answers
    const answers = await PredictionAnswer.findAll({
      where: {
        userId: parseInt(userId),
        questionId: questionIds
      }
    });
    
    // Get results
    const results = await MatchResult.findAll({
      where: {
        questionId: questionIds
      }
    });
    
    // Create maps
    const resultsMap = {};
    results.forEach(result => {
      resultsMap[result.questionId] = result.correctAnswer;
    });
    
    const answersMap = {};
    answers.forEach(answer => {
      answersMap[answer.questionId] = JSON.parse(answer.answer);
    });
    
    // Calculate points
    let totalPoints = 0;
    const questionPoints = [];
    
    for (const question of questions) {
      const userAnswer = answersMap[question.id];
      const correctAnswer = resultsMap[question.id];
      
      if (userAnswer && correctAnswer) {
        let correctAnswerParsed;
        try {
          correctAnswerParsed = JSON.parse(correctAnswer);
        } catch (e) {
          correctAnswerParsed = correctAnswer;
        }
        
        const points = calculatePoints(question, userAnswer, correctAnswerParsed);
        totalPoints += points;
        
        questionPoints.push({
          questionId: question.id,
          questionText: question.questionText,
          userAnswer: userAnswer,
          correctAnswer: correctAnswerParsed,
          pointsEarned: points,
          maxPoints: question.points
        });
      } else if (userAnswer) {
        questionPoints.push({
          questionId: question.id,
          questionText: question.questionText,
          userAnswer: userAnswer,
          correctAnswer: null,
          pointsEarned: 0,
          maxPoints: question.points,
          status: 'Pending'
        });
      }
    }
    
    res.json({
      userId: parseInt(userId),
      matchId: parseInt(matchId),
      totalPoints: totalPoints,
      questionPoints: questionPoints
    });
  } catch (error) {
    console.error('Error getting user match points:', error);
    res.status(500).json({ error: error.message });
  }
};