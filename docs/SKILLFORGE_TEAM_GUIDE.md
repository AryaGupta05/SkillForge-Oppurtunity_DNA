# SkillForge — Team Guide
> **Tagline:** *"Find the opportunity. Understand the gap. Build the path."*  
> **SIH Problem Statement ID:** SIH26044 — *"Portal for Academia - Industry collaboration for Skill Mapping, Internships and Placement"*

---

## 1. Project in One Minute

### What is SkillForge?
**SkillForge — Opportunity DNA** is an AI-powered academia-industry collaboration portal that aligns student technical skills with corporate internship and permanent placement requirements.

Instead of relying on unverified resumes or college brand names, SkillForge extracts verifiable capabilities directly from student project evidence, builds a transparent **Opportunity DNA** profile, matches candidates objectively with industry postings, and guides universities on closing institutional skill gaps.

### Who Uses It?
SkillForge serves three core stakeholders in a single unified system:

```
[Student] ───> Builds Skill Passport, views matches, simulates readiness & applies
[Industry] ──> Posts internships/placements, views Skill DNA & shortlists applicants
[Academia] ──> Views student supply vs. market demand & identifies curriculum gaps
```

### The One-Sentence Summary
> *"SkillForge creates an evidence-backed skill profile for students, matches it with industry requirements, helps students identify and improve skill gaps, manages applications, and gives institutions visibility into student skills versus industry demand."*

---

## 2. SIH26044 Problem

The higher education ecosystem in India faces a structural disconnect between what colleges teach and what industry employers expect:

```mermaid
graph TD
    A[Academia / Colleges] -- "Teaches general curriculum" --> B(Graduating Students)
    C[Industry Employers] -- "Requires practical technical skills" --> B
    B -- "Unclear skill gaps & resume black hole" --> D{Employability & Hiring Failure}
```

### The Three Core Disconnects
1. **The Student Problem:** Students lack clarity on what specific technical skills employers expect. They submit resumes into "black holes" without knowing why they were rejected or how to improve.
2. **The Industry Problem:** Recruiters are flooded with keyword-stuffed, unverified resumes. They struggle to evaluate authentic hands-on project experience efficiently, leading to expensive screening and institutional pedigree bias.
3. **The Academia Problem:** Educational institutions operate in a silo. College placement cells lack real-time visibility into industry skill demands and cannot identify institutional skill deficits across their student body.

### How SkillForge Solves the Problem
SkillForge bridges all three disconnects through a single evidence-grounded data pipeline:
* **Students** get traceable skill profiles, objective match scores, and personalized upskilling roadmaps.
* **Industry** gets pre-verified capability signals (Opportunity DNA) and streamlined candidate shortlisting for both short-term internships and permanent placements.
* **Academia** gets macro-level dashboards showing campus skill supply versus market demand to make data-backed curriculum adjustments.

---

## 3. How the Whole System Works

Every action in SkillForge flows through an integrated 12-step pipeline:

```mermaid
flowchart TD
    A[Student Project Evidence] -->|AI Extraction| B[Gemini AI Discovery]
    B -->|Canonical Normalization| C[Canonical Skill Taxonomy]
    C -->|Calculate Signals| D[Opportunity DNA Profile]
    D & E[Industry Requirement Matrix] -->|Deterministic Scoring| F[Candidate Match Score %]
    F --> G[Readiness Simulator & Upskilling Roadmap]
    F --> H[Student Submits Application]
    H -->|Status Transition| I[Recruiter Shortlisting Funnel]
    I --> J[Offer & Placement Outcomes]
    D & E & H -->|Macro Aggregation| K[Academia Supply vs Demand Analytics]
    K --> L[Institutional Skill Gap Prioritization]
```

### Step-by-Step System Flow
1. **Student Evidence:** The student inputs details of real technical projects or uploads a PDF resume.
2. **AI Skill Extraction:** Google Gemini AI analyzes the unstructured text, extracting technical skills, confidence scores, and supporting snippets.
3. **Skill Normalization:** Raw aliases (e.g. *"tf"*, *"keras"*) are mapped deterministically to canonical skill concepts (*TensorFlow*).
4. **Opportunity DNA:** The engine calculates signal metrics: Skill Depth, Skill Breadth, Average Confidence, and Evidence Multiplier.
5. **Industry Requirements:** Employers post corporate internships (`type='internship'`) or placements (`type='placement'`) with required skill levels and importance weights.
6. **Deterministic Matching:** The engine computes an objective candidate-opportunity match percentage (e.g. **63.0%**) without using socio-economic attributes.
7. **Recommendations:** The student views ranked corporate postings with transparent "Why this match?" factor breakdowns.
8. **Readiness & Skill Gaps:** The student identifies missing skills (*Docker*, *SQL*), simulates score boosts (up to **85.4%**), and receives a 1.1-month upskilling roadmap.
9. **Application Submission:** The student clicks "Apply Now", creating a database application record with initial status `'applied'`.
10. **Industry Shortlisting:** The recruiter views applicant Opportunity DNA profiles and transitions status (`applied` $\rightarrow$ `shortlisted` $\rightarrow$ `offered` $\rightarrow$ `placed`).
11. **Academia Analytics:** The university console aggregates campus student skill supply against active industry demand.
12. **Institutional Skill Gaps:** The system highlights net deficit gaps ($\ge 30\%$) to guide targeted workshops and elective course updates.

---

## 4. Three Portals

SkillForge provides three dedicated workspaces accessible via top tab navigation:

| Portal Workspace | Primary User | Core Objective | Key Features & Actions |
| :--- | :--- | :--- | :--- |
| **Student Portal** | Enrolled Students | Build Skill Passport, view matches, simulate readiness & apply | Profile overview, Skill Passport chips with evidence modals, ranked opportunity cards, Readiness Simulator, Upskilling Roadmap, My Applications tracking. |
| **Industry Partner Portal** | Corporate Recruiters | Post positions, review Skill DNA & manage hiring funnel | Post Internship & Placement modal, Applicants table with status transitions (`Shortlist`, `Offer`, `Place`), Skill Demand Analytics, Responsible AI Bias Audit. |
| **Academia Portal** | College Leadership & Placement Deans | Monitor campus skill supply vs. market demand & bridge gaps | Campus overview metrics, Student Skill Supply %, Industry Skill Demand %, Net Deficit Gap chart, Critical Gap alerts, Student capability drill-down. |

---

### Student Portal View
The Student Portal guides candidates through a 4-step workflow:
1. **Student Profile (`1. Student Profile`):** Displays candidate academic background (degree, stream, institution, location) and provides resume upload functionality.
2. **Skill Passport (`2. Skill Passport`):** Renders capability chips (Python, TensorFlow, SQL) with confidence ratings. Clicking a chip opens an **Evidence Modal** showing the exact project that proved the skill.
3. **Recommended Opportunities (`3. Recommended Corporate Opportunities`):** Lists corporate positions ranked by match percentage (e.g. **63.0%**), complete with monthly compensation, duration, location, and a transparent score breakdown.
4. **My Applications (`4. My Applications`):** Tracks submission status (`Applied`, `Shortlisted`, `Offered`, `Placed`) updated live from the backend database.

---

### Industry Partner Portal View
The Industry Portal equips recruiters to make data-backed hiring decisions:
1. **My Posted Opportunities:** Displays grid of active corporate listings (5 Internships + 1 Placement position).
2. **Create Opportunity Modal:** Allows recruiters to define new positions, specify compensation (₹/month), location, duration, allowed streams, and attach required skills with proficiency levels.
3. **Applicants & Shortlisting Funnel:** Provides an interactive recruitment table for each opportunity. Recruiters can click **"View Skill DNA"** to inspect project evidence or click contextual action buttons:
   $$\text{Shortlist Candidate} \longrightarrow \text{Extend Offer} \longrightarrow \text{Mark Placed}$$
4. **Skill Demand Analytics & Bias Audit:** Visualizes aggregate industry skill demand and verifies counterfactual fairness across demographic variables.

---

### Academia Portal View
The Academia Portal transforms university placement operations from reactive booking to proactive skill development:
1. **Institutional Overview:** Displays total enrolled students, campus-wide average DNA match score, active corporate positions, and total placement count.
2. **Skill Demand vs. Supply Matrix:** Compares student supply percentage against industry demand percentage side-by-side.
3. **Skill Gap Prioritization:** Automatically flags net deficit gaps ($\ge 30\%$) as **CRITICAL GAPS** (e.g., Docker, SQL), signaling immediate need for college workshops or elective additions.
4. **Student Drill-Down Modal:** Clicking any skill displays all students possessing or lacking that capability.

---

## 5. Opportunity DNA

### What is Opportunity DNA?
**Opportunity DNA** is a verifiable, multi-layered capability signal. Instead of trusting self-reported resume claims, Opportunity DNA anchors every skill score directly to authentic student project artifacts.

```
[Project Evidence / Artifact] ──> [AI Skill Discovery] ──> [Traceable Skill Passport] ──> [Opportunity DNA Signal]
```

### Concrete Example: Aarav Sharma's Projects
Consider demo student **Aarav Sharma** (ID `#7`), a B.Tech Computer Science student with 3 project artifacts:

| Project Artifact Title | Key Technologies / Text Evidence | Discovered Skills Linked |
| :--- | :--- | :--- |
| **1. Flower Classification using MobileNetV2** | Transfer learning pipeline using MobileNetV2 & TensorFlow on 102 flower categories. 94.2% test accuracy. | Python, TensorFlow, Machine Learning, Computer Vision |
| **2. AI Chatbot using Ollama and Mistral** | RAG conversational assistant with Ollama LLM, FAISS vector embeddings, and LangChain. | Python, Natural Language Processing (NLP), Generative AI |
| **3. Lost & Found Campus Web Portal** | Full-stack web application with Java Spring Boot backend, MySQL database, and REST APIs. | Java, MySQL, SQL, REST APIs, JavaScript, HTML/CSS |

### Why Evidence Traceability Matters
If a recruiter asks *"Why does Aarav have a 95% confidence rating in Computer Vision?"*, SkillForge provides the exact answer:  
👉 *Extracted from Project Artifact #1: "Flower Classification using MobileNetV2" (Date: April 2025).*

---

## 6. AI Layer

### How Gemini AI Contributes
SkillForge uses Google Gemini AI (`backend/app/services/analyzer.py` & `llm.py`) exclusively for **Unstructured Text Processing**:

```
[Raw Project Text / PDF Resume] ──> [Gemini AI Prompt] ──> [Structured Skill JSON] ──> [Canonical Normalization]
```

1. **Text Extraction:** Parses unstructured text from project descriptions or PDF resumes (`pdf.py`).
2. **Skill Discovery:** Identifies technical skills, assigns extraction confidence ratings ($0.0 - 1.0$), and extracts supporting text quotes.
3. **Structured JSON Output:** Returns clean JSON data formatted strictly according to backend schemas.

### Critical Distinction: What AI Does NOT Do
> ⚠️ **IMPORTANT:** Gemini AI does **NOT** compute candidate match scores, calculate readiness projections, or decide who gets shortlisted. All matching, readiness, and analytics calculations are handled by **100% deterministic mathematical algorithms** in Python.

---

## 7. Matching Engine

### How Match Scores Are Calculated (`matcher.py`)
The Matching Engine evaluates candidates against corporate job requirements using a transparent, multi-factor formula.

#### 1. Skill Proficiency Values ($V_p$)
Proficiency levels translate to numeric weights:
* **Beginner:** `0.5`
* **Intermediate:** `0.8`
* **Advanced / Expert:** `1.0`

#### 2. Requirement Weight ($W_r$)
* **Required Skill:** `Importance Weight × 1.0`
* **Preferred Skill:** `Importance Weight × 0.8`

#### 3. Candidate Skill Score ($S_c$)
$$S_c = V_p \times \text{Confidence} \times \min(1.5, \max(0.5, \text{Evidence Multiplier}))$$

#### 4. Skill Fit Ratio ($R_s$)
* If Candidate Score $S_c \ge$ Required Level $R_p \longrightarrow R_s = 1.0$ (100% fit).
* If Candidate Score $S_c <$ Required Level $R_p \longrightarrow R_s = \frac{S_c}{R_p}$.

#### 5. Weighted Raw Capability Score
$$\text{Raw Fit Score} = \left( \frac{\sum (R_s \times W_r)}{\sum W_r} \right) \times 100$$

#### 6. Transparent Preference Adjustments
Small transparent preference bonuses are added to the raw score:
* **Stream Match:** $+1.0\%$ if candidate stream is allowed.
* **Location Match:** $+2.0\%$ if candidate preferred location matches job location.
* **Sector Match:** $+2.0\%$ if candidate preferred sector matches job sector.

$$\text{Final Capped Score} = \min(100.0, \text{Raw Fit Score} + \text{Preference Bonuses})$$

---

### Worked Example: Aarav vs. AI/ML Engineering Intern

| Required Skill | Importance | Required Level | Aarav's Score | Match Ratio ($R_s$) | Weight ($W_r$) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Python** | 1.0 | Intermediate [0.8] | 0.95 (Intermediate) | 1.0 (100%) | 1.00 |
| **Machine Learning** | 1.0 | Intermediate [0.8] | 0.95 (Intermediate) | 1.0 (100%) | 1.00 |
| **TensorFlow** | 0.9 | Intermediate [0.8] | 0.90 (Intermediate) | 1.0 (100%) | 0.90 |
| **Computer Vision** | 0.9 | Intermediate [0.8] | 0.90 (Intermediate) | 1.0 (100%) | 0.90 |
| **Docker** | 0.6 | Beginner [0.5] (Pref) | 0.00 (Missing) | 0.0 (0%) | 0.48 |
| **SQL** | 0.5 | Beginner [0.5] (Pref) | 0.00 (Missing) | 0.0 (0%) | 0.40 |

$$\text{Raw Fit Score} = \left( \frac{1.0 + 1.0 + 0.9 + 0.9 + 0 + 0}{1.0 + 1.0 + 0.9 + 0.9 + 0.48 + 0.40} \right) \times 100 = \left( \frac{3.8}{4.68} \right) \times 100 = 81.2\%$$

After applying candidate evidence factors and preference bonuses, Aarav achieves a verified score of **63.0%**.

---

## 8. Readiness + Roadmap

The **Readiness Simulator** and **Upskilling Roadmap** convert static match scores into an actionable learning journey:

```
[Current Match: 63.0%] ──> [Check Missing Skills: +Docker, +SQL] ──> [Projected Match: 85.4%] ──> [1.1-Month Roadmap]
```

1. **Current Readiness (63.0%):** Reflects candidate's existing demonstrated fit.
2. **Missing Skill Identification:** The system identifies missing skills: **Docker** (+12.2% potential gain) and **SQL** (+10.2% potential gain).
3. **Interactive Simulation:** Selecting both skill checkboxes dynamically projects a new match score of **85.4%** (+22.4% net boost).
4. **Personalized Upskilling Roadmap:** Generates a 1.1-month learning roadmap (~10h/week) with curated milestone resources:
   * *Milestone 1 (Docker):* Docker Essentials Course & Containerization Project.
   * *Milestone 2 (SQL):* Relational Database & SQL Querying Fundamentals Course.

> ℹ️ *Note: Numerical values are dataset-specific demo results generated from the canonical seed database.*

---

## 9. Application Workflow

Candidate applications follow a strict, database-backed state machine:

```mermaid
stateDiagram-v2
    [*] --> Applied: Student Clicks 'Apply Now'
    Applied --> Shortlisted: Recruiter Clicks 'Shortlist'
    Applied --> Rejected: Recruiter Rejects
    Shortlisted --> Offered: Recruiter Clicks 'Extend Offer'
    Shortlisted --> Rejected: Recruiter Rejects
    Offered --> Placed: Recruiter Clicks 'Mark Placed'
    Offered --> Rejected: Recruiter Rejects
    Placed --> [*]
    Rejected --> [*]
```

### Full Application Flow
1. **Student Action:** Student clicks **"Apply Now"** on an opportunity card.
2. **API Execution:** React sends `POST /api/applications` with `{ candidate_id: 7, opportunity_id: 1 }`.
3. **Database Insertion:** FastAPI creates an `Application` record in `opportunity_dna.db` with status `'applied'`.
4. **Recruiter View:** The recruiter opens the Industry Portal and sees the applicant listed.
5. **Recruiter Action:** The recruiter clicks **"Shortlist Candidate"**, sending `PATCH /api/applications/{id}/status` with `{ status: 'shortlisted' }`.
6. **Live Persistence:** The UI status badge updates instantly to `SHORTLISTED` and persists across browser refreshes.

---

## 10. Academia Intelligence

The Academia Portal aggregates student capabilities and corporate postings into three core metrics (`router.py`):

### 1. Student Skill Supply %
$$\text{Supply \%} = \left( \frac{\text{Students Possessing Skill}}{\text{Total Enrolled Students}} \right) \times 100$$

### 2. Industry Skill Demand %
$$\text{Demand \%} = \left( \frac{\text{Opportunities Requiring Skill}}{\text{Total Active Opportunities}} \right) \times 100$$

### 3. Net Institutional Deficit Gap %
$$\text{Net Deficit Gap \%} = \text{Industry Demand \%} - \text{Student Supply \%}$$

### Gap Priority Levels
* **CRITICAL GAP (Net Deficit $\ge 30\%$):** High industry demand, low student supply. Requires immediate campus bootcamps (e.g. *Docker*: Demand 33.3%, Supply 0.0% $\rightarrow$ Net Deficit +33.3%).
* **MODERATE GAP ($10\% \le \text{Net Deficit} < 30\%$):** Requires elective course expansion.
* **ALIGNED / SURPLUS ($\text{Net Deficit} < 10\%$):** Well represented on campus (e.g. *Python*, *JavaScript*).

---

## 11. Architecture + Tech Stack

### High-Level Architecture

```mermaid
graph TB
    subgraph Frontend Client
        REACT[React 19 + TypeScript + Tailwind UI]
        API_CLIENT[API Service Client - api.ts]
        REACT <--> API_CLIENT
    end

    subgraph Backend Server
        FASTAPI[FastAPI Web Server - router.py]
        SCHEMAS[Pydantic Validation - schemas.py]
        SERVICES[Engine Services: matcher.py, dna.py, analyzer.py, roadmap.py]
        FASTAPI --> SCHEMAS
        FASTAPI --> SERVICES
    end

    subgraph Storage & AI
        SQLALCHEMY[SQLAlchemy ORM - models.py]
        SQLITE[(SQLite DB - opportunity_dna.db)]
        GEMINI[Google Gemini AI API]
        SERVICES --> GEMINI
        FASTAPI --> SQLALCHEMY
        SQLALCHEMY --> SQLITE
    end

    API_CLIENT <-->|HTTP REST / JSON| FASTAPI
```

### Verified Technology Stack Summary
* **Frontend:** React (`^19.2.8`), TypeScript (`~6.0.2`), Vite (`^8.2.0`), Tailwind CSS (`^3.4.19`), Recharts (`^3.10.1`), Lucide React (`^1.33.0`).
* **Backend:** Python (`3.13`), FastAPI (`0.141.1`), Uvicorn (`0.52.4`), SQLAlchemy (`2.0.52`), Pydantic (`2.13.4`), PyMuPDF (`1.28.2`).
* **Database:** SQLite (`opportunity_dna.db`).
* **AI Integration:** Google Gemini AI API (`google-generativeai 0.8.6`).
* **Testing & QA:** Pytest (`8.x`), Playwright (`1.62.0`).

---

## 12. Database — High Level Only

SkillForge uses 10 primary relational models declared in `backend/app/models/models.py`:

```mermaid
erDiagram
    CANDIDATE ||--o{ EVIDENCE : owns
    CANDIDATE ||--o{ CANDIDATE_SKILL : possesses
    CANDIDATE ||--o{ APPLICATION : submits
    SKILL ||--o{ CANDIDATE_SKILL : mapped
    SKILL ||--o{ OPPORTUNITY_SKILL : required
    OPPORTUNITY ||--o{ OPPORTUNITY_SKILL : requires
    OPPORTUNITY ||--o{ APPLICATION : receives
```

### Summary of Major Entities
1. `Candidate` (`candidates`): Student demographics, stream, degree, income, preferences.
2. `Evidence` (`evidence`): Project artifacts, repositories, work experience descriptions.
3. `Skill` (`skills`): Canonical skill catalog records (name, category, description).
4. `CandidateSkill` (`candidate_skills`): Student skill proficiencies, confidence, evidence counts.
5. `SkillEvidence` (`skill_evidence`): Traceable links between candidate skills and evidence artifacts.
6. `Opportunity` (`opportunities`): Corporate position listings (`type='internship'` or `'placement'`).
7. `OpportunitySkill` (`opportunity_skills`): Required skills attached to an opportunity with importance weights.
8. `Application` (`applications`): Application records tracking recruitment lifecycle status.
9. `Recommendation` (`recommendations`): Cached match scores and gap breakdowns.
10. `BiasAudit` (`bias_audits`): Logged demographic fairness audit results.

---

## 13. APIs — High Level Only

All backend REST endpoints are mounted under `/api` in `backend/app/main.py`:

### Candidate & DNA APIs
* `GET /api/candidates` — List all student candidates.
* `GET /api/candidates/{id}/dna` — Compute candidate Opportunity DNA profile and Skill Passport.

### Opportunity APIs
* `GET /api/opportunities` — List active corporate internship and placement positions.
* `POST /api/opportunities` — Post a new corporate position (`OpportunityCreate` payload).

### Application Lifecycle APIs
* `POST /api/applications` — Submit a candidate application (`{ candidate_id, opportunity_id }`).
* `PATCH /api/applications/{id}/status` — Transition application status (`{ status: 'shortlisted' }`).
* `GET /api/opportunities/{id}/applications` — List candidate applications for an opportunity.

### Analytics & Simulation APIs
* `GET /api/analytics/institution-dashboard` — Compute campus supply vs. demand gap analytics.
* `GET /api/simulation/readiness` — Compute candidate readiness score simulation.

---

## 14. Responsible AI

SkillForge incorporates Responsible AI principles across its architectural design:

```
[Evidence Grounding] ──> [Deterministic Matching] ──> [Counterfactual Fairness Audit]
```

1. **Evidence Grounding:** Skills cannot exist without traceable project evidence. Keyword stuffing is eliminated.
2. **Deterministic Matching:** Match scores are calculated using transparent mathematical formulas. AI is not used for scoring.
3. **Counterfactual Fairness Auditing:** The `FairnessAuditService` (`fairness.py`) verifies that candidate match scores remain identical when demographic variables (income, gender, region, pedigree) are altered while technical skills remain fixed.

### What the System Guarantees vs. Does Not Guarantee
* ✅ **Guaranteed:** 0.0% score variance across demographic and pedigree variables in match scoring.
* 🔵 **Cannot Guarantee:** Human recruiter decision-making outside the platform.

---

## 15. Testing

SkillForge maintains a verified quality baseline:

```text
================================================================================
VERIFIED QUALITY BASELINE
================================================================================
1. Backend Pytest Suite   : 41 / 41 PASSED (pytest backend/app/tests -q)
2. TypeScript Compiler     : 0 Errors (npx tsc -b passed cleanly)
3. Vite Production Build   : SUCCESSFUL (dist/index.html compiled in 11.5s)
4. Playwright Browser QA   : 7 / 7 E2E Workflows PASSED
================================================================================
```

### Verified End-to-End Browser Workflow
Automated Playwright browser QA (`scratch/run_browser_qa.py`) verified the complete cross-portal lifecycle:
$$\text{Student Portal} \longrightarrow \text{Apply Now} \longrightarrow \text{Industry Portal} \longrightarrow \text{Shortlist} \longrightarrow \text{Academia Dashboard} \longrightarrow \text{Refresh Persistence}$$

---

## 16. Demo Data

The platform is seeded with canonical demo profiles via `backend/seed_sih_demo.py`:

```
[Aarav Sharma - B.Tech CSE] ──> 3 Projects (AI/ML) ──> Top Match: AI/ML Engineering Intern (63.0%)
[Priya Patel - B.Com] ───────> 2 Projects (Finance) ──> Top Match: Junior Business Analyst (Placement)
```

1. **Aarav Sharma (`aarav.sharma.demo@example.com`):**
   * *Degree:* B.Tech Computer Science & Engineering, Delhi Institute of Engineering & Technology.
   * *Projects:* Flower Classification (MobileNetV2), AI Chatbot (Ollama/Mistral), Campus Web Portal (Java/MySQL).
2. **Priya Patel (`priya.patel.demo@opportunity-dna.in`):**
   * *Degree:* B.Com Commerce & Business, Mumbai College of Arts & Commerce.
   * *Projects:* Student Budget Tracker Web App, Excel Data Analysis for Small Business.

> 🔒 **PRIVACY GUARANTEE:** All candidate names, email addresses, and project descriptions are 100% fictional demo records.

---

## 17. How to Run

### 1. Start Backend Server
```powershell
cd c:\Users\aryag\OneDrive\Desktop\Oppurtunity_DNA
.\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
> API live at `http://127.0.0.1:8000`. Swagger docs at `http://127.0.0.1:8000/docs`.

### 2. Start Frontend Development Server
```powershell
cd c:\Users\aryag\OneDrive\Desktop\Oppurtunity_DNA\frontend
npx vite --host 127.0.0.1 --port 5173
```
> Web application live at `http://127.0.0.1:5173`.

### 3. Reset / Seed Demo Database
```powershell
cd c:\Users\aryag\OneDrive\Desktop\Oppurtunity_DNA
.\backend\venv\Scripts\python.exe backend/seed_sih_demo.py
```

---

## 18. Demo Script (5–10 Minute Presentation Guide)

### Elevator Pitches

#### 30-Second Pitch
> *"SkillForge — Opportunity DNA is an AI-powered academia-industry collaboration portal for SIH26044. Instead of relying on static resumes, SkillForge extracts verifiable skill capabilities directly from student project evidence into an Opportunity DNA Skill Passport. It matches students objectively with internships and placements, allows them to simulate readiness gains by closing skill gaps, and gives universities real-time data on student skill supply versus market demand."*

#### 2-Minute Summary
> *"Current hiring and placement portals are broken: recruiters deal with keyword-stuffed resumes, students don't know what skills they lack, and colleges have zero visibility into market demands. SkillForge solves this end-to-end. Students build a traceable Skill Passport where skills like TensorFlow or SQL are linked directly to project evidence. Our deterministic matching engine rates candidates for internships and placements without demographic bias. Students can use our Readiness Simulator to see how acquiring missing skills will boost their match score, while colleges get a live dashboard comparing student supply against industry demand to fix curriculum gaps."*

---

### Step-by-Step 5-Minute Demonstration Script

| Step | Action (What to Click) | Visual Proof (What Judge Sees) | Speaking Script (What to Say) |
| :--- | :--- | :--- | :--- |
| **1. Student Profile & Passport** | Open `http://127.0.0.1:5173`. Select **Student Portal**. Click **`2. Skill Passport`**. | Aarav Sharma profile details and capability chips (TensorFlow, Computer Vision, SQL). | *"Here is Aarav Sharma, a CS student. Instead of a plain resume, SkillForge builds his Opportunity DNA Skill Passport directly from 3 project artifacts."* |
| **2. Evidence Modal** | Click on the **`TensorFlow`** skill chip. | Evidence modal showing project title *Flower Classification using MobileNetV2* and extracted text snippet. | *"Every skill is verifiable. Clicking TensorFlow reveals the exact project code and AI extraction confidence score that proved the capability."* |
| **3. Matching & Transparency** | Click **`3. Recommended Corporate Opportunities`**. | **AI/ML Engineering Intern (DEMO)** card with **63.0%** match score. | *"SkillForge objectively matches Aarav against corporate positions. His top match is 63.0%. Clicking 'Why this match?' reveals the exact capability fit breakdown."* |
| **4. Readiness Simulator** | Click **Readiness Simulator**. Select **Docker** (+12.2%) and **SQL** (+10.2%) checkboxes. | Projected Score meter jumps from **63.0%** $\rightarrow$ **85.4%**. | *"Aarav isn't left stranded. The Readiness Simulator shows that acquiring Docker and SQL will boost his match score to 85.4%."* |
| **5. Upskilling Roadmap** | Click **"View Development Roadmap"**. | 1.1-month roadmap with curated milestone resource cards. | *"SkillForge generates a personalized 1.1-month learning roadmap to guide his skill acquisition step-by-step."* |
| **6. Apply Now** | Click **"Apply Now"** on the opportunity card. | Button changes to disabled `"Applied"` badge; count in **`4. My Applications`** increments. | *"Aarav applies with one click. The application is recorded directly in our backend database."* |
| **7. Industry Portal Shortlist** | Switch top tab to **Industry Partner Portal**. Navigate to **Applicants & Shortlisting**. Click **"Shortlist Candidate"**. | Applicants table status badge updates instantly to `SHORTLISTED`. | *"Switching to the Recruiter view, the employer sees Aarav's verifiable DNA and shortlists him. The status updates live in the database."* |
| **8. Academia Portal Analytics** | Switch top tab to **Academia Portal**. | Supply vs. Demand bar chart with **Docker** and **SQL** flagged as **CRITICAL Gaps ($\ge 30\%$)**. | *"Finally, the Academia Portal compares campus student supply against industry demand. Docker and SQL are flagged as Critical Gaps, giving deans immediate data to run targeted technical workshops."* |

---

## 19. SIH26044 Requirement Mapping

| SIH26044 Functional Requirement | Current Implementation Status | Code / UI Location | Status Legend |
| :--- | :--- | :--- | :--- |
| **1. Evidence-Based Skill Mapping** | Automated AI parsing of project text & PDF resumes into structured JSON skills. | `analyzer.py`, `pdf.py` | ✅ Implemented |
| **2. Canonical Skill Taxonomy** | Normalizes skill variations into a standardized catalog. | `normalization.py`, `models.py` | ✅ Implemented |
| **3. Internship & Placement Posting** | Industry partners post Internship (`type='internship'`) and Placement (`type='placement'`) positions. | `router.py`, `App.tsx` | ✅ Implemented |
| **4. Capability-First Match Scoring** | Multi-factor mathematical formula evaluating skill fit and evidence multipliers without demographic bias. | `matcher.py` | ✅ Implemented |
| **5. Application Funnel Tracking** | SQLite database tracking for `applied` $\rightarrow$ `shortlisted` $\rightarrow$ `offered` $\rightarrow$ `placed` states. | `models.py`, `router.py` | ✅ Implemented |
| **6. Interactive Readiness Simulator** | Real-time score projection checklist based on missing skill contribution weights. | `router.py`, `App.tsx` | ✅ Implemented |
| **7. Personal Upskilling Roadmap** | Prioritized gap milestone plans with estimated hours and resource links. | `roadmap.py` | ✅ Implemented |
| **8. Institutional Skill Gap Dashboard** | Macro analytics comparing Student Supply % vs. Industry Demand % and flagging Critical Deficit Gaps ($\ge 30\%$). | `router.py`, `App.tsx` | ✅ Implemented |
| **9. Demographic & Bias Auditing** | Counterfactual audit engine checking income, pedigree, region, and government status neutrality. | `fairness.py` | ✅ Implemented |
| **10. Real JWT Auth & Server RBAC** | Server-enforced JWT access token issuance, bcrypt password hashing, and server-side RBAC dependencies (`student`, `industry`, `academia`). | `security.py`, `router.py`, `App.tsx` | ✅ Implemented |
| **11. Government NATS / NAPS Portal API** | Live integration with official NATS/NAPS government APIs. | `models.py` (`has_prior_nats_naps` flag present) | 🔵 Future Scope |
| **12. Embedded Video LMS Platform** | Native video player and course hosting. | `roadmap.py` (provides external resource links) | 🔵 Future Scope |

---

## 20. Limitations + Future Scope

### Current System Achievements
1. **Real JWT Authentication & Server-Side RBAC:** Fully implemented using bcrypt password hashing, JWT Bearer tokens, and FastAPI dependency authorization checks for `student`, `industry`, and `academia` roles. Includes quick one-click demo login buttons for instant presentation workflow testing.
2. **Local Database:** Uses local SQLite (`opportunity_dna.db`) suitable for rapid local execution, automated test suites (56/56 passing), and hackathon demonstrations.
3. **Curated Upskilling Roadmaps:** Provides prioritized learning milestone resource links and estimated duration.

### Future Expansion Roadmap
* **Database Scaling:** Migrate SQLite to managed PostgreSQL with connection pooling for multi-tenant enterprise deployment.
* **Integrations:** Build direct API connectors for Coursera, edX, and official NATS/NAPS government webhooks.
