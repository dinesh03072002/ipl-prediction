const MatchResult = require('../models/MatchResult');
const PredictionAnswer = require('../models/PredictionAnswer');
const PredictionQuestion = require('../models/PredictionQuestion');
const User = require('../models/User');
const Match = require('../models/Match');
const { calculatePoints } = require('../utils/pointsCalculator');

// Update results for a match
exports.updateResults = async (req, res) => {
  try {
    const { results, matchId } = req.body;
    
    console.log('=================================');
    console.log('UPDATE RESULTS CALLED');
    console.log('Match ID:', matchId);
    console.log('Results received:', JSON.stringify(results, null, 2));
    console.log('=================================');
    
    if (!matchId) {
      return res.status(400).json({ error: 'Match ID is required' });
    }
    
    if (!results || results.length === 0) {
      return res.status(400).json({ error: 'No results provided' });
    }
    
    // Verify the match exists
    const match = await Match.findByPk(matchId);
    if (!match) {
      console.log('Match not found:', matchId);
      return res.status(404).json({ error: 'Match not found' });
    }
    
    console.log('Match found:', match.team1, 'vs', match.team2, 'Status:', match.status);
    
    // Delete existing results for this match to avoid duplicates
    await MatchResult.destroy({
      where: { matchId: matchId }
    });
    console.log(`Deleted existing results for match ${matchId}`);
    
    // Update each result
    let updatedCount = 0;
    for (const result of results) {
      console.log(`Processing question ${result.questionId} with answer: ${result.correctAnswer}`);
      
      // Verify the question belongs to this match
      const question = await PredictionQuestion.findOne({
        where: {
          id: result.questionId,
          matchId: matchId
        }
      });
      
      if (!question) {
        console.log(`⚠️ Question ${result.questionId} does not belong to match ${matchId}`);
        continue;
      }
      
      console.log(`Question found: ${question.questionText}`);
      
      // Store the result
      const newResult = await MatchResult.create({
        questionId: result.questionId,
        matchId: matchId,
        correctAnswer: String(result.correctAnswer)
      });
      
      updatedCount++;
      console.log(`✅ Created result for question ${result.questionId}: ${result.correctAnswer}`);
    }
    
    console.log(`✅ Updated ${updatedCount} results for match ${matchId}`);
    
    // IMPORTANT: DO NOT automatically change match status to completed
    // The admin should manually mark it as completed from Matches tab
    
    // Recalculate points for all users
    await recalculateAllUserPoints();
    
    res.json({ 
      message: 'Results updated successfully', 
      updatedCount,
      matchId,
      matchStatus: match.status // Return current status (should still be 'upcoming' or 'live')
    });
  } catch (error) {
    console.error('❌ Error updating results:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get results for a match
exports.getMatchResults = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    console.log('Getting results for match:', matchId);
    
    // Get all questions for this match
    const questions = await PredictionQuestion.findAll({
      where: { matchId: parseInt(matchId) },
      attributes: ['id', 'questionText', 'type', 'points']
    });
    
    // Get results for these questions
    const results = await MatchResult.findAll({
      where: {
        matchId: parseInt(matchId)
      }
    });
    
    // Create a map for quick lookup
    const resultsMap = {};
    results.forEach(result => {
      resultsMap[result.questionId] = result.correctAnswer;
    });
    
    // Format results
    const formattedResults = questions.map(question => {
      const rawAnswer = resultsMap[question.id];
      let displayAnswer = null;
      
      if (rawAnswer) {
        if (question.type === 'NUMBER') {
          displayAnswer = rawAnswer;
        } else if (question.type === 'MCQ') {
          displayAnswer = rawAnswer;
        } else if (question.type === 'BOOLEAN') {
          displayAnswer = rawAnswer === 'yes' ? 'Yes' : 'No';
        } else if (question.type === 'RANGE') {
          if (rawAnswer.includes('-')) {
            displayAnswer = rawAnswer;
          } else {
            try {
              const parsed = JSON.parse(rawAnswer);
              if (parsed.min !== undefined) {
                displayAnswer = `${parsed.min}-${parsed.max}`;
              } else {
                displayAnswer = rawAnswer;
              }
            } catch (e) {
              displayAnswer = rawAnswer;
            }
          }
        } else {
          displayAnswer = rawAnswer;
        }
      }
      
      return {
        questionId: question.id,
        questionText: question.questionText,
        type: question.type,
        points: question.points,
        correctAnswer: displayAnswer,
        rawAnswer: rawAnswer,
        hasResult: !!rawAnswer
      };
    });
    
    res.json(formattedResults);
  } catch (error) {
    console.error('Error getting match results:', error);
    res.status(500).json({ error: error.message });
  }
};

async function recalculateAllUserPoints() {
  try {
    const users = await User.findAll();
    console.log(`Recalculating points for ${users.length} users...`);
    
    for (const user of users) {
      let totalPoints = 0;
      const answers = await PredictionAnswer.findAll({
        where: { userId: user.id }
      });
      
      for (const answer of answers) {
        const question = await PredictionQuestion.findByPk(answer.questionId);
        const result = await MatchResult.findOne({
          where: { questionId: answer.questionId }
        });
        
        if (result && question) {
          const userAnswer = JSON.parse(answer.answer);
          let correctAnswer;
          try {
            correctAnswer = JSON.parse(result.correctAnswer);
          } catch (e) {
            correctAnswer = result.correctAnswer;
          }
          
          const points = calculatePoints(question, userAnswer, correctAnswer);
          totalPoints += points;
        }
      }
      
      user.totalPoints = totalPoints;
      await user.save();
      console.log(`User ${user.name}: ${totalPoints} points`);
    }
    
    console.log('✅ Points recalculated for all users');
  } catch (error) {
    console.error('Error recalculating points:', error);
  }
}

exports.debugResults = async (req, res) => {
  try {
    const { matchId } = req.params;
    const results = await MatchResult.findAll({
      where: { matchId: parseInt(matchId) },
      raw: true
    });
    
    const questions = await PredictionQuestion.findAll({
      where: { matchId: parseInt(matchId) },
      raw: true
    });
    
    const match = await Match.findByPk(matchId, { raw: true });
    
    res.json({
      match,
      questions: questions.length,
      results: results,
      hasResults: results.length > 0
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
};