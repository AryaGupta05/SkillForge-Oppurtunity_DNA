# 21 — Security and Privacy

## Overview

This chapter documents the security controls, data validation mechanisms, and privacy boundaries implemented in **SkillForge — Opportunity DNA**.

---

## 1. Implemented Security Controls

| Security Boundary | Implementation Details | Verified File / Component |
| :--- | :--- | :--- |
| **Input Payload Validation** | Pydantic schemas strictly validate field types, string lengths, and ranges for every API endpoint. | `backend/app/schemas/schemas.py` |
| **CORS Middleware Configuration** | FastAPI CORS middleware explicitly configures allowed origins (`http://localhost:5173`, `http://127.0.0.1:5173`). | `backend/app/main.py` |
| **SQL Injection Prevention** | All database queries execute via SQLAlchemy ORM parameterized statements. | `backend/app/models/models.py` |
| **Database Application Uniqueness**| Database unique constraints prevent candidates from submitting duplicate applications for the same position. | `backend/app/models/models.py` |
| **Global Exception Sanitization** | Centralized FastAPI exception handlers intercept unhandled exceptions and hide raw server tracebacks. | `backend/app/main.py` |
| **PDF Upload Handling** | Temporary PDF upload files are safely processed in memory and cleaned up post-analysis. | `backend/app/services/pdf.py` |

---

## 2. Security & Authentication Status (Current vs. Future Scope)

To maintain absolute technical honesty, the table below delineates current security state from production security requirements:

| Security Domain | Current Implementation | Production Requirement (Future Scope) |
| :--- | :--- | :--- |
| **User Authentication** | Demo Workspace Role Switching (Student, Industry, Academia tabs in UI). | OAuth2 / OpenID Connect JWT token authentication (`/api/auth/login`). |
| **Role-Based Access Control (RBAC)**| Workspace tab state selection in `App.tsx`. | Server-side JWT role claims checking (`@requires_role('recruiter')`). |
| **API Rate Limiting** | Open local execution for hackathon environment flexibility. | Redis-backed slowapi rate limiting per IP / API key. |
| **Data Encryption at Rest** | Local SQLite single-file database (`opportunity_dna.db`). | AES-256 encrypted PostgreSQL database storage. |
| **Document Storage Security** | Local memory processing. | AWS S3 bucket storage with pre-signed access URLs. |

---

## 3. Data Privacy Protections

1. **No Personal Data Stored in Evidence Extracts:** Gemini AI prompts extract technical skill concepts and supporting snippets, ignoring personal contact details.
2. **Exclusion of Sensitive Attributes from Matching:** Socio-economic attributes (gender, caste, family income, region) are never stored in matching feature vectors or passed to recommendation scoring functions.
