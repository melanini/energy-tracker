#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Generate sample data
echo "Generating sample data..."
python src/api/data/generate_sample_data.py

# Start the FastAPI server
echo "Starting FastAPI server..."
python -m uvicorn src.api.main:app --reload --port 8000
