# 28 — Troubleshooting

## Overview

This guide provides solutions for common setup, build, database, and execution issues in **SkillForge — Opportunity DNA**.

---

## 1. Backend Troubleshooting

### Issue 1: `ModuleNotFoundError: No module named 'fastapi'` (or other package)
* **Cause:** Python virtual environment is not activated, or packages were not installed in the active environment.
* **Solution:**
  ```powershell
  cd c:\Users\aryag\OneDrive\Desktop\Oppurtunity_DNA
  .\backend\venv\Scripts\Activate.ps1
  pip install -r backend/requirements.txt
  ```

### Issue 2: `sqlite3.OperationalError: no such column: opportunities.type`
* **Cause:** The SQLite database file (`opportunity_dna.db`) is missing newly added columns from migrations.
* **Solution:** Restart the FastAPI backend server. `backend/app/main.py` contains automated startup SQLite migration logic (`run_sqlite_migrations()`) that detects missing columns and executes `ALTER TABLE` automatically. Alternatively, re-seed the dataset:
  ```powershell
  .\backend\venv\Scripts\python.exe backend/seed_sih_demo.py
  ```

### Issue 3: `HTTP 404 Not Found` when making API requests
* **Cause:** Incorrect API path prefix.
* **Solution:** All FastAPI REST endpoints are mounted under the `/api` prefix (e.g. `http://127.0.0.1:8000/api/opportunities`, NOT `/api/v1/opportunities`).

---

## 2. Frontend Troubleshooting

### Issue 1: `npx tsc -b` reports TypeScript compilation errors
* **Cause:** Mismatch between TypeScript interfaces (`frontend/src/types/index.ts`) and backend JSON response schemas.
* **Solution:** Verify interface properties against `backend/app/schemas/schemas.py`.

### Issue 2: CORS Error in Browser Console (`Access-Control-Allow-Origin`)
* **Cause:** Frontend domain/port is not listed in backend CORS origins.
* **Solution:** Ensure `backend/app/main.py` includes `"http://localhost:5173"` and `"http://127.0.0.1:5173"` in its `origins` list.

---

## 3. Gemini AI Extraction Issues

### Issue: `google.generativeai` API Key / Rate Limit Error
* **Cause:** Missing or invalid `GEMINI_API_KEY` environment variable.
* **Solution:** Ensure `GEMINI_API_KEY` is set in your environment or `.env` file. If the API quota is exceeded, the service falls back gracefully to local heuristic skill extraction (`analyzer.py`).
