# 03 — System Architecture

## 1. High-Level System Architecture Diagram

SkillForge follows a decoupled client-server architecture. The frontend is built as a single-page application (SPA) using React, TypeScript, Tailwind CSS, and Recharts. The backend is built with FastAPI (Python) using SQLAlchemy ORM connected to a SQLite relational database.

```mermaid
graph TB
    subgraph Client Layer (Frontend SPA)
        UI[React + TypeScript + Tailwind UI]
        API_CLIENT[API Service Layer - api.ts]
        STATE[React State & Hooks]
        UI <--> STATE
        STATE <--> API_CLIENT
    end

    subgraph Server Layer (FastAPI Backend)
        ROUTER[FastAPI Router - router.py]
        SCHEMAS[Pydantic Schemas - schemas.py]
        
        subgraph Business Services
            AI_SVC[AI Analyzer Service - analyzer.py]
            DNA_SVC[DNA Calculator - dna.py]
            MATCH_SVC[Matching Engine - matcher.py]
            ROAD_SVC[Roadmap Generator - roadmap.py]
            FAIR_SVC[Fairness Service - fairness.py]
        end

        ROUTER --> SCHEMAS
        ROUTER --> AI_SVC
        ROUTER --> DNA_SVC
        ROUTER --> MATCH_SVC
        ROUTER --> ROAD_SVC
        ROUTER --> FAIR_SVC
    end

    subgraph Data & External Services
        ORM[SQLAlchemy Models - models.py]
        DB[(SQLite Database - opportunity_dna.db)]
        GEMINI[Google Gemini AI API]

        AI_SVC --> GEMINI
        ROUTER --> ORM
        ORM --> DB
    end

    API_CLIENT <-->|HTTP REST / JSON| ROUTER
```

---

## 2. Component Responsibility Breakdown

| Component Layer | Primary Path / File | Responsibility |
| :--- | :--- | :--- |
| **Frontend Presentation** | `frontend/src/App.tsx` | Main application shell managing portal switching (Student, Industry, Academia), sub-tabs, interactive modals, and localized strings. |
| **Frontend API Gateway** | `frontend/src/services/api.ts` | Centralized Fetch-based HTTP service handling requests, headers, and error parsing for all backend endpoints. |
| **Frontend Data Types** | `frontend/src/types/index.ts` | TypeScript interface definitions mirroring backend API schema structures. |
| **Backend API Gateway** | `backend/app/api/router.py` | Defines FastAPI REST routes, endpoint parameters, schema validation, DB transaction lifecycle, and HTTP status handling. |
| **Data Validation Layer** | `backend/app/schemas/schemas.py` | Pydantic data schemas defining strict request payloads and response serializations. |
| **Database Models** | `backend/app/models/models.py` | SQLAlchemy ORM declarations mapping candidates, evidence, skills, opportunities, applications, and audits to SQLite. |
| **AI Extraction Service** | `backend/app/services/analyzer.py` | Orchestrates PyMuPDF text parsing and Gemini LLM prompts for extracting skill evidence. |
| **Skill DNA Calculator** | `backend/app/services/dna.py` | Calculates candidate skill depth, breadth, confidence, and overall capability signal. |
| **Matching Engine** | `backend/app/services/matcher.py` | Computes deterministic candidate-to-opportunity match percentages and skill gap breakdowns. |
| **Roadmap Service** | `backend/app/services/roadmap.py` | Generates personalized upskilling paths and milestone recommendations for missing skills. |
| **Fairness Audit Service** | `backend/app/services/fairness.py` | Runs counterfactual bias analysis across demographic and institutional variables. |

---

## 3. Detailed Request-Response Lifecycle Flow

To understand how data flows through the architecture, consider the **Candidate Application Workflow**:

```
[User clicks 'Apply Now' in React UI]
           ↓
1. React component invokes `api.createApplication({ candidate_id: 7, opportunity_id: 1 })`
           ↓
2. HTTP POST request sent to `http://127.0.0.1:8000/api/applications` with JSON body
           ↓
3. FastAPI matches path in `router.py` and validates payload via Pydantic `ApplicationCreate` schema
           ↓
4. Router opens SQLite session via SQLAlchemy (`database.py`) and checks for existing applications
           ↓
5. New `Application` model instantiated with initial status `'applied'`, `applied_at=utcnow()`
           ↓
6. SQLAlchemy commits record to `opportunity_dna.db` and refreshes instance
           ↓
7. Router returns HTTP 201 Created with JSON response matching `ApplicationOut` schema
           ↓
8. React `api.ts` receives response payload and returns parsed JSON to `App.tsx`
           ↓
9. React updates local state `applications`, triggering a re-render of the "My Applications" view
```

---

## 4. Architectural Guarantees & Constraints

1. **Decoupled Business Logic:** Service files (`matcher.py`, `dna.py`, `analyzer.py`) contain pure Python domain logic and do not import FastAPI route objects.
2. **Stateless Backend:** The FastAPI backend relies on database persistence (`opportunity_dna.db`) and maintains no in-memory session state across restarts.
3. **Database Schema Auto-Migration:** `backend/app/main.py` contains automated startup SQLite PRAGMA inspection to add missing columns gracefully without data loss.
