import os
import pymongo
from recommender import RecommenderSystem

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/stride")
client = pymongo.MongoClient(MONGO_URI)
db = client.get_database()
recommender = RecommenderSystem(db)

students = list(db.users.find({"role": "student"}))
for user in students:
    enrollments = list(db.enrollments.find({"userId": user['_id']}))
    course_titles = []
    for e in enrollments:
        c = db.courses.find_one({"_id": e['courseId']})
        if c:
            course_titles.append(c['title'])
    
    print(f"\n==================================================")
    print(f"User: {user['name']} ({user['email']})")
    print(f"Enrolled in: {', '.join(course_titles)}")
    
    recommendations = recommender.get_recommendations(str(user['_id']))
    
    print("Top Recommendations:")
    for i, rec in enumerate(recommendations[:3]):
        print(f"  {i+1}. {rec.get('title', 'Unknown')} - Score: {rec.get('recommendation_score', 0):.4f} - Reason: {rec.get('reason')} (Cat: {rec.get('category')}, Lvl: {rec.get('level')})")

