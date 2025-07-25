import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChefHat, List, Utensils } from 'lucide-react';

const FoodSelector = ({ onFoodSelection, selectedFoods }) => {
  const [activeTab, setActiveTab] = useState('premade');
  const [premadeLists, setPremadeLists] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customItems, setCustomItems] = useState(['']);
  const [listName, setListName] = useState('');

  useEffect(() => {
    fetchPremadeLists();
  }, []);

  const fetchPremadeLists = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/premade-lists`);
      const data = await response.json();
      setPremadeLists(data.lists);
      
      // Set first category as default
      const firstCategory = Object.keys(data.lists)[0];
      if (firstCategory) {
        setSelectedCategory(firstCategory);
        onFoodSelection(data.lists[firstCategory].items);
      }
    } catch (error) {
      console.error('Error fetching premade lists:', error);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    onFoodSelection(premadeLists[category].items);
  };

  const handleCustomItemChange = (index, value) => {
    const newItems = [...customItems];
    newItems[index] = value;
    setCustomItems(newItems);
    
    // Filter out empty items for the wheel
    const validItems = newItems.filter(item => item.trim() !== '');
    onFoodSelection(validItems);
  };

  const addCustomItem = () => {
    setCustomItems([...customItems, '']);
  };

  const removeCustomItem = (index) => {
    if (customItems.length > 1) {
      const newItems = customItems.filter((_, i) => i !== index);
      setCustomItems(newItems);
      
      const validItems = newItems.filter(item => item.trim() !== '');
      onFoodSelection(validItems);
    }
  };

  return (
    <motion.div 
      className="glass-effect rounded-3xl p-8 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
        <ChefHat className="w-8 h-8" />
        Choose Your Food Options
      </h2>

      {/* Tab Navigation */}
      <div className="flex bg-white/20 rounded-2xl p-2 mb-8">
        <button
          onClick={() => setActiveTab('premade')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'premade'
              ? 'bg-white text-gray-800 shadow-lg'
              : 'text-white hover:bg-white/10'
          }`}
        >
          <List className="w-5 h-5" />
          Pre-made Lists
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'custom'
              ? 'bg-white text-gray-800 shadow-lg'
              : 'text-white hover:bg-white/10'
          }`}
        >
          <Utensils className="w-5 h-5" />
          Custom List
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'premade' && (
          <motion.div
            key="premade"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Category Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(premadeLists).map(([category, data]) => (
                <motion.button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`p-4 rounded-2xl font-semibold transition-all duration-300 card-hover ${
                    selectedCategory === category
                      ? 'bg-white text-gray-800 shadow-xl scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-sm font-bold mb-1">{data.name}</div>
                  <div className="text-xs opacity-80">{data.items.length} items</div>
                </motion.button>
              ))}
            </div>

            {/* Selected Category Items */}
            {selectedCategory && premadeLists[selectedCategory] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white/10 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  {premadeLists[selectedCategory].name} 🍽️
                </h3>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {premadeLists[selectedCategory].items.map((item, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/20 px-4 py-2 rounded-xl text-white text-sm font-medium food-item"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {item}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'custom' && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Create Your Custom List
              </h3>
              
              {/* Custom Items Input */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {customItems.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex gap-3 items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleCustomItemChange(index, e.target.value)}
                      placeholder={`Food item ${index + 1}...`}
                      className="flex-1 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
                    />
                    {customItems.length > 1 && (
                      <button
                        onClick={() => removeCustomItem(index)}
                        className="p-3 text-white hover:text-red-300 transition-colors duration-300 hover:scale-110"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <motion.button
                onClick={addCustomItem}
                className="mt-4 w-full py-3 px-6 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-5 h-5" />
                Add Another Item
              </motion.button>
            </div>

            {/* Valid Items Preview */}
            {customItems.filter(item => item.trim() !== '').length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white/10 rounded-2xl p-6"
              >
                <h4 className="text-lg font-bold text-white mb-3">
                  Your Items ({customItems.filter(item => item.trim() !== '').length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {customItems
                    .filter(item => item.trim() !== '')
                    .map((item, index) => (
                      <span
                        key={index}
                        className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium"
                      >
                        {item}
                      </span>
                    ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Foods Count */}
      <motion.div 
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full text-white font-semibold">
          <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
          {selectedFoods.length} items ready for the wheel!
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FoodSelector;