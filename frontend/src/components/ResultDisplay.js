import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Star, Clock } from 'lucide-react';

const ResultDisplay = ({ result, onNewSpin }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getResultEmoji = (food) => {
    const emojiMap = {
      'pizza': '🍕', 'burger': '🍔', 'sushi': '🍣', 'taco': '🌮',
      'pasta': '🍝', 'salad': '🥗', 'chicken': '🍗', 'fish': '🐟',
      'cake': '🍰', 'ice cream': '🍨', 'cookie': '🍪', 'pie': '🥧'
    };
    
    // Try to find matching emoji
    const foodLower = food.toLowerCase();
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (foodLower.includes(key)) {
        return emoji;
      }
    }
    
    // Default emoji if no match found
    return '🍽️';
  };

  return (
    <motion.div
      className="glass-effect rounded-3xl p-8 shadow-2xl text-center max-w-md mx-auto result-bounce"
      initial={{ scale: 0, opacity: 0, rotate: -180 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0, opacity: 0, rotate: 180 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 10,
        duration: 0.8 
      }}
      style={{ 
        background: `linear-gradient(135deg, ${result.theme.colors[0]}40, ${result.theme.colors[1]}40)`,
        backdropFilter: 'blur(20px)'
      }}
    >
      {/* Winner Announcement */}
      <motion.div
        className="mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="text-white/80 text-lg font-semibold mb-2 flex items-center justify-center gap-2">
          <Star className="w-6 h-6 text-yellow-300" />
          The Wheel Has Decided!
          <Star className="w-6 h-6 text-yellow-300" />
        </div>
      </motion.div>

      {/* Selected Food */}
      <motion.div
        className="mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
      >
        <div className="text-6xl mb-4 animate-bounce">
          {getResultEmoji(result.selected_food)}
        </div>
        <h2 className="text-4xl font-bold text-white mb-2 gradient-text">
          {result.selected_food}
        </h2>
        <p className="text-white/80 text-lg">
          Your delicious destiny awaits! 🎉
        </p>
      </motion.div>

      {/* Theme Info */}
      <motion.div
        className="mb-6 bg-white/10 rounded-2xl p-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <div className="text-white/80 text-sm font-medium mb-2 flex items-center justify-center gap-2">
          ✨ Theme: {result.theme.name}
        </div>
        <div className="flex justify-center gap-2">
          {result.theme.colors.map((color, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-full shadow-lg"
              style={{ backgroundColor: color }}
            ></div>
          ))}
        </div>
      </motion.div>

      {/* Spin Details */}
      <motion.div
        className="mb-6 text-white/60 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatTimestamp(result.timestamp)}
          </span>
          <span>
            🎲 {result.total_options} options
          </span>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex gap-4 justify-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        <motion.button
          onClick={onNewSpin}
          className="px-6 py-3 bg-white text-gray-800 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 hover:bg-gray-100 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-5 h-5" />
          Spin Again
        </motion.button>
      </motion.div>

      {/* Celebration Effects */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        {/* Confetti-like elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ResultDisplay;