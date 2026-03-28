import React, { useState } from 'react';

const QuestionCard = ({ question, value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue) => {
    setLocalValue(newValue);
    onChange(question.id, newValue);
  };

  const renderInput = () => {
    switch (question.type) {
      case 'MCQ':
        const options = JSON.parse(question.options);
        return (
          <div className="space-y-2">
            {options.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={localValue === option}
                  onChange={(e) => handleChange(e.target.value)}
                  className="h-4 w-4 text-purple-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'NUMBER':
        return (
          <input
            type="number"
            value={localValue || ''}
            onChange={(e) => handleChange(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter a number"
            min="0"
          />
        );

      case 'RANGE':
        const rangeValue = localValue || { min: '', max: '' };
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum</label>
              <input
                type="number"
                value={rangeValue.min}
                onChange={(e) => handleChange({ ...rangeValue, min: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Min"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum</label>
              <input
                type="number"
                value={rangeValue.max}
                onChange={(e) => handleChange({ ...rangeValue, max: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Max"
              />
            </div>
          </div>
        );

      case 'BOOLEAN':
        return (
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="yes"
                checked={localValue === 'yes'}
                onChange={(e) => handleChange(e.target.value)}
                className="h-4 w-4 text-purple-600"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="no"
                checked={localValue === 'no'}
                onChange={(e) => handleChange(e.target.value)}
                className="h-4 w-4 text-purple-600"
              />
              <span>No</span>
            </label>
          </div>
        );

      case 'TEXT':
        return (
          <input
            type="text"
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your prediction"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">{question.questionText}</h3>
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {question.points} points
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Type: {question.type === 'MCQ' ? 'Multiple Choice' : 
                 question.type === 'NUMBER' ? 'Number' :
                 question.type === 'RANGE' ? 'Range' :
                 question.type === 'BOOLEAN' ? 'Yes/No' : 'Text'}
        </p>
      </div>
      
      <div className="mt-4">
        {renderInput()}
      </div>
    </div>
  );
};

export default QuestionCard;