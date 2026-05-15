import pymongo
from recommender import RecommenderSystem

client = pymongo.MongoClient("mongodb://localhost:27017/stride")
db = client.get_database()
recommender = RecommenderSystem(db)

user = db.users.find_one({"role": "student"})
if user:
    print(f"Testing recommendations for user: {user['name']} (ID: {user['_id']})")
    
    recommendations = recommender.get_recommendations(str(user['_id']))
    
    print("\nRecommendations:")
    for i, rec in enumerate(recommendations):
        print(f"{i+1}. {rec.get('title', 'Unknown')} - Score: {rec.get('recommendation_score', 0):.4f}")
        print(f"   Category: {rec.get('category')} | Level: {rec.get('level')}")
else:
    print("No student found in DB")
