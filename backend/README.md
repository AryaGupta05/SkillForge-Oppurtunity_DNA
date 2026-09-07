# Opportunity DNA - Backend Setup Guide

The backend is built with FastAPI, SQLAlchemy, and Pydantic. It supports SQLite locally and is designed to transition to PostgreSQL in production.

## Prerequisites
- Python 3.10 or higher (We detected version 3.13.5 is installed)

## Setup Instructions

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Create a Virtual Environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate the Virtual Environment**:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt)**:
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```

4. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Customize `.env` values (e.g. `GEMINI_API_KEY` or `OPENAI_API_KEY` if utilizing real LLM profiling).

---

## Running the Application

To ensure imports resolve properly, run the `uvicorn` server from the **root directory** of the monorepo:

```bash
# From the root directory (Oppurtunity_DNA/)
python -m uvicorn backend.app.main:app --reload --port 8000
```

Alternatively, if running from the `backend/` directory, set the python path:
- **Windows (PowerShell)**:
  ```powershell
  $env:PYTHONPATH=".."
  python -m uvicorn app.main:app --reload --port 8000
  ```
- **Linux/macOS**:
  ```bash
  PYTHONPATH=.. python -m uvicorn app.main:app --reload --port 8000
  ```

Once running, the following pages are available:
- **API Health Status**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Redoc Alternative Docs**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
