"""
Unit tests for energy_analytics.py module
"""
import pytest
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../src'))

from analytics.energy_analytics import (
    plot_energy_correlations,
    plot_history_chart,
    plot_time_breakdown,
    plot_metric_trend,
    calculate_summary_metrics,
    MOOD_SCALE,
    PRIMARY_COLOR,
    COLOR_PALETTE
)


class TestEnergyAnalytics:
    """Test class for energy analytics functions"""

    @pytest.fixture
    def sample_dataframe(self):
        """Create a sample DataFrame for testing"""
        dates = pd.date_range(start='2024-01-01', periods=30, freq='D')
        data = {
            'date': dates,
            'physical_energy': np.random.randint(1, 8, 30),
            'cognitive_clarity': np.random.randint(1, 8, 30),
            'mood': ['Calm', 'Content', 'Joyful', 'Sad', 'Annoyed'] * 6,
            'stress': np.random.randint(1, 5, 30),
            'caffeine': np.random.randint(0, 7, 30),
            'hydration': np.random.randint(0, 11, 30),
            'time_category': ['Work', 'Family', 'Hobby', 'Exercise', 'Social'] * 6,
            'hours_worked': np.random.uniform(0.5, 8.0, 30),
            'happy_moment': [f'happy_moment_{i}' if i % 3 == 0 else None for i in range(30)],
            'is_pomodoro': np.random.randint(0, 2, 30)
        }
        return pd.DataFrame(data)

    @pytest.fixture
    def empty_dataframe(self):
        """Create an empty DataFrame for edge case testing"""
        return pd.DataFrame()

    def test_mood_scale_constants(self):
        """Test that mood scale constants are properly defined"""
        assert isinstance(MOOD_SCALE, dict)
        assert 'Joyful' in MOOD_SCALE
        assert 'Sad' in MOOD_SCALE
        assert MOOD_SCALE['Joyful'] == 10
        assert MOOD_SCALE['Sad'] == 3

    def test_color_constants(self):
        """Test that color constants are properly defined"""
        assert isinstance(PRIMARY_COLOR, str)
        assert isinstance(COLOR_PALETTE, dict)
        assert PRIMARY_COLOR == '#953599'
        assert 'physical_energy' in COLOR_PALETTE

    @patch('matplotlib.pyplot.subplots')
    @patch('matplotlib.pyplot.close')
    def test_plot_energy_correlations_success(self, mock_close, mock_subplots, sample_dataframe):
        """Test successful energy correlations plotting"""
        # Mock the subplots return values
        mock_fig_bar = MagicMock()
        mock_ax_bar = MagicMock()
        mock_fig_heat = MagicMock()
        mock_ax_heat = MagicMock()
        
        mock_subplots.side_effect = [
            (mock_fig_bar, mock_ax_bar),
            (mock_fig_heat, mock_ax_heat)
        ]

        result = plot_energy_correlations(sample_dataframe, 'physical_energy')
        
        assert isinstance(result, tuple)
        assert len(result) == 2
        assert result[0] == mock_fig_bar
        assert result[1] == mock_fig_heat
        mock_close.assert_called_with('all')

    def test_plot_energy_correlations_with_category(self, sample_dataframe):
        """Test energy correlations with category filter"""
        with patch('matplotlib.pyplot.subplots') as mock_subplots, \
             patch('matplotlib.pyplot.close') as mock_close:
            
            mock_fig_bar = MagicMock()
            mock_ax_bar = MagicMock()
            mock_fig_heat = MagicMock()
            mock_ax_heat = MagicMock()
            
            mock_subplots.side_effect = [
                (mock_fig_bar, mock_ax_bar),
                (mock_fig_heat, mock_ax_heat)
            ]

            result = plot_energy_correlations(sample_dataframe, 'physical_energy', 'work')
            
            assert isinstance(result, tuple)
            assert len(result) == 2

    @patch('matplotlib.pyplot.subplots')
    @patch('matplotlib.pyplot.close')
    def test_plot_history_chart_success(self, mock_close, mock_subplots, sample_dataframe):
        """Test successful history chart plotting"""
        mock_fig = MagicMock()
        mock_ax = MagicMock()
        mock_subplots.return_value = (mock_fig, mock_ax)

        metrics = ['physical_energy', 'cognitive_clarity', 'mood']
        result = plot_history_chart(sample_dataframe, metrics)
        
        assert result == mock_fig

    def test_plot_history_chart_with_mood_conversion(self, sample_dataframe):
        """Test history chart with mood to numeric conversion"""
        with patch('matplotlib.pyplot.subplots') as mock_subplots:
            mock_fig = MagicMock()
            mock_ax = MagicMock()
            mock_subplots.return_value = (mock_fig, mock_ax)

            metrics = ['physical_energy', 'mood']
            result = plot_history_chart(sample_dataframe, metrics)
            
            assert result == mock_fig

    @patch('matplotlib.pyplot.subplots')
    def test_plot_time_breakdown_success(self, mock_subplots, sample_dataframe):
        """Test successful time breakdown plotting"""
        mock_fig = MagicMock()
        mock_ax = MagicMock()
        mock_subplots.return_value = (mock_fig, mock_ax)

        result = plot_time_breakdown(sample_dataframe)
        
        assert result == mock_fig

    @patch('matplotlib.pyplot.subplots')
    def test_plot_metric_trend_success(self, mock_subplots, sample_dataframe):
        """Test successful metric trend plotting"""
        mock_fig = MagicMock()
        mock_ax = MagicMock()
        mock_subplots.return_value = (mock_fig, mock_ax)

        result = plot_metric_trend(sample_dataframe, 'physical_energy')
        
        assert isinstance(result, tuple)
        assert len(result) == 2
        assert result[0] == mock_fig
        assert isinstance(result[1], str)

    def test_plot_metric_trend_with_mood(self, sample_dataframe):
        """Test metric trend with mood conversion"""
        with patch('matplotlib.pyplot.subplots') as mock_subplots:
            mock_fig = MagicMock()
            mock_ax = MagicMock()
            mock_subplots.return_value = (mock_fig, mock_ax)

            result = plot_metric_trend(sample_dataframe, 'mood')
            
            assert isinstance(result, tuple)
            assert len(result) == 2

    def test_calculate_summary_metrics_success(self, sample_dataframe):
        """Test successful summary metrics calculation"""
        result = calculate_summary_metrics(sample_dataframe, 30)
        
        assert isinstance(result, dict)
        assert 'happy_moments_count' in result
        assert 'pomodoro_usage_pct' in result
        assert 'consecutive_tracking_days' in result
        assert 'high_energy_days' in result
        assert 'most_used_mood' in result
        assert 'milestone_hydration' in result
        assert 'milestone_happy' in result

    def test_calculate_summary_metrics_with_milestone(self, sample_dataframe):
        """Test summary metrics with milestone achievement"""
        # Create data with 50+ happy moments
        extended_data = sample_dataframe.copy()
        for i in range(25):
            new_row = sample_dataframe.iloc[0].copy()
            new_row['date'] = sample_dataframe['date'].max() + timedelta(days=i+1)
            new_row['happy_moment'] = f'milestone_moment_{i}'
            extended_data = pd.concat([extended_data, new_row.to_frame().T], ignore_index=True)
        
        result = calculate_summary_metrics(extended_data, 30)
        
        assert result['milestone_happy'] == True
        assert 'time_since_happy_milestone' in result

    def test_calculate_summary_metrics_empty_data(self, empty_dataframe):
        """Test summary metrics with empty data"""
        with pytest.raises((KeyError, IndexError)):
            calculate_summary_metrics(empty_dataframe, 30)

    def test_plot_energy_correlations_empty_data(self, empty_dataframe):
        """Test energy correlations with empty data"""
        with pytest.raises((KeyError, IndexError)):
            plot_energy_correlations(empty_dataframe)

    def test_plot_history_chart_empty_data(self, empty_dataframe):
        """Test history chart with empty data"""
        with pytest.raises((KeyError, IndexError)):
            plot_history_chart(empty_dataframe, ['physical_energy'])

    def test_plot_time_breakdown_empty_data(self, empty_dataframe):
        """Test time breakdown with empty data"""
        with pytest.raises((KeyError, IndexError)):
            plot_time_breakdown(empty_dataframe)

    def test_plot_metric_trend_empty_data(self, empty_dataframe):
        """Test metric trend with empty data"""
        with pytest.raises((KeyError, IndexError)):
            plot_metric_trend(empty_dataframe, 'physical_energy')

    def test_plot_energy_correlations_invalid_target_metric(self, sample_dataframe):
        """Test energy correlations with invalid target metric"""
        with patch('matplotlib.pyplot.subplots') as mock_subplots, \
             patch('matplotlib.pyplot.close') as mock_close:
            
            mock_fig_bar = MagicMock()
            mock_ax_bar = MagicMock()
            mock_fig_heat = MagicMock()
            mock_ax_heat = MagicMock()
            
            mock_subplots.side_effect = [
                (mock_fig_bar, mock_ax_bar),
                (mock_fig_heat, mock_ax_heat)
            ]

            # Should handle gracefully even with invalid metric
            result = plot_energy_correlations(sample_dataframe, 'invalid_metric')
            assert isinstance(result, tuple)

    def test_plot_history_chart_invalid_metrics(self, sample_dataframe):
        """Test history chart with invalid metrics"""
        with patch('matplotlib.pyplot.subplots') as mock_subplots:
            mock_fig = MagicMock()
            mock_ax = MagicMock()
            mock_subplots.return_value = (mock_fig, mock_ax)

            # Should handle gracefully even with invalid metrics
            result = plot_history_chart(sample_dataframe, ['invalid_metric'])
            assert result == mock_fig

    def test_plot_metric_trend_invalid_metric(self, sample_dataframe):
        """Test metric trend with invalid metric"""
        with patch('matplotlib.pyplot.subplots') as mock_subplots:
            mock_fig = MagicMock()
            mock_ax = MagicMock()
            mock_subplots.return_value = (mock_fig, mock_ax)

            # Should handle gracefully even with invalid metric
            result = plot_metric_trend(sample_dataframe, 'invalid_metric')
            assert isinstance(result, tuple)

    def test_calculate_summary_metrics_custom_period(self, sample_dataframe):
        """Test summary metrics with custom period"""
        result = calculate_summary_metrics(sample_dataframe, 7)
        
        assert isinstance(result, dict)
        assert 'happy_moments_count' in result
        # Should have fewer days in the period
        assert result['happy_moments_count'] <= len(sample_dataframe)

    def test_plot_metric_trend_custom_parameters(self, sample_dataframe):
        """Test metric trend with custom parameters"""
        with patch('matplotlib.pyplot.subplots') as mock_subplots:
            mock_fig = MagicMock()
            mock_ax = MagicMock()
            mock_subplots.return_value = (mock_fig, mock_ax)

            result = plot_metric_trend(sample_dataframe, 'physical_energy', periods=7, trend_weeks=4)
            
            assert isinstance(result, tuple)
            assert len(result) == 2
