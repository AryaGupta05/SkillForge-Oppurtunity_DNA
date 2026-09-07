# 23 — Demo Data

## Overview

All demo data in SkillForge is seeded via `backend/seed_sih_demo.py`. The seed script is completely **idempotent**, allowing developers and presenters to reset the database state cleanly at any time.

> **CRITICAL PRIVACY GUARANTEE:** All candidates, email addresses, and project descriptions in the seed dataset are 100% fictional. No real personal resumes or non-public personal data exist in the repository.

---

## 1. Canonical Fictional Demo Candidates

```mermaid
flowchart TD
    subgraph Candidate 1: Strong AI/ML Profile
        C1[Aarav Sharma - ID #7]
        C1 --> C1_EMAIL[aarav.sharma.demo@example.com]
        C1 --> C1_DEG[B.Tech Computer Science & Engineering - Delhi Institute of Tech]
        C1 --> E1[Project 1: Flower Classification MobileNetV2]
        C1 --> E2[Project 2: AI Chatbot Ollama/Mistral]
        C1 --> E3[Project 3: Campus Web Portal Java/MySQL]
    end

    subgraph Candidate 2: Commerce / Generalist Profile
        C2[Priya Patel - ID #6]
        C2 --> C2_EMAIL[priya.patel.demo@opportunity-dna.in]
        C2 --> C2_DEG[B.Com Commerce & Business - Mumbai College of Commerce]
        C2 --> E4[Project 1: Student Budget Tracker Web App]
        C2 --> E5[Project 2: Excel Data Analysis for Small Business]
    end
```

---

## 2. Seeded Corporate Opportunities (6 Positions)

| Opportunity Title | Hiring Company | Sector | Type | Monthly Compensation | Duration | Target Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AI/ML Engineering Intern (DEMO)** | Bharat AI Innovations | IT & Software | `INTERNSHIP` | ₹18,000 / mo | 6 mos | New Delhi |
| **Data Science & Analytics Intern (DEMO)** | GovTech Analytics India | IT & Software | `INTERNSHIP` | ₹15,000 / mo | 6 mos | New Delhi |
| **Enterprise Software Developer Intern (DEMO)** | National Digital Infra | IT & Software | `INTERNSHIP` | ₹16,000 / mo | 6 mos | Bengaluru |
| **Frontend Web Experience Intern (DEMO)** | InnoDesign Digital Studio | IT & Software | `INTERNSHIP` | ₹14,000 / mo | 6 mos | Mumbai |
| **Cloud Infrastructure & DevOps Intern (DEMO)** | Sahaj Cloud Systems | IT & Software | `INTERNSHIP` | ₹17,000 / mo | 6 mos | Hyderabad |
| **Junior Business Analyst (DEMO)** | FinServ Analytics | Finance & Banking | `PLACEMENT` | ₹25,000 / mo | 12 mos | Mumbai |

---

## 3. How to Reset / Reseed Demo Data

To reset the database to a clean initial state:

```powershell
Set-Location "c:\Users\aryag\OneDrive\Desktop\Oppurtunity_DNA"
.\backend\venv\Scripts\python.exe backend/seed_sih_demo.py
```
