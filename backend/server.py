from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List, Optional
import os
import random
import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Food Roulette API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL')
client = MongoClient(MONGO_URL)
db = client.food_roulette

# Data Models
class FoodItem(BaseModel):
    id: str
    name: str
    category: Optional[str] = None
    emoji: Optional[str] = None

class CustomFoodList(BaseModel):
    id: str
    name: str
    items: List[str]
    created_at: str

class SpinResult(BaseModel):
    selected_food: str
    theme: dict
    timestamp: str

# Pre-made food lists by category
PREMADE_LISTS = {
    "italian": {
        "name": "Italian Cuisine",
        "items": ["Pizza Margherita 🍕", "Spaghetti Carbonara 🍝", "Lasagna 🍝", "Risotto 🍚", "Tiramisu 🍰", "Gelato 🍨", "Bruschetta 🍞", "Osso Buco 🍖"]
    },
    "asian": {
        "name": "Asian Cuisine", 
        "items": ["Sushi 🍣", "Ramen 🍜", "Pad Thai 🍝", "Dumplings 🥟", "Fried Rice 🍚", "Pho 🍲", "Curry 🍛", "Teriyaki Chicken 🍗"]
    },
    "mexican": {
        "name": "Mexican Cuisine",
        "items": ["Tacos 🌮", "Burrito 🌯", "Quesadilla 🫓", "Enchiladas 🌮", "Guacamole 🥑", "Nachos 🧀", "Churros 🥨", "Pozole 🍲"]
    },
    "american": {
        "name": "American Classics",
        "items": ["Burger 🍔", "Hot Dog 🌭", "BBQ Ribs 🍖", "Mac & Cheese 🧀", "Fried Chicken 🍗", "Apple Pie 🥧", "Pancakes 🥞", "Buffalo Wings 🍗"]
    },
    "desserts": {
        "name": "Sweet Treats",
        "items": ["Chocolate Cake 🍰", "Ice Cream 🍨", "Cookies 🍪", "Donuts 🍩", "Cheesecake 🍰", "Brownies 🍫", "Cupcakes 🧁", "Pie 🥧"]
    },
    "healthy": {
        "name": "Healthy Options",
        "items": ["Greek Salad 🥗", "Quinoa Bowl 🥣", "Grilled Salmon 🐟", "Avocado Toast 🥑", "Smoothie Bowl 🍓", "Buddha Bowl 🥙", "Veggie Wrap 🌯", "Fresh Fruit 🍎"]
    }
}

# Visual themes for the spinning wheel
THEMES = [
    {
        "id": "sunset",
        "name": "Sunset Dreams",
        "colors": ["#FF6B6B", "#FF8E53", "#FF6B9D", "#FF9F43"],
        "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "wheelStyle": "modern"
    },
    {
        "id": "ocean",
        "name": "Ocean Breeze", 
        "colors": ["#4ECDC4", "#44A08D", "#1CB5E0", "#00B4DB"],
        "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "wheelStyle": "elegant"
    },
    {
        "id": "forest",
        "name": "Forest Fresh",
        "colors": ["#56C596", "#7FB069", "#A8E6CF", "#88D8B0"],
        "background": "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
        "wheelStyle": "natural"
    },
    {
        "id": "candy",
        "name": "Candy Pop",
        "colors": ["#FE8A71", "#F38BA8", "#E76F51", "#E9C46A"],
        "background": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "wheelStyle": "playful"
    },
    {
        "id": "midnight",
        "name": "Midnight Magic",
        "colors": ["#6C5CE7", "#A29BFE", "#74B9FF", "#00CEC9"],
        "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "wheelStyle": "mystical"
    }
]

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Food Roulette API is running!"}

@app.get("/api/premade-lists")
async def get_premade_lists():
    """Get all available pre-made food lists"""
    return {"lists": PREMADE_LISTS}

@app.get("/api/premade-lists/{category}")
async def get_premade_list(category: str):
    """Get a specific pre-made food list"""
    if category not in PREMADE_LISTS:
        raise HTTPException(status_code=404, detail="Category not found")
    return PREMADE_LISTS[category]

@app.post("/api/custom-lists")
async def create_custom_list(name: str, items: List[str]):
    """Create a custom food list"""
    if not items:
        raise HTTPException(status_code=400, detail="Items list cannot be empty")
    
    custom_list = {
        "id": str(uuid.uuid4()),
        "name": name,
        "items": items,
        "created_at": str(datetime.now())
    }
    
    # Store in MongoDB (optional for persistence)
    try:
        db.custom_lists.insert_one(custom_list)
    except Exception as e:
        print(f"MongoDB insert failed: {e}")
    
    return custom_list

@app.get("/api/custom-lists")
async def get_custom_lists():
    """Get all custom food lists"""
    try:
        lists = list(db.custom_lists.find({}, {"_id": 0}))
        return {"lists": lists}
    except Exception as e:
        print(f"MongoDB query failed: {e}")
        return {"lists": []}

@app.post("/api/spin")
async def spin_wheel(food_items: List[str]):
    """Spin the wheel and get a random food selection with theme"""
    if not food_items:
        raise HTTPException(status_code=400, detail="No food items provided")
    
    # Select random food
    selected_food = random.choice(food_items)
    
    # Select random theme
    selected_theme = random.choice(THEMES)
    
    # Create spin result
    result = {
        "selected_food": selected_food,
        "theme": selected_theme,
        "timestamp": str(pd.Timestamp.now()),
        "total_options": len(food_items)
    }
    
    return result

@app.get("/api/themes")
async def get_themes():
    """Get all available themes"""
    return {"themes": THEMES}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)