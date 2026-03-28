// Fuzzy matching function for text answers
function fuzzyMatch(str1, str2) {
  if (!str1 || !str2) return false;
  
  // Convert to lowercase and trim
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Exact match
  if (s1 === s2) return true;
  
  // Remove spaces and special characters for comparison
  const normalize = (str) => str.replace(/[^a-z0-9]/g, '');
  if (normalize(s1) === normalize(s2)) return true;
  
  // Common name variations mapping
  const nameVariations = {
    'virat kohli': ['kohli', 'virat', 'v kohli', 'virat kohli', 'king kohli'],
    'rohit sharma': ['rohit', 'sharma', 'r sharma', 'rohit sharma', 'hitman'],
    'ms dhoni': ['dhoni', 'msd', 'm s dhoni', 'mahi', 'thala'],
    'rcb': ['royal challengers', 'royal challengers bangalore', 'bangalore'],
    'mi': ['mumbai indians', 'mumbai', 'indians'],
    'csk': ['chennai super kings', 'chennai', 'super kings'],
    'kkr': ['kolkata knight riders', 'kolkata', 'knight riders'],
  };
  
  // Check variations
  for (const [key, variations] of Object.entries(nameVariations)) {
    if ((s1 === key && variations.includes(s2)) || 
        (variations.includes(s1) && s2 === key) ||
        (variations.includes(s1) && variations.includes(s2))) {
      return true;
    }
  }
  
  return false;
}

// Normalize answer based on question type
function normalizeAnswer(answer, type) {
  if (type === 'NUMBER') {
    return parseFloat(answer);
  } else if (type === 'BOOLEAN') {
    const boolStr = String(answer).toLowerCase();
    if (boolStr === 'yes' || boolStr === 'true' || boolStr === '1') return 'yes';
    if (boolStr === 'no' || boolStr === 'false' || boolStr === '0') return 'no';
    return answer;
  } else if (type === 'RANGE') {
    if (typeof answer === 'object' && answer.min && answer.max) {
      return { min: parseFloat(answer.min), max: parseFloat(answer.max) };
    }
    return answer;
  } else if (type === 'TEXT') {
    return String(answer).toLowerCase().trim();
  }
  return answer;
}

// Compare answers based on question type
function compareAnswers(question, userAnswer, correctAnswer) {
  const userNorm = normalizeAnswer(userAnswer, question.type);
  const correctNorm = normalizeAnswer(correctAnswer, question.type);
  
  switch (question.type) {
    case 'MCQ':
    case 'BOOLEAN':
      // Case-insensitive comparison for MCQ and Boolean
      return String(userNorm).toLowerCase() === String(correctNorm).toLowerCase();
      
    case 'NUMBER':
      // Convert to numbers and compare
      const userNum = parseFloat(userNorm);
      const correctNum = parseFloat(correctNorm);
      return userNum === correctNum;
      
    case 'RANGE':
      // Check if correct answer falls within user's range
      if (userNorm && userNorm.min !== undefined && userNorm.max !== undefined) {
        const correctNum = parseFloat(correctNorm);
        return correctNum >= userNorm.min && correctNum <= userNorm.max;
      }
      return false;
      
    case 'TEXT':
      // Use fuzzy matching for text
      return fuzzyMatch(userNorm, correctNorm);
      
    default:
      return false;
  }
}

// Calculate points with partial scoring for numbers
function calculatePoints(question, userAnswer, correctAnswer) {
  const userNorm = normalizeAnswer(userAnswer, question.type);
  const correctNorm = normalizeAnswer(correctAnswer, question.type);
  
  switch (question.type) {
    case 'MCQ':
    case 'BOOLEAN':
      // Exact match for MCQ and Boolean
      return compareAnswers(question, userAnswer, correctAnswer) ? question.points : 0;
      
    case 'NUMBER':
      // Exact match gives full points
      if (compareAnswers(question, userAnswer, correctAnswer)) {
        return question.points;
      }
      // Partial scoring: within ±10 range gives half points
      const diff = Math.abs(parseFloat(userNorm) - parseFloat(correctNorm));
      if (diff <= 10) {
        return Math.floor(question.points * 0.5);
      }
      return 0;
      
    case 'RANGE':
      // Full points if correct answer falls within range
      return compareAnswers(question, userAnswer, correctAnswer) ? question.points : 0;
      
    case 'TEXT':
      // Fuzzy matching for text
      if (compareAnswers(question, userAnswer, correctAnswer)) {
        return question.points;
      }
      // Check for partial matches (optional)
      const userText = String(userNorm);
      const correctText = String(correctNorm);
      if (userText.includes(correctText) || correctText.includes(userText)) {
        return Math.floor(question.points * 0.7);
      }
      return 0;
      
    default:
      return 0;
  }
}

module.exports = {
  calculatePoints,
  normalizeAnswer,
  compareAnswers,
  fuzzyMatch
};