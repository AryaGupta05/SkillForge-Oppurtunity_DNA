# 17 — API Reference

All backend API endpoints are prefix-mounted under `/api` in `backend/app/main.py`.

---

## 0. Authentication Endpoints

### `POST /api/auth/register`
* **Description:** Registers a new user with bcrypt hashed password and returns a JWT access token. If registering as `student`, automatically creates/links a `Candidate` profile.
* **Request Payload (`UserRegisterRequest`):**
  ```json
  {
    "email": "aarav.sharma.demo@example.com",
    "password": "demo123",
    "full_name": "Aarav Sharma",
    "role": "student",
    "institution": "Delhi Institute of Engineering & Technology"
  }
  ```
* **Response:** `201 Created` $\rightarrow$ `TokenResponse` object.

### `POST /api/auth/login`
* **Description:** Authenticates user credentials and returns JWT Bearer access token.
* **Request Payload (`UserLoginRequest`):**
  ```json
  {
    "email": "recruiter.demo@opportunity-dna.in",
    "password": "demo123"
  }
  ```
* **Response:** `200 OK` $\rightarrow$ `TokenResponse` object | `401 Unauthorized`.

### `GET /api/auth/me`
* **Description:** Returns the current authenticated user's session profile.
* **Header:** `Authorization: Bearer <access_token>`
* **Response:** `200 OK` $\rightarrow$ `UserResponse` object | `401 Unauthorized`.

---

## 1. Candidate Endpoints

### `GET /api/candidates`
* **Description:** Retrieves all candidate profiles in the system.
* **Response:** `200 OK` $\rightarrow$ Array of `CandidateOut` objects.

### `GET /api/candidates/{candidate_id}`
* **Description:** Retrieves detailed profile data for a specific candidate.
* **Response:** `200 OK` $\rightarrow$ `CandidateOut` object | `404 Not Found`.

### `GET /api/candidates/{candidate_id}/dna`
* **Description:** Computes and returns candidate Opportunity DNA metrics, skill passport chips, and calculated depth/breadth signals. Enforces student self-view RBAC policy (`403` if student attempts to view another candidate's DNA).
* **Response:** `200 OK` $\rightarrow$ `OpportunityDNAProfileResponse`.

---

## 2. Opportunity Endpoints

### `GET /api/opportunities`
* **Description:** Retrieves all corporate internship and placement listings.
* **Response:** `200 OK` $\rightarrow$ Array of `OpportunityOut` objects (including type and required skills).

### `POST /api/opportunities`
* **Description:** Posts a new corporate opportunity (Internship or Placement). Enforces `industry` role check (`403` if student attempts to post).
* **Request Payload (`OpportunityCreate`):**
  ```json
  {
    "title": "Junior Business Analyst",
    "company": "FinServ Analytics",
    "type": "placement",
    "duration_months": 12,
    "stipend": 25000,
    "location": "Mumbai",
    "sector": "Finance & Banking",
    "allowed_streams": "Commerce, B.Com, MBA",
    "description": "Analyze business data using SQL and Excel.",
    "required_skills": [
      { "skill_id": 8, "importance": 1.0, "required_level": "Intermediate" }
    ]
  }
  ```
* **Response:** `200 OK` $\rightarrow$ `OpportunityOut` object.

---

## 3. Application Lifecycle Endpoints

### `POST /api/applications`
* **Description:** Submits a candidate application for an opportunity. Restricted to `student` role for their own candidate record.
* **Request Payload (`ApplicationCreate`):**
  ```json
  {
    "candidate_id": 7,
    "opportunity_id": 1
  }
  ```
* **Response:** `201 Created` $\rightarrow$ `ApplicationOut` | `400 Bad Request` (Duplicate application) | `403 Forbidden`.

### `PATCH /api/applications/{application_id}/status`
* **Description:** Updates application recruitment status (`applied` $\rightarrow$ `shortlisted` $\rightarrow$ `offered` $\rightarrow$ `placed`). Restricted to `industry` role.
* **Request Payload (`ApplicationStatusUpdate`):**
  ```json
  {
    "status": "shortlisted"
  }
  ```
* **Response:** `200 OK` $\rightarrow$ `ApplicationOut` | `400 Bad Request` (Invalid transition) | `403 Forbidden`.

### `GET /api/opportunities/{opportunity_id}/applications`
* **Description:** Fetches all candidate applications for a specific corporate opportunity. Restricted for student users (`403 Forbidden`).
* **Response:** `200 OK` $\rightarrow$ Array of `ApplicationOut` objects.

---

## 4. Analytics & Simulation Endpoints

### `GET /api/analytics/institution-dashboard`
* **Description:** Calculates macro-level institutional skill analytics comparing student supply % vs. industry demand % and prioritizing critical skill gap deficits. Restricted for student role (`403 Forbidden`).
* **Response:** `200 OK` $\rightarrow$ `InstitutionDashboardResponse`.

### `GET /api/analytics/skill-demand`
* **Description:** Returns top required skills aggregated across all corporate postings.
* **Response:** `200 OK` $\rightarrow$ `IndustrySkillDemandResponse`.

### `GET /api/candidates/{candidate_id}/opportunities/{opportunity_id}/readiness`
* **Description:** Returns current match score, missing skills breakdown, potential contribution gains, and projected scores.
* **Response:** `200 OK` $\rightarrow$ `ReadinessSimulationResponse`.
