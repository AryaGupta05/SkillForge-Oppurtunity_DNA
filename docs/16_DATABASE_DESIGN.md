# 16 — Database Design

## Overview

SkillForge uses a relational database schema implemented via SQLAlchemy ORM (`backend/app/models/models.py`) and backed by SQLite (`opportunity_dna.db`).

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    CANDIDATE ||--o{ EVIDENCE : owns
    CANDIDATE ||--o{ CANDIDATE_SKILL : possesses
    CANDIDATE ||--o{ APPLICATION : submits
    CANDIDATE ||--o{ RECOMMENDATION : receives
    CANDIDATE ||--o{ BIAS_AUDIT : audited_in

    SKILL ||--o{ CANDIDATE_SKILL : mapped_in
    SKILL ||--o{ OPPORTUNITY_SKILL : required_in

    EVIDENCE ||--o{ SKILL_EVIDENCE : proves
    CANDIDATE_SKILL ||--o{ SKILL_EVIDENCE : backed_by

    OPPORTUNITY ||--o{ OPPORTUNITY_SKILL : requires
    OPPORTUNITY ||--o{ APPLICATION : receives_app
    OPPORTUNITY ||--o{ RECOMMENDATION : target_of
    OPPORTUNITY ||--o{ BIAS_AUDIT : audited_for

    CANDIDATE {
        int id PK
        string name
        string email UK
        string location
        string institution
        boolean institution_is_elite
        string highest_degree
        string qualification_stream
        float family_income
        boolean is_family_govt_employee
        string preferred_location
        string preferred_sector
    }

    EVIDENCE {
        int id PK
        int candidate_id FK
        string title
        string type
        string source
        datetime date
        text description
    }

    SKILL {
        int id PK
        string name UK
        string category
        text description
    }

    CANDIDATE_SKILL {
        int id PK
        int candidate_id FK
        int skill_id FK
        string proficiency
        float confidence
        int evidence_count
    }

    OPPORTUNITY {
        int id PK
        string title
        string company
        string type
        int duration_months
        float stipend
        string location
        string sector
        string allowed_streams
    }

    APPLICATION {
        int id PK
        int candidate_id FK
        int opportunity_id FK
        string status
        datetime applied_at
        datetime updated_at
    }
```

---

## 2. Table Specifications & Column Dictionary

### 1. `candidates` Table
* `id` (INTEGER, PK): Unique candidate identifier.
* `name` (VARCHAR): Candidate full name.
* `email` (VARCHAR, Unique): Contact email address.
* `location` (VARCHAR): Current city/region.
* `institution` (VARCHAR): Educational college/university.
* `institution_is_elite` (BOOLEAN): Tier-1 pedigree indicator.
* `highest_degree` (VARCHAR): Degree qualification (*B.Tech*, *B.Com*).
* `qualification_stream` (VARCHAR): Academic branch (*Computer Science & Engineering*).
* `family_income` (FLOAT): Annual household income.
* `is_family_govt_employee` (BOOLEAN): Government employment flag.
* `preferred_location` (VARCHAR): Target work location.
* `preferred_sector` (VARCHAR): Target industry sector.

### 2. `opportunities` Table
* `id` (INTEGER, PK): Unique opportunity identifier.
* `title` (VARCHAR): Job/internship title (*AI/ML Engineering Intern (DEMO)*).
* `company` (VARCHAR): Hiring company name.
* `type` (VARCHAR): Position type (`internship` vs `placement`).
* `duration_months` (INTEGER): Contract duration in months.
* `stipend` (FLOAT): Monthly stipend/compensation (₹).
* `location` (VARCHAR): Target work city.
* `sector` (VARCHAR): Industry sector (*IT & Software*, *Finance & Banking*).
* `allowed_streams` (TEXT): Permitted academic streams.

### 3. `applications` Table
* `id` (INTEGER, PK): Unique application identifier.
* `candidate_id` (INTEGER, FK $\rightarrow$ `candidates.id`): Applied candidate.
* `opportunity_id` (INTEGER, FK $\rightarrow$ `opportunities.id`): Target position.
* `status` (VARCHAR): Lifecycle state (`applied`, `shortlisted`, `offered`, `placed`, `rejected`).
* `applied_at` (DATETIME): Timestamp of application submission.
* `updated_at` (DATETIME): Timestamp of last status transition.

### 4. `evidence` Table
* `id` (INTEGER, PK): Unique evidence artifact identifier.
* `candidate_id` (INTEGER, FK $\rightarrow$ `candidates.id`): Artifact owner.
* `title` (VARCHAR): Artifact name (*Flower Classification using MobileNetV2*).
* `type` (VARCHAR): Evidence classification (*project*, *work_experience*).
* `source` (VARCHAR): Document source (*Project Evidence*, *Resume*).
* `description` (TEXT): Full project summary text.
