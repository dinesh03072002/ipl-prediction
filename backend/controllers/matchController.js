const Match = require('../models/Match');

exports.getAllMatches = async (req, res) => {
  try {
    const matches = await Match.findAll({
      order: [['matchDate', 'ASC']]
    });
    res.json(matches);
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createMatch = async (req, res) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json(match);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateMatchStatus = async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    match.status = req.body.status;
    await match.save();
    res.json(match);
  } catch (error) {
    console.error('Error updating match status:', error);
    res.status(500).json({ error: error.message });
  }
};