
import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        if (onComplete) onComplete();
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  if (isExpired) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded-lg text-sm md:text-base">
        <p className="font-bold">Match Started!</p>
        <p className="text-xs md:text-sm">Predictions are no longer being accepted for this match.</p>
      </div>
    );
  }

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds }
  ];

  return (
    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg p-3 md:p-4 text-center">
      <p className="text-xs md:text-sm font-medium mb-2">Time Remaining to Predict</p>
      <div className="flex justify-center space-x-2 md:space-x-4">
        {timeUnits.map((unit, idx) => (
          <div key={idx} className="text-center">
            <div className="bg-white bg-opacity-20 rounded-lg px-2 py-1 md:px-3 md:py-2 min-w-[40px] md:min-w-[60px]">
              <span className="text-xl md:text-2xl font-bold">{String(unit.value).padStart(2, '0')}</span>
            </div>
            <span className="text-[10px] md:text-xs mt-1 block">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;