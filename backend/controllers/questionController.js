const PredictionQuestion = require('../models/PredictionQuestion');
const Match = require('../models/Match');

exports.createQuestion = async (req, res) => {
  try {
    const question = await PredictionQuestion.create(req.body);
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuestionsByMatch = async (req, res) => {
  try {
    const questions = await PredictionQuestion.findAll({
      where: { matchId: req.params.matchId }
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};