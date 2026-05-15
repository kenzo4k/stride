import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from bson import ObjectId
from datetime import datetime, timezone

class RecommenderSystem:
    def __init__(self, db):
        self.db = db

    def get_data(self):
        courses = list(self.db.courses.find({"status": "active"}))
        enrollments = list(self.db.enrollments.find({"status": {"$in": ["active", "completed"]}}))
        return courses, enrollments

    def _get_course_text(self, course):
        title = course.get("title", "")
        desc = course.get("short_description", "")
        category = course.get("category", "")
        tags = " ".join(course.get("tags", []))
        return f"{title} {desc} {category} {tags}"

    def layer1_content_based(self, courses, user_courses_ids):
        if not user_courses_ids:
            return {str(c["_id"]): 0.0 for c in courses}
        
        texts = [self._get_course_text(c) for c in courses]
        course_ids = [str(c["_id"]) for c in courses]
        
        vectorizer = TfidfVectorizer(stop_words='english')
        try:
            tfidf_matrix = vectorizer.fit_transform(texts)
            cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
        except ValueError:
            # Vocabulary empty
            return {str(c["_id"]): 0.0 for c in courses}

        scores = {cid: 0.0 for cid in course_ids}
        
        user_indices = [i for i, cid in enumerate(course_ids) if cid in user_courses_ids]
        
        for i, cid in enumerate(course_ids):
            if cid in user_courses_ids:
                continue # Skip courses already taken
            
            # Max similarity with any course the user has taken
            max_sim = 0
            for u_idx in user_indices:
                sim = cosine_sim[i][u_idx]
                if sim > max_sim:
                    max_sim = sim
            scores[cid] = max_sim
            
        return scores

    def layer2_collaborative(self, courses, enrollments, target_user_id):
        # Build user-course matrix
        user_courses = {}
        for e in enrollments:
            uid = str(e["userId"])
            cid = str(e["courseId"])
            if uid not in user_courses:
                user_courses[uid] = set()
            user_courses[uid].add(cid)
            
        target_courses = user_courses.get(target_user_id, set())
        if not target_courses:
            return {str(c["_id"]): 0.0 for c in courses}
            
        # Compute Jaccard similarity with other users
        user_sims = {}
        for uid, courses_set in user_courses.items():
            if uid == target_user_id:
                continue
            intersection = len(target_courses.intersection(courses_set))
            union = len(target_courses.union(courses_set))
            if union > 0:
                user_sims[uid] = intersection / union
                
        # Score courses based on neighbor similarity
        scores = {str(c["_id"]): 0.0 for c in courses}
        for uid, sim in user_sims.items():
            if sim > 0:
                for cid in user_courses[uid]:
                    if cid not in target_courses and cid in scores:
                        scores[cid] += sim
                        
        # Normalize
        max_score = max(scores.values()) if scores.values() else 0
        if max_score > 0:
            for cid in scores:
                scores[cid] /= max_score
                
        return scores

    def layer3_rule_based(self, courses, user_courses_ids, category_levels):
        # Filter out courses where prerequisites are not met
        valid_courses = []
        for c in courses:
            cid = str(c["_id"])
            if cid in user_courses_ids:
                continue
                
            # Check prerequisites
            prereqs = c.get("prerequisites", [])
            prereqs_met = True
            for p in prereqs:
                if str(p) not in user_courses_ids:
                    prereqs_met = False
                    break
                    
            if not prereqs_met:
                continue
                
            # Check difficulty progression
            level = c.get("level", "Beginner")
            category = c.get("category", "")
            
            if level == "Advanced":
                # Check if they have beginner or intermediate in this category
                has_lower = category_levels.get(category, set())
                if "Beginner" not in has_lower and "Intermediate" not in has_lower:
                    continue # Skip advanced if no prior experience in category
            elif level == "Intermediate":
                has_lower = category_levels.get(category, set())
                if "Beginner" not in has_lower:
                    # Allowed for now, could be stricter
                    pass
            
            valid_courses.append(c)
            
        return valid_courses

    def layer4_ranking(self, valid_courses, l1_scores, l2_scores):
        ranked = []
        now = datetime.now(timezone.utc)
        
        for c in valid_courses:
            cid = str(c["_id"])
            
            # Base scores
            content_score = l1_scores.get(cid, 0.0)
            collab_score = l2_scores.get(cid, 0.0)
            
            # Popularity (0 to 1 scaling roughly)
            enrollment_count = c.get("enrollmentCount", 0)
            rating = c.get("rating", 0)
            pop_score = (min(enrollment_count, 1000) / 1000) * 0.5 + (rating / 5.0) * 0.5
            
            # Freshness
            created_at = c.get("createdAt", datetime.now())
            if getattr(created_at, 'tzinfo', None) is None:
                created_at = created_at.replace(tzinfo=timezone.utc)
            days_old = (now - created_at).days
            fresh_score = max(0, 1.0 - (days_old / 365.0)) # 1.0 if new, drops to 0 over a year
            
            # Hybrid Weighting
            if collab_score > 0:
                final_score = (content_score * 0.3) + (collab_score * 0.4) + (pop_score * 0.2) + (fresh_score * 0.1)
            else:
                final_score = (content_score * 0.5) + (pop_score * 0.3) + (fresh_score * 0.2)
                
            c_copy = c.copy()
            c_copy["recommendation_score"] = final_score
            ranked.append(c_copy)
            
        # Sort descending
        ranked.sort(key=lambda x: x["recommendation_score"], reverse=True)
        return ranked

    def get_recommendations(self, user_id: str, limit: int = 10):
        courses, enrollments = self.get_data()
        
        # Get user context
        user_courses_ids = set()
        category_levels = {} # category -> set of levels completed
        for e in enrollments:
            if str(e["userId"]) == user_id:
                cid = str(e["courseId"])
                user_courses_ids.add(cid)
                
                # Find course to get category and level
                for c in courses:
                    if str(c["_id"]) == cid:
                        cat = c.get("category", "")
                        lvl = c.get("level", "Beginner")
                        if cat not in category_levels:
                            category_levels[cat] = set()
                        category_levels[cat].add(lvl)
                        break
                        
        # Layer 1
        l1_scores = self.layer1_content_based(courses, user_courses_ids)
        
        # Layer 2
        l2_scores = self.layer2_collaborative(courses, enrollments, user_id)
        
        # Layer 3
        valid_courses = self.layer3_rule_based(courses, user_courses_ids, category_levels)
        
        # Layer 4
        ranked = self.layer4_ranking(valid_courses, l1_scores, l2_scores)
        
        return ranked[:limit]
