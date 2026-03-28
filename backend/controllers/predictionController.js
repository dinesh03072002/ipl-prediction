
const PredictionAnswer = require('../models/PredictionAnswer');
const User = require('../models/User');
const Match = require('../models/Match');
const PredictionQuestion = require('../models/PredictionQuestion');
const MatchResult = require('../models/MatchResult');

exports.submitPrediction = async (req, res) => {
  try {
    const { userName, answers } = req.body;
    
    console.log('Submitting predictions for user:', userName);
    console.log('Answers:', answers);
    
    if (!answers || answers.length === 0) {
      return res.status(400).json({ error: 'No answers provided' });
    }
    
    // Get the first question to find the match
    const firstQuestion = await PredictionQuestion.findByPk(answers[0].questionId);
    if (!firstQuestion) {
      return res.status(400).json({ error: 'Invalid question' });
    }
    
    const match = await Match.findByPk(firstQuestion.matchId);
    if (!match) {
      return res.status(400).json({ error: 'Match not found' });
    }
    
    // Check if match has started
    if (new Date(match.matchDate) < new Date()) {
      return res.status(400).json({ error: 'Match has already started' });
    }
    
    // Find or create user
    let user = await User.findOne({ where: { name: userName } });
    if (!user) {
      user = await User.create({ name: userName });
      console.log('Created new user:', user.id);
    }
    
    // Check if user already submitted for this match
    const allUserAnswers = await PredictionAnswer.findAll({
      where: { userId: user.id }
    });
    
    // Get all questions for this match
    const matchQuestions = await PredictionQuestion.findAll({
      where: { matchId: match.id }
    });
    const matchQuestionIds = matchQuestions.map(q => q.id);
    
    // Check if any answer exists for this match
    const existingAnswers = allUserAnswers.filter(answer => 
      matchQuestionIds.includes(answer.questionId)
    );
    
    if (existingAnswers.length > 0) {
      return res.status(400).json({ error: 'You have already submitted predictions for this match' });
    }
    
    // Submit answers
    for (const answer of answers) {
      await PredictionAnswer.create({
        userId: user.id,
        questionId: answer.questionId,
        answer: JSON.stringify(answer.value)
      });
      console.log('Saved answer for question:', answer.questionId);
    }
    
    res.json({ 
      message: 'Predictions submitted successfully', 
      userId: user.id 
    });
  } catch (error) {
    console.error('Error in submitPrediction:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUserPredictions = async (req, res) => {
  try {
    const predictions = await PredictionAnswer.findAll({
      where: { userId: req.params.userId },
      include: [{
        model: PredictionQuestion,
        as: 'question'
      }]
    });
    res.json(predictions);
  } catch (error) {
    console.error('Error in getUserPredictions:', error);
    res.status(500).json({ error: error.message });
  }
};