# Use Ubuntu 22.04 as the base image
FROM ubuntu:22.04

# Set environment variables to disable interactive prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install system dependencies and Python
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create a working directory
WORKDIR /app

# Copy requirements file separately to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port FastAPI will run on
EXPOSE 8000

# Start the FastAPI application using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
