import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import pymongo
from bson import ObjectId
from dotenv import load_dotenv

# Load env variables from the server/.env file
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from recommender import RecommenderSystem

app = FastAPI(title="Stride Recommender Service")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/stride")
client = pymongo.MongoClient(MONGO_URI)
db = client.get_database()

# Initialize recommender
recommender = RecommenderSystem(db)

# Pydantic validation models
class InstructorModel(BaseModel):
    name: str
    email: str
    bio: Optional[str] = None
    qualification: Optional[str] = None
    photoURL: Optional[str] = None

class CourseRecommendation(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., alias="_id")
    title: str
    short_description: Optional[str] = None
    detailed_description: Optional[str] = None
    price: float
    discount_price: Optional[float] = None
    instructor: Optional[InstructorModel] = None
    category: str
    image: Optional[str] = None
    enrollmentCount: Optional[int] = 0
    seats: Optional[int] = 0
    rating: Optional[float] = 0.0
    level: str
    language: Optional[str] = "English"
    duration: Optional[str] = None
    featured: Optional[bool] = False
    completion_certificate: Optional[bool] = True
    prerequisites: Optional[List[str]] = []
    learning_outcomes: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    status: Optional[str] = "pending"
    recommendation_score: Optional[float] = None
    reason: Optional[str] = None

class RecommendationsResponse(BaseModel):
    recommendations: List[CourseRecommendation]

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/recommendations/{user_id}", response_model=RecommendationsResponse)
async def get_recommendations(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    try:
        recommendations = recommender.get_recommendations(user_id)
        # Convert ObjectIds to string for JSON serialization
        for rec in recommendations:
            if "_id" in rec:
                rec["_id"] = str(rec["_id"])
            if "prerequisites" in rec:
                rec["prerequisites"] = [str(p) for p in rec["prerequisites"]]
        return {"recommendations": recommendations}
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
