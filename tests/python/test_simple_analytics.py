"""
Simple unit tests for analytics functions without pandas dependency
"""
import pytest
import sys
import os
from unittest.mock import patch, MagicMock

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../src'))

def test_mood_scale_constants():
    """Test that mood scale constants are properly defined"""
    from analytics.energy_analytics import MOOD_SCALE
    
    assert isinstance(MOOD_SCALE, dict)
    assert 'Joyful' in MOOD_SCALE
    assert 'Sad' in MOOD_SCALE
    assert MOOD_SCALE['Joyful'] == 10
    assert MOOD_SCALE['Sad'] == 3

def test_color_constants():
    """Test that color constants are properly defined"""
    from analytics.energy_analytics import PRIMARY_COLOR, COLOR_PALETTE
    
    assert isinstance(PRIMARY_COLOR, str)
    assert isinstance(COLOR_PALETTE, dict)
    assert PRIMARY_COLOR == '#953599'
    assert 'physical_energy' in COLOR_PALETTE

@patch('matplotlib.pyplot.subplots')
@patch('matplotlib.pyplot.close')
def test_plot_energy_correlations_mock(mock_close, mock_subplots):
    """Test energy correlations plotting with mocked matplotlib"""
    from analytics.energy_analytics import plot_energy_correlations
    
    # Mock the subplots return values
    mock_fig_bar = MagicMock()
    mock_ax_bar = MagicMock()
    mock_fig_heat = MagicMock()
    mock_ax_heat = MagicMock()
    
    mock_subplots.side_effect = [
        (mock_fig_bar, mock_ax_bar),
        (mock_fig_heat, mock_ax_heat)
    ]

    # Create a simple mock DataFrame-like object
    class MockDataFrame:
        def __init__(self):
            self.data = {
                'physical_energy': [7, 6, 8, 5, 7],
                'cognitive_clarity': [6, 7, 5, 6, 7],
                'mood': ['Calm', 'Content', 'Joyful', 'Sad', 'Annoyed'],
                'stress': [3, 2, 1, 4, 3],
                'caffeine': [2, 3, 1, 4, 2],
                'hydration': [8, 7, 9, 6, 8]
            }
        
        def copy(self):
            return self
        
        def select_dtypes(self, include):
            return self
        
        @property
        def columns(self):
            return list(self.data.keys())
        
        def __getitem__(self, key):
            if key == 'physical_energy':
                return [7, 6, 8, 5, 7]
            return [1, 2, 3, 4, 5]
        
        def corr(self):
            return {
                'physical_energy': [1.0, 0.8, 0.6, -0.3, 0.7, 0.5],
                'cognitive_clarity': [0.8, 1.0, 0.7, -0.2, 0.6, 0.4],
                'mood_numeric': [0.6, 0.7, 1.0, -0.4, 0.5, 0.3],
                'stress': [-0.3, -0.2, -0.4, 1.0, -0.1, -0.2],
                'caffeine': [0.7, 0.6, 0.5, -0.1, 1.0, 0.6],
                'hydration': [0.5, 0.4, 0.3, -0.2, 0.6, 1.0]
            }
        
        def sort_values(self, by):
            return [0.8, 0.7, 0.6, 0.5, -0.3]
        
        def drop(self, item):
            return [0.8, 0.7, 0.6, 0.5, -0.3]

    mock_df = MockDataFrame()
    
    result = plot_energy_correlations(mock_df, 'physical_energy')
    
    assert isinstance(result, tuple)
    assert len(result) == 2
    assert result[0] == mock_fig_bar
    assert result[1] == mock_fig_heat
    mock_close.assert_called_with('all')

def test_sample_data_generation():
    """Test sample data generation without pandas"""
    from analytics.sample_data import generate_sample_data
    
    # Mock pandas and numpy
    with patch('pandas.DataFrame') as mock_df, \
         patch('numpy.random.seed'), \
         patch('numpy.random.randint') as mock_randint, \
         patch('numpy.random.normal') as mock_normal, \
         patch('numpy.random.uniform') as mock_uniform, \
         patch('numpy.clip') as mock_clip, \
         patch('numpy.round') as mock_round, \
         patch('random.seed'), \
         patch('random.choice') as mock_choice, \
         patch('random.randint') as mock_randint2, \
         patch('random.uniform') as mock_uniform2, \
         patch('random.random') as mock_random:
        
        # Mock return values
        mock_randint.return_value = [7, 6, 8, 5, 7]
        mock_normal.return_value = [0.5, -0.2, 0.8, -0.1, 0.3]
        mock_uniform.return_value = [2.5, 3.2, 1.8, 4.1, 2.9]
        mock_clip.return_value = [7, 6, 8, 5, 7]
        mock_round.return_value = [7, 6, 8, 5, 7]
        mock_choice.return_value = 'Calm'
        mock_randint2.return_value = 2
        mock_uniform2.return_value = 2.5
        mock_random.return_value = 0.5
        
        # Mock DataFrame methods
        mock_df_instance = MagicMock()
        mock_df_instance.sort_values.return_value = mock_df_instance
        mock_df_instance.reset_index.return_value = mock_df_instance
        mock_df.return_value = mock_df_instance
        
        result = generate_sample_data(days=5, seed=42)
        
        assert result == mock_df_instance
        mock_df.assert_called_once()

def test_generate_example_usage():
    """Test example usage generation"""
    from analytics.sample_data import generate_example_usage
    
    with patch('analytics.energy_analytics.plot_energy_correlations') as mock_correlations, \
         patch('analytics.energy_analytics.plot_history_chart') as mock_history, \
         patch('analytics.energy_analytics.plot_time_breakdown') as mock_breakdown, \
         patch('analytics.energy_analytics.plot_metric_trend') as mock_trend, \
         patch('analytics.energy_analytics.calculate_summary_metrics') as mock_summary, \
         patch('matplotlib.pyplot.savefig') as mock_savefig, \
         patch('analytics.sample_data.generate_sample_data') as mock_generate:
        
        # Mock return values
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
        mock_generate.return_value = MagicMock()
        
        # Should not raise any exceptions
        generate_example_usage()
        
        # Verify that the functions were called
        mock_correlations.assert_called_once()
        mock_history.assert_called_once()
        mock_breakdown.assert_called_once()
        mock_trend.assert_called_once()
        mock_summary.assert_called_once()
        assert mock_savefig.call_count == 4  # Four savefig calls

if __name__ == '__main__':
    pytest.main([__file__])
