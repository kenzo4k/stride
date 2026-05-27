import pandas as pd

def add_features(df):
    df = df.copy()

    # Engagement score: combination of login count and session time
    df['engagement_score'] = df['login_count'] * df['avg_session_time_minutes']

    # Completion ratio
    df['completion_ratio'] = df['lessons_completed'] / (df['lessons_started'] + 1e-8)

    # Assessment ratio
    df['assessment_ratio'] = df['assessments_attempted'] / (df['lessons_completed'] + 1e-8)

    # Failure ratio
    df['failure_ratio'] = df['num_failed_attempts'] / (df['assessments_attempted'] + 1e-8)

    # Stagnation flag
    df['stagnation_flag'] = (df['no_improvement_attempts'] > 0).astype(int)

    # Days active per login (consistency)
    df['days_per_login'] = df['days_active'] / (df['login_count'] + 1e-8)

    # Total time per lesson started
    df['time_per_lesson'] = df['total_session_time_minutes'] / (df['lessons_started'] + 1e-8)

    return df
