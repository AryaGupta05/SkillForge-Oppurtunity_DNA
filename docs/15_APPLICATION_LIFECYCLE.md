# 15 — Application Lifecycle

## Overview

The **Application Lifecycle** governs candidate submissions for corporate internships and placements, managing status transitions from initial submission to final hiring or rejection.

```mermaid
stateDiagram-v2
    [*] --> Applied: Student Clicks 'Apply Now'
    Applied --> Shortlisted: Recruiter Reviews & Shortlists Candidate
    Applied --> Rejected: Recruiter Rejects Application
    Shortlisted --> Offered: Recruiter Extends Formal Job/Internship Offer
    Shortlisted --> Rejected: Recruiter Rejects Candidate
    Offered --> Placed: Student Accepts & Recruiter Marks Placed
    Offered --> Rejected: Candidate Declines Offer
    Placed --> [*]
    Rejected --> [*]
```

---

## 1. Valid Status Transitions & Rules

| Current Status | Allowed Target Statuses | Trigger Action | Role Authorized |
| :--- | :--- | :--- | :--- |
| `[None]` | `applied` | Student clicks **"Apply Now"** on opportunity card. | Student |
| `applied` | `shortlisted`, `rejected` | Recruiter clicks **"Shortlist Candidate"** or **"Reject"**. | Recruiter |
| `shortlisted` | `offered`, `rejected` | Recruiter clicks **"Extend Offer"** or **"Reject"**. | Recruiter |
| `offered` | `placed`, `rejected` | Recruiter clicks **"Mark Placed"** or **"Reject"**. | Recruiter |
| `placed` | `[Terminal State]` | Final successful hiring state. | System |
| `rejected` | `[Terminal State]` | Final rejected state. | System |

> **Validation Rule:** Invalid status transitions (e.g. attempting to jump directly from `applied` $\rightarrow$ `placed`) are blocked by FastAPI validation backend exceptions with HTTP 400 Bad Request responses.

---

## 2. API Endpoints & Data Model

* **Application Creation:** `POST /api/applications` (`ApplicationCreate` schema)
* **Status Update:** `PATCH /api/applications/{application_id}/status` (`ApplicationStatusUpdate` schema)
* **Get Candidate Applications:** `GET /api/candidates/{candidate_id}/applications`
* **Get Opportunity Applications:** `GET /api/opportunities/{opportunity_id}/applications`

---

## 3. Application Lifecycle Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant React as React UI (App.tsx)
    participant API as FastAPI Router (router.py)
    participant DB as SQLite DB (opportunity_dna.db)
    actor Recruiter

    Student->>React: Click 'Apply Now' (Opp #1)
    React->>API: POST /api/applications {candidate_id: 7, opportunity_id: 1}
    API->>DB: Query existing Application for (Cand #7, Opp #1)
    alt Already Applied
        API-->>React: HTTP 400 Bad Request "Already applied"
    else New Application
        API->>DB: INSERT into applications (status='applied', applied_at=NOW)
        DB-->>API: Application Record Saved (ID #4)
        API-->>React: HTTP 201 Created {id: 4, status: 'applied'}
        React-->>Student: Toast "Application Submitted Successfully!"
    end

    Recruiter->>React: Switch to Industry Portal -> View Applicants
    React->>API: GET /api/opportunities/1/applications
    API->>DB: SELECT * FROM applications WHERE opportunity_id = 1
    DB-->>API: List [Application #4 (applied)]
    API-->>React: Return JSON Array

    Recruiter->>React: Click 'Shortlist Candidate' on App #4
    React->>API: PATCH /api/applications/4/status {status: 'shortlisted'}
    API->>DB: UPDATE applications SET status='shortlisted', updated_at=NOW WHERE id=4
    DB-->>API: Application Record Updated
    API-->>React: HTTP 200 OK {id: 4, status: 'shortlisted'}
    React-->>Recruiter: Update Applicants Table UI (Status Badge: SHORTLISTED)
```
