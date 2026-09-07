# 24 — Setup and Run Guide

## Prerequisites

Before setting up SkillForge, ensure the following software is installed on your system:
* **Python:** Version `3.10` or higher (`python --version`)
* **Node.js:** Version `18.0` or higher (`node --version`)
* **npm:** Version `9.0` or higher (`npm --version`)

---

## 1. Backend Setup & Startup

### Step 1: Navigate to Workspace Root
```powershell
cd c:\Users\aryag\OneDrive\Desktop\Oppurtunity_DNA
```

### Step 2: Activate Virtual Environment & Install Dependencies
```powershell
# Activate Virtual Environment (Windows)
.\backend\venv\Scripts\Activate.ps1

# Install / Verify Python Packages
pip install -r backend/requirements.txt
```

### Step 3: Configure Environment Variables
Ensure `backend/app/core/config.py` or `.env` has your Gemini API Key set:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=sqlite:///c:/Users/aryag/OneDrive/Desktop/Oppurtunity_DNA/opportunity_dna.db
```

### Step 4: Seed Initial Demo Dataset
```powershell
.\backend\venv\Scripts\python.exe backend/seed_sih_demo.py
```

### Step 5: Start FastAPI Backend Server
```powershell
.\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
> The API will be live at `http://127.0.0.1:8000`. Interactive Swagger docs are available at `http://127.0.0.1:8000/docs`.

---

## 2. Frontend Setup & Startup

### Step 1: Open New Terminal & Navigate to Frontend Directory
```powershell
cd c:\Users\aryag\OneDrive\Desktop\Oppurtunity_DNA\frontend
```

### Step 2: Install Node Dependencies
```powershell
npm install
```

### Step 3: Start Vite Frontend Development Server
```powershell
npx vite --host 127.0.0.1 --port 5173
```
> Access the web application in your browser at `http://127.0.0.1:5173`.

---

## 3. How to Run Automated Verification Commands

```powershell
# 1. Run Backend Pytest Suite
cd c:\Users\aryag\OneDrive\Desktop\Oppurtunity_DNA
.\backend\venv\Scripts\python.exe -m pytest backend/app/tests -q

# 2. Run TypeScript Static Check
cd frontend
npx tsc -b

# 3. Build Production Frontend Bundle
cd frontend
npx vite build
```
