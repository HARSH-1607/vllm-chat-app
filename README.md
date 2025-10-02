# Local AI Chat Application powered by vLLM

This is a complete, self-contained chat application that runs a powerful Large Language Model (LLM) locally on a user's machine. It features a web-based, ChatGPT-like user interface and is containerized with Docker for portability.

## Features

* **Local Inference:** Runs entirely on your own GPU, no internet connection required after setup.
* **High-Performance Engine:** Uses the `vLLM` inference engine for fast token generation.
* **Streaming Responses:** The AI's response is streamed token-by-token for a real-time feel.
* **Modern Web UI:** A clean, dark-themed user interface with support for Markdown, code syntax highlighting, and one-click copy buttons.
* **Containerized:** Packaged with Docker for easy setup and deployment.

## Tech Stack

* **Backend:** Python, FastAPI
* **AI Engine:** vLLM
* **Frontend:** HTML, CSS, JavaScript (Vanilla)
* **Containerization:** Docker
* **Base OS:** Ubuntu 22.04 (in WSL and Docker)

## How to Run

### Prerequisites
* A Windows machine with an NVIDIA GPU (6GB+ VRAM recommended).
* WSL2 installed.
* Docker Desktop for Windows installed and configured for WSL2 integration.

### Running with Docker (Recommended)

1.  Clone this repository.
2.  In a terminal, navigate to the project directory.
3.  Build the Docker image:
    ```bash
    docker build -t my-chat-app .
    ```
4.  Run the Docker container, giving it access to your GPU:
    ```bash
    docker run --gpus all -d -p 8080:8000 --name vllm-chat my-chat-app
    ```
5.  Wait a minute for the model to load, then open your web browser to **`http://127.0.0.1:8080`**.

### Running Locally (Without Docker)

1.  Follow the setup steps to install WSL, Python, and all dependencies in a virtual environment.
2.  Navigate to the project directory and activate the environment.
3.  Run the server:
    ```bash
    python -m uvicorn api_server:app --reload
    ```
4.  Open your web browser to **`http://127.0.0.1:8000`**.
