# 20 — Data Flow

## 1. Flow A: Student Evidence to Skill Passport

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant SPA as React Frontend
    participant API as FastAPI Router
    participant AI as Gemini AI Service
    participant NORM as Normalization Service
    participant DB as SQLite Database

    Student->>SPA: Upload PDF Resume or Enter Project Description
    SPA->>API: POST /api/evidence {candidate_id, title, text}
    API->>AI: analyze_project_evidence(text)
    AI-->>API: JSON Skills List [{skill_name: "tf", proficiency: "Intermediate"}]
    API->>NORM: normalize_skill_name("tf")
    NORM-->>API: Canonical Skill Name "TensorFlow"
    API->>DB: INSERT into candidate_skills & skill_evidence
    DB-->>API: Records Saved
    API-->>SPA: Return Updated Opportunity DNA Profile
    SPA-->>Student: Render Verified Skill Passport Chips & Signals
```

---

## 2. Flow B: Opportunity Recommendation Matching

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant SPA as React Frontend
    participant API as FastAPI Router
    participant MATCH as Matching Engine
    participant DB as SQLite Database

    Student->>SPA: View 'Recommended Corporate Opportunities'
    SPA->>API: GET /api/candidates/7/dna
    API->>DB: Fetch CandidateSkills, Evidence, Preferences
    API->>DB: Fetch Active Opportunities & RequiredSkills
    API->>MATCH: calculate_match_score(Candidate, Opportunity)
    MATCH-->>API: Return Match Score %, Factor Breakdown, Skill Gaps
    API-->>SPA: Return Ranked Recommendations Array
    SPA-->>Student: Display Opportunity Cards with Match Scores (63.0%)
```

---

## 3. Flow C: Application Lifecycle & Recruiter Shortlisting

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant SPA as React Frontend
    participant API as FastAPI Router
    participant DB as SQLite Database
    actor Recruiter

    Student->>SPA: Click 'Apply Now' on Opportunity #1
    SPA->>API: POST /api/applications {candidate_id: 7, opportunity_id: 1}
    API->>DB: INSERT INTO applications (status='applied')
    DB-->>API: Application Saved
    API-->>SPA: Return HTTP 201 Created

    Recruiter->>SPA: Open Industry Portal -> View Applicants
    SPA->>API: GET /api/opportunities/1/applications
    API->>DB: SELECT * FROM applications WHERE opportunity_id = 1
    DB-->>API: Return Application #1 (status='applied')
    API-->>SPA: Return Applications JSON

    Recruiter->>SPA: Click 'Shortlist Candidate'
    SPA->>API: PATCH /api/applications/1/status {status: 'shortlisted'}
    API->>DB: UPDATE applications SET status='shortlisted'
    DB-->>API: Record Updated
    API-->>SPA: Return Updated Status JSON
    SPA-->>Recruiter: Update Applicants Table UI (Status: SHORTLISTED)
```

---

## 4. Flow D: Academia Institutional Analytics

```mermaid
sequenceDiagram
    autonumber
    actor CollegeAdmin
    participant SPA as React Frontend
    participant API as FastAPI Router
    participant DB as SQLite Database

    CollegeAdmin->>SPA: Click 'Academia Portal' Tab
    SPA->>API: GET /api/analytics/institution-dashboard
    API->>DB: Aggregate CandidateSkills across all candidates (Student Supply %)
    API->>DB: Aggregate OpportunitySkills across all positions (Industry Demand %)
    API->>API: Compute Net Deficit Gap % = Demand % - Supply %
    API->>API: Categorize Gaps (CRITICAL >= 30%, MODERATE, ALIGNED)
    API-->>SPA: Return InstitutionDashboardResponse JSON
    SPA-->>CollegeAdmin: Render Supply vs Demand Chart & Gap Table
```
