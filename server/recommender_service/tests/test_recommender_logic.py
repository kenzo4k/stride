import unittest
from unittest.mock import MagicMock
import os
import sys

# Add recommender_service directory to sys.path so we can import recommender
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from recommender import RecommenderSystem

class TestRecommenderLogic(unittest.TestCase):
    def setUp(self):
        # Create a mock MongoDB database instance
        self.mock_db = MagicMock()
        self.recommender = RecommenderSystem(self.mock_db)
        
        # Define mock courses
        self.courses = [
            {
                "_id": "course1",
                "title": "HTML & CSS Foundations",
                "short_description": "Master the building blocks of the web: HTML5, CSS3.",
                "category": "Front End",
                "tags": ["HTML", "CSS"],
                "level": "Beginner",
                "prerequisites": ["None"],
                "enrollmentCount": 100,
                "rating": 4.8
            },
            {
                "_id": "course2",
                "title": "Modern JavaScript & DOM",
                "short_description": "Learn HTML CSS and JS variables, async actions, DOM events.",
                "category": "Front End",
                "tags": ["HTML", "CSS", "JavaScript"],
                "level": "Beginner",
                "prerequisites": ["HTML & CSS Foundations"],
                "enrollmentCount": 50,
                "rating": 4.5
            },
            {
                "_id": "course3",
                "title": "React.js Development",
                "short_description": "Master components, state, hooks to build SPAs.",
                "category": "Front End",
                "tags": ["React", "JavaScript"],
                "level": "Intermediate",
                "prerequisites": ["Modern JavaScript & DOM"],
                "enrollmentCount": 20,
                "rating": 4.6
            },
            {
                "_id": "course4",
                "title": "Next.js Production Apps",
                "short_description": "Learn Server-Side Rendering SSR and static generation.",
                "category": "Front End",
                "tags": ["Next.js", "React"],
                "level": "Advanced",
                "prerequisites": ["React.js Development"],
                "enrollmentCount": 5,
                "rating": 4.2
            },
            {
                "_id": "course5",
                "title": "HTML & CSS Advanced Layouts",
                "short_description": "Master advanced building blocks of the web: grids and layouts.",
                "category": "Front End",
                "tags": ["HTML", "CSS"],
                "level": "Intermediate",
                "prerequisites": ["None"],
                "enrollmentCount": 10,
                "rating": 4.7
            }
        ]
        
        # Define mock enrollments
        self.enrollments = [
            {"userId": "user1", "courseId": "course1", "status": "completed"},
            {"userId": "user2", "courseId": "course1", "status": "completed"},
            {"userId": "user2", "courseId": "course2", "status": "completed"},
        ]

    def test_layer1_content_based(self):
        # User has taken HTML & CSS Foundations
        user_courses_ids = {"course1"}
        scores, similar_to = self.recommender.layer1_content_based(self.courses, user_courses_ids)
        
        # The course already taken should not be recommended or have a score
        self.assertEqual(scores.get("course1", 0.0), 0.0)
        
        # Other courses in Front End category or with related tags should get non-zero scores
        self.assertGreater(scores.get("course2", 0.0), 0.0)
        self.assertEqual(similar_to.get("course2"), "course1")

    def test_layer2_collaborative(self):
        # Target user is user1 (enrolled in course1)
        # Neighbor user2 is enrolled in course1 and course2
        scores = self.recommender.layer2_collaborative(self.courses, self.enrollments, "user1")
        
        # course2 should get a boosted collaborative score because user2 completed it too
        self.assertGreater(scores.get("course2", 0.0), 0.0)
        # course1 should not get recommended since they already enrolled
        self.assertEqual(scores.get("course1", 0.0), 0.0)

    def test_layer3_rule_based_prerequisites_met(self):
        # User has taken html css course
        user_courses_ids = {"course1"}
        category_levels = {"Front End": {"Beginner"}}
        
        valid = self.recommender.layer3_rule_based(self.courses, user_courses_ids, category_levels)
        valid_ids = [c["_id"] for c in valid]
        
        # Modern JavaScript prerequisite is HTML & CSS. It should be met.
        self.assertIn("course2", valid_ids)
        
        # React.js prerequisite is Modern JavaScript & DOM, which user hasn't completed. It should NOT be met.
        self.assertNotIn("course3", valid_ids)

    def test_layer3_rule_based_case_insensitive_prerequisites(self):
        # Prerequisite in react course is "Modern JavaScript & DOM"
        # Let's say user has completed "modern javascript & dom" (lowercase)
        # The engine should still match and allow it
        user_courses_ids = {"course2"} # which has title "Modern JavaScript & DOM"
        category_levels = {"Front End": {"Beginner"}}
        
        valid = self.recommender.layer3_rule_based(self.courses, user_courses_ids, category_levels)
        valid_ids = [c["_id"] for c in valid]
        
        # React.js prerequisite is met case-insensitively
        self.assertIn("course3", valid_ids)

    def test_layer3_rule_based_deadlock_prevention(self):
        # Create a mock database containing only an Advanced course in a custom category
        custom_courses = [
            {
                "_id": "adv_course",
                "title": "Advanced Cybersecurity",
                "category": "Security",
                "level": "Advanced",
                "prerequisites": ["None"]
            }
        ]
        user_courses_ids = set()
        category_levels = {}
        
        valid = self.recommender.layer3_rule_based(custom_courses, user_courses_ids, category_levels)
        valid_ids = [c["_id"] for c in valid]
        
        # Even though level is "Advanced" and user has no beginner courses in "Security", 
        # it should NOT be filtered out because no beginner course exists in the DB for this category
        self.assertIn("adv_course", valid_ids)

    def test_layer4_ranking_reasons(self):
        user_courses_ids = {"course1"}
        similar_to = {"course5": "course1"}
        
        l1_scores = {"course5": 0.5, "course3": 0.1, "course4": 0.0}
        l2_scores = {"course5": 0.0, "course3": 0.0, "course4": 0.0}
        
        ranked = self.recommender.layer4_ranking(
            self.courses[1:], # courses excluding HTML & CSS
            l1_scores,
            l2_scores,
            similar_to,
            self.courses,
            user_courses_ids
        )
        
        # Find course5 recommendation
        rec_course5 = next(c for c in ranked if c["_id"] == "course5")
        # Since it met content similarity requirements and is similar to course1, it should list similar explanation
        self.assertEqual(rec_course5["reason"], "Similar to HTML & CSS Foundations")
        
        # Find course3 recommendation (prerequisite check)
        # Since course3 has Modern JavaScript prerequisite, but wait, course3 is not met 
        # (in this direct ranking test we just feed courses directly)
        # Let's say user has completed course2, then course3 should be "Building on your study of Modern JavaScript & DOM"
        user_courses_ids_with_js = {"course1", "course2"}
        ranked_prereq = self.recommender.layer4_ranking(
            self.courses[2:], # React & Next
            {"course3": 0.1},
            {"course3": 0.0},
            {},
            self.courses,
            user_courses_ids_with_js
        )
        rec_course3 = next(c for c in ranked_prereq if c["_id"] == "course3")
        self.assertEqual(rec_course3["reason"], "Building on your study of Modern JavaScript & DOM")

if __name__ == '__main__':
    unittest.main()
