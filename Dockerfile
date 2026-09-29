FROM python:3.11-slim

WORKDIR /app

# Install system build dependencies and OpenMP for LightGBM/XGBoost
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application and ML service modules
COPY backend backend
COPY ml ml

# Generate synthetic dataset and train candidate ML models during build
RUN python ml/data/generate_dataset.py && python ml/src/train.py

EXPOSE 8000

# Bind to Render's dynamic $PORT if set, otherwise default to 8000
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
