# 26 — SIH26044 Requirement Mapping

## Comprehensive SIH26044 Compliance Matrix

This matrix maps every requirement specified in **SIH Problem Statement #26044** (*"Portal for Academia - Industry collaboration for Skill Mapping, Internships and Placement"*) directly to its implementation in **SkillForge — Opportunity DNA**.

| SIH26044 Functional Requirement | Current Implementation Status | Code / UI Location | Status Legend |
| :--- | :--- | :--- | :--- |
| **1. Evidence-Based Skill Extraction** | Automated AI parsing of project text & PDF resumes into structured JSON skills with confidence ratings. | `backend/app/services/analyzer.py`<br>`backend/app/services/pdf.py` | ✅ Implemented |
| **2. Canonical Skill Mapping** | Normalizes raw skill variations into a standardized taxonomy catalog. | `backend/app/services/normalization.py`<br>`backend/app/models/models.py` | ✅ Implemented |
| **3. Corporate Opportunity Management** | Industry partners can post structured Internship (`type='internship'`) and Placement (`type='placement'`) positions. | `backend/app/api/router.py`<br>`frontend/src/App.tsx` | ✅ Implemented |
| **4. Capability-First Match Scoring** | Multi-factor mathematical formula evaluating skill fit, proficiency depth, and evidence multipliers without demographic bias. | `backend/app/services/matcher.py` | ✅ Implemented |
| **5. Application Lifecycle & Funnel** | Real SQLite database tracking for `applied` $\rightarrow$ `shortlisted` $\rightarrow$ `offered` $\rightarrow$ `placed` states. | `backend/app/models/models.py`<br>`backend/app/api/router.py` | ✅ Implemented |
| **6. Interactive Readiness Simulator** | Real-time score projection checklist based on missing skill contribution weights. | `backend/app/api/router.py`<br>`frontend/src/App.tsx` | ✅ Implemented |
| **7. Personal Upskilling Roadmap** | Prioritized gap milestone plans with estimated preparation hours and learning resource links. | `backend/app/services/roadmap.py` | ✅ Implemented |
| **8. Institutional Skill Gap Dashboard** | Macro analytics comparing Student Supply % vs. Industry Demand % and flagging Critical Deficit Gaps ($\ge 30\%$). | `backend/app/api/router.py`<br>`frontend/src/App.tsx` | ✅ Implemented |
| **9. Demographic & Bias Auditing** | Counterfactual audit engine checking income, pedigree, region, and government background score neutrality. | `backend/app/services/fairness.py` | ✅ Implemented |
| **10. Government NATS / NAPS Portal API** | Live integration with NATS/NAPS government database APIs. | `backend/app/models/models.py` (`has_prior_nats_naps` boolean flag present) | 🔵 Future Scope |
| **11. Embedded Video LMS Platform** | Native video player and course hosting directly within the portal. | `roadmap.py` (provides curated external resource links) | 🔵 Future Scope |
| **12. Production OAuth2 / JWT Security** | Multi-tenant OAuth2 server authentication with JWT role claims. | `frontend/src/App.tsx` (currently uses UI role workspace selector) | 🔵 Future Scope |
