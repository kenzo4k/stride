import unittest
from unittest.mock import MagicMock, patch
import os
import sys

# Add dropout_service directory to sys.path so we can import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from predictor import DropoutPredictor

class TestDropoutPredictor(unittest.TestCase):
    @patch('joblib.load')
    @patch('builtins.open')
    @patch('json.load')
    @patch('os.path.exists')
    def test_dropout_predictor_logic(self, mock_exists, mock_json_load, mock_open, mock_joblib_load):
        # Setup mocks to avoid loading actual model files
        mock_exists.return_value = True
        mock_json_load.return_value = ["login_count", "days_active", "avg_session_time_minutes"]
        
        # Mock the trained classifier model
        mock_model = MagicMock()
        mock_model.predict.return_value = [True, False]
        # predict_proba returns [proba_class_0, proba_class_1]
        import numpy as np
        mock_model.predict_proba.return_value = np.array([
            [0.2, 0.8], # High risk (0.8)
            [0.9, 0.1]  # Low risk (0.1)
        ])
        mock_joblib_load.return_value = mock_model
        
        # Instantiate predictor
        predictor = DropoutPredictor()
        
        records = [
            {
                "studentId": "student_1",
                "courseId": "course_1",
                "login_count": 2,
                "days_active": 1,
                "avg_session_time_minutes": 5.0,
                "total_session_time_minutes": 10.0,
                "median_session_time_minutes": 5.0,
                "lessons_started": 2,
                "lessons_completed": 1,
                "assessments_attempted": 1,
                "avg_assessment_score": 50.0,
                "num_failed_attempts": 1,
                "num_repeated_attempts": 0,
                "no_improvement_attempts": 0
            },
            {
                "studentId": "student_2",
                "courseId": "course_1",
                "login_count": 20,
                "days_active": 5,
                "avg_session_time_minutes": 45.0,
                "total_session_time_minutes": 900.0,
                "median_session_time_minutes": 45.0,
                "lessons_started": 8,
                "lessons_completed": 8,
                "assessments_attempted": 3,
                "avg_assessment_score": 95.0,
                "num_failed_attempts": 0,
                "num_repeated_attempts": 0,
                "no_improvement_attempts": 0
            }
        ]
        
        results = predictor.predict(records)
        self.assertEqual(len(results), 2)
        
        # First student should be classified as High Risk
        self.assertTrue(results[0]["dropout_prediction"])
        self.assertEqual(results[0]["risk_level"], "high")
        self.assertEqual(results[0]["dropout_risk_score"], 0.8)
        
        # Second student should be classified as Low Risk
        self.assertFalse(results[1]["dropout_prediction"])
        self.assertEqual(results[1]["risk_level"], "low")
        self.assertEqual(results[1]["dropout_risk_score"], 0.1)

if __name__ == '__main__':
    unittest.main()
