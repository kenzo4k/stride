import os
import json
import joblib
import pandas as pd
from feature_engineering import add_features

class DropoutPredictor:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, 'model', 'dropout_model.pkl')
        features_path = os.path.join(base_dir, 'model', 'feature_names.json')

        if not os.path.exists(model_path) or not os.path.exists(features_path):
            raise FileNotFoundError("Model or feature names file not found. Please train the model first.")

        print(f"Loading model from {model_path}...")
        self.model = joblib.load(model_path)

        print(f"Loading feature names from {features_path}...")
        with open(features_path, 'r') as f:
            self.feature_names = json.load(f)

    def predict(self, records: list[dict]) -> list[dict]:
        if not records:
            return []

        # Convert raw metric records to DataFrame
        df = pd.DataFrame(records)

        # Retain studentId, courseId and optional _id for mapping results back
        metadata_cols = [c for c in ['studentId', 'courseId', '_id'] if c in df.columns]
        metadata = df[metadata_cols].to_dict('records')

        # Drop non-feature columns
        feature_df = df.drop(columns=[c for c in metadata_cols if c in df.columns], errors='ignore')

        # Apply feature engineering
        feature_df = add_features(feature_df)

        # Select and order features exactly as trained
        try:
            X = feature_df[self.feature_names]
        except KeyError as e:
            # If some features are missing in input records, default to 0
            missing_cols = set(self.feature_names) - set(feature_df.columns)
            print(f"Warning: Missing features in input: {missing_cols}. Filling with 0.")
            for col in missing_cols:
                feature_df[col] = 0
            X = feature_df[self.feature_names]

        # Run model inference
        predictions = self.model.predict(X)
        probabilities = self.model.predict_proba(X)[:, 1]  # probability of class 1 (dropout)

        results = []
        for i, meta in enumerate(metadata):
            prob = float(probabilities[i])
            pred = bool(predictions[i])

            # Determine risk level
            if prob >= 0.7:
                risk_level = 'high'
            elif prob >= 0.4:
                risk_level = 'medium'
            else:
                risk_level = 'low'

            res_item = {
                'studentId': str(meta.get('studentId')),
                'courseId': str(meta.get('courseId')),
                'dropout_prediction': pred,
                'dropout_risk_score': prob,
                'risk_level': risk_level
            }
            if '_id' in meta:
                res_item['_id'] = meta['_id']
                
            results.append(res_item)

        return results
