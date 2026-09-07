# 04 — Technology Stack

All technologies listed below have been verified against the current codebase (`package.json`, `requirements.txt`, and source imports).

---

## 1. Frontend Technologies

| Technology | Version | Purpose & Usage in Project | Why Selected |
| :--- | :--- | :--- | :--- |
| **React** | `^19.2.8` | Core UI library (`frontend/src/App.tsx`). Renders component views, manages interactive state for Student, Industry, and Academia portals. | Modern component model, virtual DOM efficiency, seamless state reactivity. |
| **TypeScript** | `~6.0.2` | Static typing system (`frontend/src/types/index.ts`). Enforces strict API contract interfaces across components. | Prevents runtime type errors, improves developer experience and IDE auto-completion. |
| **Vite** | `^8.2.0` | Development server and bundle tool (`vite.config.ts`). Powers fast hot-module replacement and production builds. | Instant server start, lightning-fast HMR, highly optimized ESM production bundling. |
| **Tailwind CSS** | `^3.4.19` | Utility-first CSS framework (`frontend/src/index.css`). Utility classes for layout, typography, colors, and responsive design. | Rapid UI styling, consistent design token system, zero runtime CSS overhead. |
| **Lucide React** | `^1.33.0` | Icon library (`App.tsx`). Provides clean SVG icons for navigation tabs, status indicators, and buttons. | Comprehensive icon set, small bundle footprint, native React component wrappers. |
| **Recharts** | `^3.10.1` | Data visualization library (`App.tsx`). Renders interactive supply vs. demand bar charts and gap pie charts. | Native SVG rendering in React, responsive container sizing, simple declarative API. |

---

## 2. Backend Technologies

| Technology | Version | Purpose & Usage in Project | Why Selected |
| :--- | :--- | :--- | :--- |
| **Python** | `3.13` | Core server programming language powering FastAPI endpoints and analytical business services. | Excellent data processing capabilities, rich ecosystem for AI and analytical workloads. |
| **FastAPI** | `0.141.1` | High-performance Web framework (`backend/app/main.py`). Defines REST API endpoints, routing, and CORS middleware. | Automatic OpenAPI docs generation, native async support, performance matching NodeJS/Go. |
| **Uvicorn** | `0.52.4` | ASGI server implementation running the FastAPI backend on `http://127.0.0.1:8000`. | Lightweight, high-throughput asynchronous HTTP server implementation for Python. |
| **SQLAlchemy** | `2.0.52` | Relational ORM (`backend/app/models/models.py`). Handles database queries, schema definitions, and table relationships. | Flexible object-relational mapping, declarative model syntax, robust transaction management. |
| **SQLite** | `3.x` | Embedded relational database (`opportunity_dna.db`). Stores candidates, opportunities, skills, applications, and audits. | Zero-configuration serverless database, portable single-file storage, ideal for hackathons & demos. |
| **Pydantic** | `2.13.4` | Data validation library (`backend/app/schemas/schemas.py`). Validates request payloads and formats API JSON responses. | Strict type enforcement, automatic data coercion, informative validation error messages. |
| **PyMuPDF (`fitz`)**| `1.28.2` | Document parsing library (`backend/app/services/pdf.py`). Extracts raw text from uploaded student PDF resumes. | High-speed PDF text extraction, lightweight memory footprint, reliable formatting retention. |

---

## 3. Artificial Intelligence & Machine Learning

| Technology | Version | Purpose & Usage in Project | Why Selected |
| :--- | :--- | :--- | :--- |
| **Google Gemini AI**| `google-generativeai 0.8.6` | LLM service (`backend/app/services/llm.py`, `analyzer.py`). Parses unstructured project text and PDFs into structured JSON skill evidence. | Exceptional structured JSON output compliance, broad contextual reasoning, fast inference time. |

---

## 4. Testing & QA Tools

| Technology | Version | Purpose & Usage in Project | Why Selected |
| :--- | :--- | :--- | :--- |
| **Pytest** | `8.x` | Backend unit and integration test runner (`backend/app/tests/`). Executes 41 automated test cases. | Clean test syntax, powerful fixture system, detailed assertions and failure tracebacks. |
| **Playwright** | `1.62.0` | End-to-end browser automation framework (`scratch/run_browser_qa.py`). Performs headless browser UI testing and generates screenshots. | Cross-browser support, reliable DOM waiting mechanisms, automated screenshot/video capabilities. |
