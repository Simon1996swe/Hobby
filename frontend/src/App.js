import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpinningWheel from './components/SpinningWheel';
import FoodSelector from './components/FoodSelector';
import ResultDisplay from './components/ResultDisplay';
import { Utensils, Sparkles } from 'lucide-react';
import './App.css';

function App() {
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [currentTheme, setCurrentTheme] = useState({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    colors: ['#FF6B6B', '#FF8E53', '#FF6B9D', '#FF9F43']
  });
  const [showResult, setShowResult] = useState(false);

  const handleFoodSelection = (foods) => {
    setSelectedFoods(foods);
    setShowResult(false);
  };

  const handleSpin = async () => {
    if (selectedFoods.length === 0) return;

    setIsSpinning(true);
    setShowResult(false);
    setSpinResult(null);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/spin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedFoods),
      });

      const result = await response.json();
      
      // Update theme
      setCurrentTheme(result.theme);
      
      // Simulate spinning duration
      setTimeout(() => {
        setSpinResult(result);
        setIsSpinning(false);
        setTimeout(() => setShowResult(true), 500);
      }, 4000);

    } catch (error) {
      console.error('Error spinning wheel:', error);
      setIsSpinning(false);
    }
  };

  const handleNewSpin = () => {
    setShowResult(false);
    setSpinResult(null);
  };

  return (
    <div 
      className="min-h-screen transition-all duration-1000 ease-in-out relative overflow-hidden"
      style={{ background: currentTheme.background }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full float"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white bg-opacity-10 rounded-full float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white bg-opacity-10 rounded-full float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-white bg-opacity-10 rounded-full float" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Utensils className="w-12 h-12 text-white drop-shadow-lg" />
            <h1 className="text-6xl font-bold text-white drop-shadow-2xl tracking-tight">
              Food Roulette
            </h1>
            <Sparkles className="w-12 h-12 text-white drop-shadow-lg" />
          </div>
          <p className="text-xl text-white/90 drop-shadow-lg font-medium">
            Spin the wheel to discover your next delicious meal! 🎡
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
          {/* Left Column - Food Selection */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <FoodSelector 
              onFoodSelection={handleFoodSelection}
              selectedFoods={selectedFoods}
            />
          </motion.div>

          {/* Right Column - Spinning Wheel and Results */}
          <motion.div
            className="flex flex-col items-center space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <SpinningWheel 
              foods={selectedFoods}
              isSpinning={isSpinning}
              onSpin={handleSpin}
              theme={currentTheme}
              result={spinResult?.selected_food}
            />

            <AnimatePresence>
              {showResult && spinResult && (
                <ResultDisplay 
                  result={spinResult}
                  onNewSpin={handleNewSpin}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer 
          className="text-center mt-16 text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-sm">
            🎲 Let the wheel decide your culinary adventure! ✨
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;