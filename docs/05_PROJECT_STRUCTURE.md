# 05 — Project Structure

## 1. Directory Tree Overview

```text
Oppurtunity_DNA/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── router.py             # FastAPI REST Endpoints & Route Controllers
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py             # Application Settings & Env Configuration
│   │   │   └── database.py           # SQLAlchemy Engine & Session Setup
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── models.py             # SQLAlchemy ORM Database Table Definitions
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py            # Pydantic Request & Response Data Schemas
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── analyzer.py           # AI Evidence Parsing & Skill Discovery Service
│   │   │   ├── dna.py                # Skill DNA Capability Profiler Service
│   │   │   ├── eligibility.py        # PMIS Eligibility Pre-Check Rules Engine
│   │   │   ├── fairness.py           # Counterfactual Bias & Responsible AI Audit
│   │   │   ├── github.py             # GitHub Repository Analyzer Service
│   │   │   ├── job_analyzer.py       # Job Description Skill Extraction Service
│   │   │   ├── llm.py                # Gemini LLM Integration Service
│   │   │   ├── matcher.py            # Deterministic Matching & Scoring Engine
│   │   │   ├── normalization.py      # Canonical Skill Taxonomy Normalization
│   │   │   ├── pdf.py                # PDF Document Text Extraction Service
│   │   │   └── roadmap.py            # Personal Upskilling Roadmap Generator
│   │   ├── tests/
│   │   │   ├── test_fairness.py      # Bias Audit Tests
│   │   │   ├── test_matching.py      # Matching Formula Unit Tests
│   │   │   ├── test_pipeline.py      # End-to-End Pipeline Integration Tests
│   │   │   ├── test_regression.py    # Regression & Upload Tests
│   │   │   ├── test_sih26044.py      # SIH26044 Applications & Analytics Tests
│   │   │   └── test_sih_features.py  # PMIS Features Tests
│   │   ├── __init__.py
│   │   └── main.py                   # FastAPI Application Entrypoint & Migrations
│   ├── seed_sih_demo.py              # Canonical SIH Demo Seeding Script
│   ├── requirements.txt              # Python Dependency Manifest
│   └── venv/                         # Python Virtual Environment
├── docs/                             # Project Technical Documentation Suite
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts                # Frontend Fetch API Client Service
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript Interface Definitions
│   │   ├── App.tsx                   # Main React Application & Portals Shell
│   │   ├── main.tsx                  # React DOM Root Entrypoint
│   │   └── index.css                 # Tailwind CSS Directives & Global Styles
│   ├── package.json                  # Node.js Package Dependencies & Scripts
│   ├── tsconfig.json                 # TypeScript Compiler Options
│   └── vite.config.ts                # Vite Development Server Configuration
└── opportunity_dna.db               # SQLite Relational Database Storage
```

---

## 2. Key File Descriptions & Responsibilities

| File Path | Description | Critical Rule / Warning |
| :--- | :--- | :--- |
| `backend/app/services/matcher.py` | Implementation of candidate-to-opportunity matching formulas, proficiency weighting, and preference bonuses. | ⚠️ **DO NOT MODIFY** without explicit authorization. Matching formulas are verified by unit tests. |
| `backend/app/services/dna.py` | Calculates candidate skill depth, skill breadth, confidence averages, and evidence strength multipliers. | ⚠️ **DO NOT MODIFY** scoring signals casually. |
| `backend/app/services/analyzer.py` | Orchestrates Gemini AI calls to parse evidence descriptions into structured JSON skill records. | ⚠️ Preserves raw evidence traceability. |
| `backend/app/models/models.py` | Defines SQLAlchemy ORM tables (`Candidate`, `Opportunity`, `Application`, `Evidence`, `Skill`, etc.). | Any new column requires corresponding migration handling in `main.py`. |
| `backend/app/schemas/schemas.py` | Defines Pydantic request and response contracts (`ApplicationCreate`, `InstitutionDashboardResponse`, etc.). | Must match TypeScript interfaces in `frontend/src/types/index.ts`. |
| `backend/app/api/router.py` | FastAPI route handlers for applications, analytics, readiness simulations, and bias audits. | All endpoints must handle 404/400 exceptions cleanly. |
| `backend/seed_sih_demo.py` | Idempotent seed script creating canonical demo candidates (Aarav Sharma, Priya Patel), opportunities, and applications. | Executed to reset database state for clean demonstrations. |
| `frontend/src/App.tsx` | Comprehensive React shell managing top tab navigation, sub-sections, interactive modals, and localized strings. | Preserves seamless switching between Student, Industry, and Academia portals. |
| `frontend/src/services/api.ts` | Single source of truth for frontend HTTP communications calling `http://127.0.0.1:8000/api`. | Ensures consistent JSON request/response handling. |
