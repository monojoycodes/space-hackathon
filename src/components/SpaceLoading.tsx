
import React, { useEffect, useState } from 'react';
import { Loader, Star, MoveVertical, Rocket } from 'lucide-react';

interface SpaceLoadingProps {
  timeout?: number;
}

const SpaceLoading: React.FC<SpaceLoadingProps> = ({ timeout = 2000 }) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, timeout);

    // Animate progress bar
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (timeout / 100));
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [timeout]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 dark:bg-gray-900 overflow-hidden">
      <div className="text-center space-y-4 relative">
        {/* Orbiting planet */}
        <div className="absolute w-8 h-8 rounded-full bg-blue-500 animate-orbit" 
          style={{
            boxShadow: '0 0 20px 2px rgba(59, 130, 246, 0.6)',
            animation: 'orbit 8s linear infinite'
          }} 
        />
        
        {/* Central loader */}
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-space-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="w-16 h-16 border-4 border-purple-500 border-b-transparent rounded-full animate-spin-reverse mx-auto absolute inset-0 m-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Rocket className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="space-y-3 mt-6">
          <h3 className="text-2xl font-display text-white animate-pulse">Loading Space Mission</h3>
          <p className="text-sm text-blue-400 dark:text-blue-300 animate-float">
            <MoveVertical className="h-4 w-4 inline mr-2 animate-bounce" />
            Preparing for cosmic journey...
          </p>
        </div>
        
        {/* Floating stars animation */}
        <div className="absolute inset-0 overflow-hidden opacity-80 pointer-events-none">
          {[...Array(100)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full animate-twinkle"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                backgroundColor: i % 5 === 0 ? '#f59e0b' : i % 7 === 0 ? '#3b82f6' : '#ffffff',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${(Math.random() * 3) + 1}s`,
                animationDelay: `${Math.random() * 2}s`,
                boxShadow: i % 10 === 0 ? '0 0 8px 2px rgba(255, 255, 255, 0.8)' : 'none'
              }}
            />
          ))}
        </div>
        
        {/* Shooting stars */}
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `shootingStar ${Math.random() * 5 + 5}s linear ${Math.random() * 10}s infinite`
            }}
          >
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform -translate-x-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpaceLoading;
