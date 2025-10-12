"""
Sample Data Generator for Energy Tracker Analytics
Provides functions to generate realistic test data for the analytics dashboard.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_sample_data(
    days: int = 90,
    start_date: datetime = None,
    seed: int = 42
) -> pd.DataFrame:
    """
    Generate sample energy tracking data.
    
    Args:
        days: Number of days of data to generate
        start_date: Starting date for the data (defaults to days ago from today)
        seed: Random seed for reproducibility
        
    Returns:
        pd.DataFrame: DataFrame containing sample tracking data
    """
    np.random.seed(seed)
    random.seed(seed)
    
    if start_date is None:
        start_date = datetime.now() - timedelta(days=days)
    
    # Generate dates (multiple entries per day)
    dates = []
    for day in range(days):
        current_date = start_date + timedelta(days=day)
        # Generate 1-4 entries per day
        entries_today = random.randint(1, 4)
        dates.extend([current_date] * entries_today)
    
    # Define possible moods and time categories
    moods = ['Calm', 'Content', 'Joyful', 'Sad', 'Annoyed', 'Anxious', 
             'Confused', 'Angry', 'Scared', 'Exhausted']
    time_categories = ['Work', 'Family', 'Hobby', 'Exercise', 'Social', 'Rest']
    
    # Generate base metrics with some correlation
    n_entries = len(dates)
    base_energy = np.random.normal(5, 1, n_entries)  # Center around 5 on 1-7 scale
    
    # Create correlated metrics
    cognitive = base_energy * 0.7 + np.random.normal(0, 1, n_entries)
    stress = 5 - (base_energy * 0.5 + np.random.normal(0, 0.5, n_entries))
    
    # Normalize values to valid ranges
    physical_energy = np.clip(base_energy, 1, 7).round()
    cognitive_clarity = np.clip(cognitive, 1, 7).round()
    stress = np.clip(stress, 1, 4).round()
    
    # Generate other metrics
    data = {
        'date': dates,
        'physical_energy': physical_energy,
        'cognitive_clarity': cognitive_clarity,
        'mood': [random.choice(moods) for _ in range(n_entries)],
        'stress': stress,
        'caffeine': [random.randint(0, 6) for _ in range(n_entries)],
        'hydration': [random.randint(0, 10) for _ in range(n_entries)],
        'socializing': [random.randint(0, 1) for _ in range(n_entries)],
        'hours_worked': [round(random.uniform(0.5, 8.0), 1) for _ in range(n_entries)],
        'time_category': [random.choice(time_categories) for _ in range(n_entries)],
        'is_pomodoro': [random.randint(0, 1) for _ in range(n_entries)],
    }
    
    # Generate happy moments (70% chance of having one)
    happy_moments = []
    happy_activities = [
        'morning run in the park',
        'coffee with friends',
        'completed a project',
        'family dinner',
        'meditation session',
        'achieved workout goal',
        'learned something new',
        'helped a colleague',
        'enjoyed nature walk',
        'had a productive day'
    ]
    
    for _ in range(n_entries):
        if random.random() < 0.7:
            happy_moments.append(random.choice(happy_activities))
        else:
            happy_moments.append(None)
    
    data['happy_moment'] = happy_moments
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Sort by date
    df = df.sort_values('date').reset_index(drop=True)
    
    return df

def generate_example_usage():
    """
    Generate example usage of the analytics functions using sample data.
    """
    from energy_analytics import (
        plot_energy_correlations,
        plot_history_chart,
        plot_time_breakdown,
        plot_metric_trend,
        calculate_summary_metrics
    )
    
    # Generate sample data
    df = generate_sample_data(days=90)
    
    # Example 1: Correlation Analysis
    fig_bar, fig_heat = plot_energy_correlations(df)
    fig_bar.savefig('correlation_bar.png')
    fig_heat.savefig('correlation_heatmap.png')
    
    # Example 2: History Chart
    metrics = ['physical_energy', 'cognitive_clarity', 'mood', 'stress']
    fig_history = plot_history_chart(df, metrics)
    fig_history.savefig('history_chart.png')
    
    # Example 3: Time Breakdown
    fig_time = plot_time_breakdown(df)
    fig_time.savefig('time_breakdown.png')
    
    # Example 4: Trend Analysis
    fig_trend, trend_desc = plot_metric_trend(df, 'physical_energy')
    fig_trend.savefig('trend_analysis.png')
    print("\nTrend Analysis:")
    print(trend_desc)
    
    # Example 5: Summary Metrics
    metrics = calculate_summary_metrics(df)
    print("\nSummary Metrics:")
    for key, value in metrics.items():
        print(f"{key}: {value}")

if __name__ == "__main__":
    # Generate example visualizations and metrics
    generate_example_usage()
