export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getMatchStatus = (matchDate, status) => {
  const now = new Date();
  const matchTime = new Date(matchDate);
  
  if (status === 'completed') return 'completed';
  if (matchTime < now) return 'live';
  return 'upcoming';
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'upcoming':
      return 'bg-green-100 text-green-800';
    case 'live':
      return 'bg-red-100 text-red-800 animate-pulse';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const calculatePointsEarned = (questionType, userAnswer, correctAnswer, points) => {
  switch (questionType) {
    case 'MCQ':
    case 'BOOLEAN':
      return userAnswer === correctAnswer ? points : 0;
      
    case 'NUMBER':
      if (userAnswer === correctAnswer) return points;
      const diff = Math.abs(userAnswer - correctAnswer);
      if (diff <= 10) return Math.floor(points * 0.5);
      return 0;
      
    case 'RANGE':
      const [min, max] = userAnswer;
      return (correctAnswer >= min && correctAnswer <= max) ? points : 0;
      
    default:
      return 0;
  }
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const truncateText = (text, length) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};