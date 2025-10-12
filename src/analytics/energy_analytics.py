"""
Energy Tracker Analytics Module
Provides data processing and visualization functions for the analytics dashboard.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Optional, Tuple, Union
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta

# Constants
PRIMARY_COLOR = '#953599'  # Deep Magenta/Purple
BACKGROUND_COLOR = '#f8f5f2'
COLOR_PALETTE = {
    'physical_energy': '#FF9900',  # Orange
    'cognitive_clarity': '#B47EB7',  # Light Purple
    'mood': '#f2bf3f',  # Yellow/Gold
    'stress': '#c45e99',  # Fuchsia
}

# Mood scale mapping (1-10, where 10 is most positive)
MOOD_SCALE = {
    'Joyful': 10,
    'Content': 8,
    'Calm': 7,
    'Confused': 5,
    'Annoyed': 4,
    'Anxious': 3,
    'Sad': 3,
    'Scared': 2,
    'Angry': 1,
    'Exhausted': 1
}

def plot_energy_correlations(
    df: pd.DataFrame,
    target_metric: str = 'physical_energy',
    category: Optional[str] = None
) -> Tuple[plt.Figure, plt.Figure]:
    """
    Generate correlation analysis visualizations for energy levels.
    
    Args:
        df: Input DataFrame with energy tracking data
        target_metric: Metric to correlate against (default: physical_energy)
        category: Optional filter for specific factor categories
        
    Returns:
        tuple: (bar_chart_figure, heatmap_figure)
    """
    # Convert mood to numerical scale
    df = df.copy()
    if 'mood' in df.columns:
        df['mood_numeric'] = df['mood'].map(MOOD_SCALE)
    
    # Select numerical columns for correlation
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
    if category:
        # Filter columns by category if specified
        # TODO: Implement category filtering logic
        pass
    
    # Calculate correlations
    correlations = df[numeric_cols].corr()[target_metric].sort_values()
    correlations = correlations.drop(target_metric)
    
    # Create bar chart
    fig_bar, ax_bar = plt.subplots(figsize=(10, 6))
    bars = ax_bar.barh(
        range(len(correlations)),
        correlations,
        color=[PRIMARY_COLOR if x > 0 else '#2a9d8f' for x in correlations]
    )
    
    # Customize bar chart
    ax_bar.set_yticks(range(len(correlations)))
    ax_bar.set_yticklabels(correlations.index)
    ax_bar.set_xlabel('Correlation Coefficient')
    ax_bar.set_title(f'Correlation with {target_metric.replace("_", " ").title()}')
    
    # Add correlation values
    for i, v in enumerate(correlations):
        ax_bar.text(
            v + (0.01 if v >= 0 else -0.01),
            i,
            f'{v:.2f}',
            va='center',
            ha='left' if v >= 0 else 'right'
        )
    
    # Create heatmap for core metrics
    core_metrics = ['physical_energy', 'cognitive_clarity', 'mood_numeric', 'stress', 
                   'caffeine', 'hydration']
    core_corr = df[core_metrics].corr()
    
    fig_heat, ax_heat = plt.subplots(figsize=(8, 6))
    sns.heatmap(
        core_corr,
        annot=True,
        cmap='RdYlBu_r',
        center=0,
        ax=ax_heat,
        fmt='.2f'
    )
    ax_heat.set_title('Core Metrics Correlation Matrix')
    
    plt.close('all')  # Clear matplotlib memory
    return fig_bar, fig_heat

def plot_history_chart(
    df: pd.DataFrame,
    metrics_to_show: List[str]
) -> plt.Figure:
    """
    Generate multi-line chart showing historical trends of selected metrics.
    
    Args:
        df: Input DataFrame with energy tracking data
        metrics_to_show: List of metrics to display
        
    Returns:
        matplotlib.Figure: The generated figure
    """
    df = df.copy()
    
    # Convert mood to numerical if present
    if 'mood' in metrics_to_show:
        df['mood_numeric'] = df['mood'].map(MOOD_SCALE)
        metrics_to_show[metrics_to_show.index('mood')] = 'mood_numeric'
    
    # Calculate daily averages
    daily_avg = df.set_index('date')[metrics_to_show].resample('D').mean()
    
    # Create the plot
    fig, ax = plt.subplots(figsize=(12, 6))
    
    for metric in metrics_to_show:
        display_name = metric.replace('_numeric', '').replace('_', ' ').title()
        color = COLOR_PALETTE.get(metric.replace('_numeric', ''), PRIMARY_COLOR)
        
        line = ax.plot(
            daily_avg.index,
            daily_avg[metric],
            label=display_name,
            color=color,
            linewidth=2
        )
    
    # Add markers for significant changes in primary metric
    if metrics_to_show[0] in daily_avg.columns:
        primary_metric = daily_avg[metrics_to_show[0]]
        max_idx = primary_metric.idxmax()
        min_idx = primary_metric.idxmin()
        
        ax.scatter(max_idx, primary_metric[max_idx], color='gold', 
                  marker='*', s=200, label='Peak', zorder=5)
        ax.scatter(min_idx, primary_metric[min_idx], color='red',
                  marker='o', s=100, label='Low', zorder=5)
    
    # Customize the plot
    ax.set_title('Energy Metrics Over Time')
    ax.set_xlabel('Date')
    ax.set_ylabel('Score')
    ax.legend(loc='center left', bbox_to_anchor=(1, 0.5))
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    return fig

def plot_time_breakdown(df: pd.DataFrame) -> plt.Figure:
    """
    Generate donut chart showing time spent breakdown by category.
    
    Args:
        df: Input DataFrame with energy tracking data
        
    Returns:
        matplotlib.Figure: The generated figure
    """
    # Calculate total hours per category
    time_by_category = df.groupby('time_category')['hours_worked'].sum()
    total_hours = time_by_category.sum()
    
    # Create color palette
    n_categories = len(time_by_category)
    colors = [PRIMARY_COLOR] + [plt.cm.Purples(i/n_categories) 
                               for i in range(1, n_categories)]
    
    # Create donut chart
    fig, ax = plt.subplots(figsize=(10, 10))
    wedges, texts, autotexts = ax.pie(
        time_by_category,
        labels=time_by_category.index,
        colors=colors,
        autopct='%1.1f%%',
        pctdistance=0.85,
        wedgeprops=dict(width=0.5)
    )
    
    # Add center text
    ax.text(0, 0, f'Total\n{total_hours:.1f}\nhours',
            ha='center', va='center', fontsize=12)
    
    plt.title('Time Allocation by Category')
    return fig

def plot_metric_trend(
    df: pd.DataFrame,
    metric: str,
    periods: int = 4,
    trend_weeks: int = 8
) -> Tuple[plt.Figure, str]:
    """
    Generate trend analysis for a specific metric.
    
    Args:
        df: Input DataFrame with energy tracking data
        metric: Metric to analyze
        periods: Number of periods for rolling average
        trend_weeks: Number of weeks to analyze
        
    Returns:
        tuple: (matplotlib.Figure, trend_description)
    """
    df = df.copy()
    
    # Convert mood to numerical if needed
    if metric == 'mood':
        df['mood_numeric'] = df['mood'].map(MOOD_SCALE)
        metric = 'mood_numeric'
    
    # Filter to trend_weeks
    start_date = df['date'].max() - timedelta(weeks=trend_weeks)
    mask = df['date'] >= start_date
    df_trend = df[mask].copy()
    
    # Calculate daily average and rolling mean
    daily_avg = df_trend.set_index('date')[metric].resample('D').mean()
    rolling_avg = daily_avg.rolling(window=7, min_periods=1).mean()
    
    # Calculate trend
    x = np.arange(len(rolling_avg))
    z = np.polyfit(x, rolling_avg.fillna(method='ffill'), 1)
    p = np.poly1d(z)
    
    # Create visualization
    fig, ax = plt.subplots(figsize=(12, 6))
    
    ax.plot(daily_avg.index, daily_avg, alpha=0.5, color='gray', label='Daily')
    ax.plot(rolling_avg.index, rolling_avg, color=PRIMARY_COLOR, 
            linewidth=2, label='7-day Average')
    ax.plot(rolling_avg.index, p(x), '--', color='black', 
            label='Trend', alpha=0.8)
    
    ax.set_title(f'{metric.replace("_", " ").title()} Trend Analysis')
    ax.set_xlabel('Date')
    ax.set_ylabel('Score')
    ax.legend()
    
    # Generate trend description
    change = p(len(x)-1) - p(0)
    direction = "improved" if change > 0 else "declined"
    description = (f"{metric.replace('_', ' ').title()} has {direction} "
                  f"by {abs(change):.1f} points over {trend_weeks} weeks")
    
    return fig, description

def calculate_summary_metrics(
    df: pd.DataFrame,
    period_days: int = 30
) -> Dict[str, Union[int, float, str, datetime]]:
    """
    Calculate summary metrics and milestones.
    
    Args:
        df: Input DataFrame with energy tracking data
        period_days: Number of days to analyze
        
    Returns:
        dict: Dictionary containing calculated metrics and milestones
    """
    # Filter to specified period
    df = df.copy()
    start_date = df['date'].max() - timedelta(days=period_days)
    df_period = df[df['date'] >= start_date]
    
    # Calculate basic metrics
    metrics = {
        'happy_moments_count': df_period['happy_moment'].notna().sum(),
        'pomodoro_usage_pct': (
            (df_period['is_pomodoro'] == 1).sum() / len(df_period) * 100
        ),
        'best_pomodoro_day': df_period[df_period['is_pomodoro'] == 1]['date'].max(),
    }
    
    # Calculate streaks and milestones
    dates = pd.date_range(df['date'].min(), df['date'].max(), freq='D')
    tracking_days = df['date'].dt.date.unique()
    
    # Consecutive tracking days
    current_streak = 0
    max_streak = 0
    
    for date in dates:
        if date.date() in tracking_days:
            current_streak += 1
            max_streak = max(max_streak, current_streak)
        else:
            current_streak = 0
    
    metrics['consecutive_tracking_days'] = max_streak
    
    # High energy days
    metrics['high_energy_days'] = len(
        df_period[df_period['physical_energy'] >= 6]
    )
    
    # Most used mood
    metrics['most_used_mood'] = df_period['mood'].mode().iloc[0]
    
    # Hydration milestone
    hydration_streak = (
        df_period['hydration']
        .rolling(window=7, min_periods=7)
        .apply(lambda x: (x >= 7).all())
    )
    metrics['milestone_hydration'] = bool(hydration_streak.any())
    
    # Happy moments milestone
    total_happy = df['happy_moment'].notna().sum()
    metrics['milestone_happy'] = total_happy >= 50
    if metrics['milestone_happy']:
        happy_dates = df[df['happy_moment'].notna()]['date']
        milestone_date = happy_dates.iloc[49]  # 50th happy moment
        metrics['time_since_happy_milestone'] = (
            df['date'].max() - milestone_date
        ).days
    
    return metrics
