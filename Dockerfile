# Start from an official NVIDIA CUDA base image
FROM nvidia/cuda:12.1.1-devel-ubuntu22.04

# Set up the environment
ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# Install system dependencies, including Python 3.10 (the default for Ubuntu 22.04)
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    python3.10-dev \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# Make 'python' command use python3.10
RUN ln -sf /usr/bin/python3.10 /usr/bin/python

# Copy and install Python packages from your requirements file
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your application code into the container
COPY . .

# Expose the port the server runs on
EXPOSE 8000

# Command to run the application
# We use --host 0.0.0.0 to make it accessible from outside the container
CMD ["python", "-m", "uvicorn", "api_server:app", "--host", "0.0.0.0", "--port", "8000"]
