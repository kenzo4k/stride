import os
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score
import joblib

from feature_engineering import add_features

def fix_obvious_mislabels(row):
    current_label = row['dropout_next_7_days']

    # DROPOUT RULES (Label = 1)
    if (row['login_count'] == 1 and
        row['total_session_time_minutes'] < 15 and
        row['lessons_completed'] == 0 and
        row['assessments_attempted'] == 0):
        return 1

    if (row['login_count'] <= 3 and
        row['lessons_completed'] == 0 and
        row['assessments_attempted'] == 0):
        return 1

    if (row['login_count'] >= 3 and
        row['total_session_time_minutes'] < 20 and
        row['lessons_completed'] == 0):
        return 1

    # NON-DROPOUT RULES (Label = 0)
    if (row['total_session_time_minutes'] >= 200 and
        row['lessons_completed'] >= 5 and
        row['assessments_attempted'] >= 3 and
        row['avg_assessment_score'] >= 70):
        return 0

    if (row['avg_assessment_score'] >= 85 and
        row['assessments_attempted'] >= 5 and
        row['lessons_completed'] >= 3):
        return 0

    if (row['lessons_started'] >= 10 and
        row['lessons_completed'] >= 8 and
        row['lessons_completed'] / row['lessons_started'] >= 0.7):
        return 0

    if (row['days_active'] >= 4 and
        row['login_count'] >= 6 and
        row['avg_session_time_minutes'] >= 15 and
        row['lessons_completed'] >= 2):
        return 0

    if (row['total_session_time_minutes'] >= 250 or
        row['login_count'] >= 8) and \
       (row['lessons_completed'] >= 5 and
        row['assessments_attempted'] >= 5 and
        row['avg_assessment_score'] >= 75):
        return 0

    if (row['login_count'] >= row['days_active'] * 1.5 and
        row['total_session_time_minutes'] >= 100 and
        row['lessons_completed'] >= 2):
        return 0

    # AMBIGUOUS CASES
    if row['assessments_attempted'] > 0 and row['avg_assessment_score'] == 0:
        return current_label

    if row['lessons_started'] >= 3 and row['lessons_completed'] == 0:
        return 1

    return current_label

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, '..', '..', 'student_dropout_data.csv')
    
    if not os.path.exists(data_path):
        print(f"Data file not found at: {data_path}")
        return

    print("Loading synthetic student data...")
    df = pd.read_csv(data_path)
    
    print("Fixing obvious mislabels...")
    df['dropout_next_7_days'] = df.apply(fix_obvious_mislabels, axis=1)

    # Drop target and identifiers
    target_col = 'dropout_next_7_days'
    ignore_cols = ['student_id', 'window_start', 'window_end', 'student_type']
    drop_cols = [c for c in ignore_cols if c in df.columns]
    
    X = df.drop(columns=[target_col] + drop_cols)
    y = df[target_col]

    print("Engineering features...")
    X = add_features(X)

    # Split (stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=41, stratify=y
    )

    param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [5, 10, 15, None],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4],
        'class_weight': ['balanced', 'balanced_subsample', None]
    }

    print("Training Random Forest with Grid Search...")
    rf_model = RandomForestClassifier(random_state=41, n_jobs=-1)
    grid_search = GridSearchCV(rf_model, param_grid, cv=5, scoring='f1', n_jobs=-1, verbose=1)
    grid_search.fit(X_train, y_train)

    best_rf = grid_search.best_estimator_
    print(f"\nBest Parameters: {grid_search.best_params_}")
    print(f"Best CV Score: {grid_search.best_score_:.4f}")

    # Evaluate
    y_pred = best_rf.predict(X_test)
    y_pred_proba = best_rf.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc_roc = roc_auc_score(y_test, y_pred_proba)
    cm = confusion_matrix(y_test, y_pred)

    print("\n" + "="*60)
    print("RANDOM FOREST PERFORMANCE METRICS:")
    print("="*60)
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"AUC-ROC:   {auc_roc:.4f}")
    print(f"Confusion Matrix:\n{cm}")
    print("="*60)

    # Save outputs
    model_dir = os.path.join(base_dir, 'model')
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, 'dropout_model.pkl')
    features_path = os.path.join(model_dir, 'feature_names.json')

    print(f"Saving model to {model_path}...")
    joblib.dump(best_rf, model_path)

    feature_names = list(X.columns)
    print(f"Saving feature names to {features_path}...")
    with open(features_path, 'w') as f:
        json.dump(feature_names, f)

    print("Training finished successfully!")

if __name__ == '__main__':
    main()
