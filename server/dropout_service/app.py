import os
import pymongo
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from bson import ObjectId

from predictor import DropoutPredictor

app = FastAPI(title="Stride Dropout Prediction Service")

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

# Initialize predictor
try:
    predictor = DropoutPredictor()
except Exception as e:
    print(f"Warning: Predictor failed to initialize. Model may need to be trained. Error: {e}")
    predictor = None

class PredictionRequest(BaseModel):
    login_count: int = 0
    days_active: int = 0
    total_session_time_minutes: float = 0.0
    avg_session_time_minutes: float = 0.0
    median_session_time_minutes: float = 0.0
    lessons_started: int = 0
    lessons_completed: int = 0
    assessments_attempted: int = 0
    avg_assessment_score: float = 0.0
    num_failed_attempts: int = 0
    num_repeated_attempts: int = 0
    no_improvement_attempts: int = 0
    studentId: str
    courseId: str

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "model_loaded": predictor is not None}

@app.post("/api/predict")
async def predict_single(request: PredictionRequest):
    if predictor is None:
        raise HTTPException(status_code=500, detail="Model is not trained or loaded")
    try:
        record = request.model_dump()
        results = predictor.predict([record])
        return results[0]
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict-all")
async def predict_all():
    global predictor
    if predictor is None:
        try:
            predictor = DropoutPredictor()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Model is not loaded: {e}")

    try:
        # Fetch active window documents (ended within the last 7 days, or active)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        docs = list(db.mlfeatures.find({"window_end": {"$gte": seven_days_ago}}))

        if not docs:
            return {
                "total_predicted": 0,
                "at_risk_count": 0,
                "predictions_updated": []
            }

        records = []
        for doc in docs:
            rec = {
                '_id': doc['_id'],
                'studentId': str(doc.get('studentId')),
                'courseId': str(doc.get('courseId')),
                'login_count': doc.get('login_count', 0),
                'days_active': doc.get('days_active', 0),
                'total_session_time_minutes': doc.get('total_session_time_minutes', 0.0),
                'avg_session_time_minutes': doc.get('avg_session_time_minutes', 0.0),
                'median_session_time_minutes': doc.get('median_session_time_minutes', 0.0),
                'lessons_started': doc.get('lessons_started', 0),
                'lessons_completed': doc.get('lessons_completed', 0),
                'assessments_attempted': doc.get('assessments_attempted', 0),
                'avg_assessment_score': doc.get('avg_assessment_score', 0.0),
                'num_failed_attempts': doc.get('num_failed_attempts', 0),
                'num_repeated_attempts': doc.get('num_repeated_attempts', 0),
                'no_improvement_attempts': doc.get('no_improvement_attempts', 0)
            }
            records.append(rec)

        predictions = predictor.predict(records)

        # Write results back to Mongo
        at_risk_count = 0
        now = datetime.utcnow()
        for pred in predictions:
            if pred.get('dropout_prediction'):
                at_risk_count += 1
            
            db.mlfeatures.update_one(
                {"_id": ObjectId(pred["_id"])},
                {"$set": {
                    "dropout_risk_score": pred["dropout_risk_score"],
                    "dropout_prediction": pred["dropout_prediction"],
                    "risk_level": pred["risk_level"],
                    "last_prediction_at": now
                }}
            )

        return {
            "total_predicted": len(predictions),
            "at_risk_count": at_risk_count,
            "predictions_updated": [
                {
                    "studentId": p["studentId"],
                    "courseId": p["courseId"],
                    "dropout_prediction": p["dropout_prediction"],
                    "dropout_risk_score": p["dropout_risk_score"],
                    "risk_level": p["risk_level"]
                } for p in predictions
            ]
        }
    except Exception as e:
        print(f"Error in batch prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
