import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';

const SpinningWheel = ({ foods, isSpinning, onSpin, theme, result }) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);

  // Calculate segment angle
  const segmentAngle = foods.length > 0 ? 360 / foods.length : 0;

  // Colors for wheel segments
  const getSegmentColor = (index) => {
    if (theme?.colors) {
      return theme.colors[index % theme.colors.length];
    }
    // Fallback colors
    const defaultColors = ['#FF6B6B', '#FF8E53', '#FF6B9D', '#FF9F43', '#4ECDC4', '#45B7D1'];
    return defaultColors[index % defaultColors.length];
  };

  // Trigger spin animation
  useEffect(() => {
    if (isSpinning) {
      const newRotation = rotation + 1800 + Math.random() * 720; // 5+ full rotations
      setRotation(newRotation);
    }
  }, [isSpinning]);

  // Generate wheel segments
  const renderWheelSegments = () => {
    if (foods.length === 0) return null;

    return foods.map((food, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = (index + 1) * segmentAngle;
      const midAngle = (startAngle + endAngle) / 2;
      
      // Convert to radians for calculations
      const startRadians = (startAngle * Math.PI) / 180;
      const endRadians = (endAngle * Math.PI) / 180;
      
      // SVG path for the segment
      const radius = 150;
      const innerRadius = 30;
      
      const x1 = Math.cos(startRadians) * radius;
      const y1 = Math.sin(startRadians) * radius;
      const x2 = Math.cos(endRadians) * radius;
      const y2 = Math.sin(endRadians) * radius;
      
      const x3 = Math.cos(endRadians) * innerRadius;
      const y3 = Math.sin(endRadians) * innerRadius;
      const x4 = Math.cos(startRadians) * innerRadius;
      const y4 = Math.sin(startRadians) * innerRadius;
      
      const largeArcFlag = segmentAngle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${x4} ${y4}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ');

      // Text position
      const textRadius = (radius + innerRadius) / 2;
      const textAngle = (midAngle * Math.PI) / 180;
      const textX = Math.cos(textAngle) * textRadius;
      const textY = Math.sin(textAngle) * textRadius;

      return (
        <g key={index}>
          <path
            d={pathData}
            fill={getSegmentColor(index)}
            stroke="white"
            strokeWidth="2"
            className="drop-shadow-lg"
          />
          <text
            x={textX}
            y={textY}
            fill="white"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(${midAngle}, ${textX}, ${textY})`}
            className="drop-shadow-sm pointer-events-none select-none"
            style={{ 
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              maxWidth: '60px'
            }}
          >
            {food.length > 15 ? `${food.substring(0, 12)}...` : food}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Wheel Container */}
      <div className="relative">
        {/* Wheel Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-30">
          <div 
            className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-white"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
          ></div>
        </div>

        {/* Main Wheel */}
        <motion.div
          ref={wheelRef}
          className="relative w-80 h-80 rounded-full shadow-2xl"
          style={{
            background: 'conic-gradient(from 0deg, #ddd, #bbb, #ddd)',
          }}
          animate={{ rotate: rotation }}
          transition={{
            duration: isSpinning ? 4 : 0,
            ease: isSpinning ? "easeOut" : "linear"
          }}
        >
          {foods.length > 0 ? (
            <svg
              width="320"
              height="320"
              viewBox="-160 -160 320 320"
              className="absolute inset-0"
            >
              {renderWheelSegments()}
            </svg>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🍽️</div>
                <div className="text-lg font-semibold">Select foods to spin!</div>
              </div>
            </div>
          )}

          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center z-20">
            <div className="text-2xl">🎡</div>
          </div>
        </motion.div>

        {/* Glow Effect */}
        <div 
          className="absolute inset-0 rounded-full opacity-50 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${theme?.colors?.[0] || '#FF6B6B'}40 0%, transparent 70%)`,
            filter: 'blur(20px)',
            zIndex: -1
          }}
        ></div>
      </div>

      {/* Spin Button */}
      <motion.button
        onClick={onSpin}
        disabled={foods.length === 0 || isSpinning}
        className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-3 ${
          foods.length === 0 || isSpinning
            ? 'bg-gray-500 cursor-not-allowed opacity-50'
            : 'bg-white text-gray-800 hover:bg-gray-100 shadow-xl hover:shadow-2xl pulse-glow'
        }`}
        whileHover={foods.length > 0 && !isSpinning ? { scale: 1.05 } : {}}
        whileTap={foods.length > 0 && !isSpinning ? { scale: 0.95 } : {}}
        animate={isSpinning ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 0 }}
      >
        {isSpinning ? (
          <>
            <RotateCcw className="w-6 h-6 animate-spin" />
            Spinning...
          </>
        ) : (
          <>
            <Play className="w-6 h-6" />
            Spin the Wheel!
          </>
        )}
      </motion.button>

      {/* Food Count Display */}
      {foods.length > 0 && (
        <motion.div
          className="text-white/80 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-sm font-medium">
            🎲 {foods.length} delicious option{foods.length !== 1 ? 's' : ''} ready!
          </div>
        </motion.div>
      )}

      {/* Current Result Display (if spinning) */}
      {isSpinning && (
        <motion.div
          className="text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="text-lg font-semibold animate-pulse">
            ✨ The wheel is deciding your fate... ✨
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SpinningWheel;