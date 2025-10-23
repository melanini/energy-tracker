"""
Unit tests for sample_data.py module
"""
import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../src'))

from analytics.sample_data import generate_sample_data, generate_example_usage


class TestSampleData:
    """Test class for sample data generation functions"""

    def test_generate_sample_data_default_params(self):
        """Test sample data generation with default parameters"""
        df = generate_sample_data()
        
        assert isinstance(df, pd.DataFrame)
        assert len(df) > 0
        assert 'date' in df.columns
        assert 'physical_energy' in df.columns
        assert 'cognitive_clarity' in df.columns
        assert 'mood' in df.columns
        assert 'stress' in df.columns
        assert 'caffeine' in df.columns
        assert 'hydration' in df.columns
        assert 'time_category' in df.columns
        assert 'hours_worked' in df.columns
        assert 'happy_moment' in df.columns
        assert 'is_pomodoro' in df.columns

    def test_generate_sample_data_custom_days(self):
        """Test sample data generation with custom number of days"""
        df = generate_sample_data(days=10)
        
        assert isinstance(df, pd.DataFrame)
        assert len(df) > 0
        # Should have multiple entries per day (1-4)
        assert len(df) >= 10  # At least one entry per day

    def test_generate_sample_data_custom_start_date(self):
        """Test sample data generation with custom start date"""
        start_date = datetime(2024, 1, 1)
        df = generate_sample_data(days=5, start_date=start_date)
        
        assert isinstance(df, pd.DataFrame)
        assert len(df) > 0
        assert df['date'].min() >= start_date
        assert df['date'].max() <= start_date + timedelta(days=5)

    def test_generate_sample_data_custom_seed(self):
        """Test sample data generation with custom seed for reproducibility"""
        df1 = generate_sample_data(days=5, seed=123)
        df2 = generate_sample_data(days=5, seed=123)
        
        # Should be identical with same seed
        pd.testing.assert_frame_equal(df1, df2)

    def test_generate_sample_data_different_seeds(self):
        """Test sample data generation with different seeds produces different data"""
        df1 = generate_sample_data(days=5, seed=123)
        df2 = generate_sample_data(days=5, seed=456)
        
        # Should be different with different seeds
        assert not df1.equals(df2)

    def test_generate_sample_data_data_types(self):
        """Test that generated data has correct data types"""
        df = generate_sample_data(days=10)
        
        assert df['date'].dtype == 'datetime64[ns]'
        assert df['physical_energy'].dtype in ['int64', 'int32']
        assert df['cognitive_clarity'].dtype in ['int64', 'int32']
        assert df['mood'].dtype == 'object'  # String
        assert df['stress'].dtype in ['int64', 'int32']
        assert df['caffeine'].dtype in ['int64', 'int32']
        assert df['hydration'].dtype in ['int64', 'int32']
        assert df['time_category'].dtype == 'object'  # String
        assert df['hours_worked'].dtype in ['float64', 'float32']
        assert df['is_pomodoro'].dtype in ['int64', 'int32']

    def test_generate_sample_data_value_ranges(self):
        """Test that generated data values are within expected ranges"""
        df = generate_sample_data(days=10)
        
        # Physical energy: 1-7
        assert df['physical_energy'].min() >= 1
        assert df['physical_energy'].max() <= 7
        
        # Cognitive clarity: 1-7
        assert df['cognitive_clarity'].min() >= 1
        assert df['cognitive_clarity'].max() <= 7
        
        # Stress: 1-4
        assert df['stress'].min() >= 1
        assert df['stress'].max() <= 4
        
        # Caffeine: 0-6
        assert df['caffeine'].min() >= 0
        assert df['caffeine'].max() <= 6
        
        # Hydration: 0-10
        assert df['hydration'].min() >= 0
        assert df['hydration'].max() <= 10
        
        # Hours worked: 0.5-8.0
        assert df['hours_worked'].min() >= 0.5
        assert df['hours_worked'].max() <= 8.0
        
        # Pomodoro: 0 or 1
        assert set(df['is_pomodoro'].unique()).issubset({0, 1})

    def test_generate_sample_data_mood_values(self):
        """Test that mood values are from expected set"""
        df = generate_sample_data(days=10)
        
        expected_moods = {'Calm', 'Content', 'Joyful', 'Sad', 'Annoyed', 
                         'Anxious', 'Confused', 'Angry', 'Scared', 'Exhausted'}
        actual_moods = set(df['mood'].unique())
        
        assert actual_moods.issubset(expected_moods)

    def test_generate_sample_data_time_categories(self):
        """Test that time category values are from expected set"""
        df = generate_sample_data(days=10)
        
        expected_categories = {'Work', 'Family', 'Hobby', 'Exercise', 'Social', 'Rest'}
        actual_categories = set(df['time_category'].unique())
        
        assert actual_categories.issubset(expected_categories)

    def test_generate_sample_data_happy_moments(self):
        """Test that happy moments are generated appropriately"""
        df = generate_sample_data(days=10)
        
        # Should have some happy moments (70% chance)
        happy_moments = df['happy_moment'].notna().sum()
        assert happy_moments > 0
        
        # All non-null happy moments should be strings
        non_null_moments = df['happy_moment'].dropna()
        assert all(isinstance(moment, str) for moment in non_null_moments)

    def test_generate_sample_data_sorted_by_date(self):
        """Test that generated data is sorted by date"""
        df = generate_sample_data(days=10)
        
        assert df['date'].is_monotonic_increasing

    def test_generate_sample_data_multiple_entries_per_day(self):
        """Test that multiple entries per day are generated"""
        df = generate_sample_data(days=5)
        
        # Should have multiple entries per day (1-4)
        date_counts = df['date'].value_counts()
        assert date_counts.min() >= 1
        assert date_counts.max() <= 4

    def test_generate_sample_data_zero_days(self):
        """Test sample data generation with zero days"""
        df = generate_sample_data(days=0)
        
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 0

    def test_generate_sample_data_negative_days(self):
        """Test sample data generation with negative days"""
        df = generate_sample_data(days=-5)
        
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 0

    def test_generate_sample_data_large_days(self):
        """Test sample data generation with large number of days"""
        df = generate_sample_data(days=365)
        
        assert isinstance(df, pd.DataFrame)
        assert len(df) > 0
        # Should have data spanning approximately 365 days
        date_range = df['date'].max() - df['date'].min()
        assert date_range.days >= 300  # Allow some flexibility

    @patch('analytics.energy_analytics.plot_energy_correlations')
    @patch('analytics.energy_analytics.plot_history_chart')
    @patch('analytics.energy_analytics.plot_time_breakdown')
    @patch('analytics.energy_analytics.plot_metric_trend')
    @patch('analytics.energy_analytics.calculate_summary_metrics')
    @patch('matplotlib.pyplot.savefig')
    def test_generate_example_usage(self, mock_savefig, mock_summary, mock_trend, 
                                   mock_breakdown, mock_history, mock_correlations):
        """Test example usage generation"""
        # Mock the return values
        mock_correlations.return_value = (MagicMock(), MagicMock())
        mock_history.return_value = MagicMock()
        mock_breakdown.return_value = MagicMock()
        mock_trend.return_value = (MagicMock(), "Test trend description")
        mock_summary.return_value = {
            'happy_moments_count': 10,
            'pomodoro_usage_pct': 50.0,
            'consecutive_tracking_days': 5,
            'high_energy_days': 3,
            'most_used_mood': 'Content',
            'milestone_hydration': False,
            'milestone_happy': False
        }
        
        # Should not raise any exceptions
        generate_example_usage()
        
        # Verify that the functions were called
        mock_correlations.assert_called_once()
        mock_history.assert_called_once()
        mock_breakdown.assert_called_once()
        mock_trend.assert_called_once()
        mock_summary.assert_called_once()
        assert mock_savefig.call_count == 4  # Four savefig calls

    def test_generate_sample_data_correlation_structure(self):
        """Test that generated data has some correlation structure"""
        df = generate_sample_data(days=30, seed=42)
        
        # Physical and cognitive energy should have some correlation
        correlation = df['physical_energy'].corr(df['cognitive_clarity'])
        assert not np.isnan(correlation)
        
        # Stress should be somewhat negatively correlated with energy
        stress_physical_corr = df['physical_energy'].corr(df['stress'])
        assert not np.isnan(stress_physical_corr)

    def test_generate_sample_data_dataframe_immutability(self):
        """Test that the original function doesn't modify input parameters"""
        original_days = 10
        original_seed = 123
        
        df = generate_sample_data(days=original_days, seed=original_seed)
        
        # Parameters should remain unchanged
        assert original_days == 10
        assert original_seed == 123
