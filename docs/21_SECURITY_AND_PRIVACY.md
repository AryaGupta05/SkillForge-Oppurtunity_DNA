# 21 — Security and Privacy

## Overview

This chapter documents the security controls, authentication mechanisms, server-side Role-Based Access Control (RBAC), data validation, and privacy boundaries implemented in **SkillForge — Opportunity DNA**.

---

## 1. Implemented Security & Authentication Controls

| Security Boundary | Implementation Details | Verified File / Component |
| :--- | :--- | :--- |
| **User Authentication** | Real JSON Web Token (JWT) authentication using direct bcrypt password hashing and Bearer token issuance. | `backend/app/core/security.py`, `backend/app/api/router.py` |
| **Server-Side RBAC** | Role enforcement (`student`, `industry`, `academia`) via FastAPI dependencies (`get_current_user`, `require_role`). | `backend/app/api/router.py` |
| **Input Payload Validation** | Pydantic schemas strictly validate field types, string lengths, and ranges for every API endpoint. | `backend/app/schemas/schemas.py` |
| **CORS Middleware Configuration** | FastAPI CORS middleware explicitly configures allowed origins (`http://localhost:5173`, `http://127.0.0.1:5173`). | `backend/app/main.py` |
| **SQL Injection Prevention** | All database queries execute via SQLAlchemy ORM parameterized statements. | `backend/app/models/models.py` |
| **Database Application Uniqueness**| Database unique constraints prevent candidates from submitting duplicate applications for the same position. | `backend/app/models/models.py` |
| **Global Exception Sanitization** | Centralized FastAPI exception handlers intercept unhandled exceptions and hide raw server tracebacks. | `backend/app/main.py` |
| **PDF Upload Handling** | Temporary PDF upload files are safely processed in memory and cleaned up post-analysis. | `backend/app/services/pdf.py` |

---

## 2. Authentication & Authorization Architecture

### Authentication API Endpoints
- `POST /api/auth/register`: User registration with email, bcrypt password hash, full name, role selection (`student`, `industry`, `academia`), and automatic candidate profile creation for students.
- `POST /api/auth/login`: User login validating email and password hash, returning signed JWT access token and user metadata.
- `GET /api/auth/me`: Authenticated endpoint returning current user session profile.

### Server-Side Role-Based Access Control Rules
1. **Student Role (`student`)**:
   - Access to Student Portal and personal Skill Passport.
   - Allowed to submit applications only for their own candidate account.
   - Allowed to view only their own Opportunity DNA (`GET /api/candidates/{id}/dna`). Viewing another student's DNA returns `403 Forbidden`.
   - Restricted from creating opportunities (`403 Forbidden`), viewing full applicant lists (`403 Forbidden`), or accessing the institution analytics dashboard (`403 Forbidden`).

2. **Industry Partner Role (`industry`)**:
   - Access to Industry Partner Portal.
   - Allowed to post new internships and placement opportunities (`POST /api/opportunities`). Sets `posted_by_user_id`.
   - Allowed to view candidate applicants and transition application statuses (`applied` → `shortlisted` → `offered` → `placed`).
   - Restricted from submitting candidate job applications (`403 Forbidden`).

3. **Academia Role (`academia`)**:
   - Access to Institutional Skill Intelligence Console (`GET /api/analytics/institution-dashboard`).
   - Full visibility across aggregate student skill supply, industry skill demand, and curriculum gap analytics.

---

## 3. Security Status Summary

| Security Domain | Implemented Status | Verification Suite |
| :--- | :--- | :--- |
| **User Authentication** | Fully Implemented (JWT + Bcrypt) | `backend/app/tests/test_auth.py` |
| **Role-Based Access Control (RBAC)**| Fully Implemented Server-Side Dependencies | `backend/app/tests/test_auth.py` |
| **API Rate Limiting** | Open local execution for hackathon flexibility. | Future Scope (Redis slowapi) |
| **Data Encryption at Rest** | Local SQLite database (`opportunity_dna.db`). | Production Scope (Encrypted DB) |
| **Document Storage Security** | In-memory stream processing (`BytesIO`). | Production Scope (S3 Signed URLs) |

---

## 4. Data Privacy Protections

1. **No Personal Data Stored in Evidence Extracts:** Gemini AI prompts extract technical skill concepts and supporting snippets, ignoring personal contact details.
2. **Exclusion of Sensitive Attributes from Matching:** Socio-economic attributes (gender, caste, family income, region) are never stored in matching feature vectors or passed to recommendation scoring functions.
