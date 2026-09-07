# 19 — Fairness and Responsible AI

## Overview

The **Fairness and Responsible AI Engine** (`backend/app/services/fairness.py`) ensures that candidate evaluation, matching, and recommendation are strictly merit-based and free from demographic, geographic, or socio-economic bias.

---

## 1. What is Audited: Counterfactual Fairness Analysis

SkillForge implements **Counterfactual Fairness Auditing**. 

A matching algorithm is defined as counterfactually fair if a candidate's calculated match score remains unchanged when their socio-economic or demographic attributes are altered while holding their technical capability skills constant:

$$\text{Score}(\text{Candidate}_{\text{Original}}) = \text{Score}(\text{Candidate}_{\text{Counterfactual}})$$

```mermaid
flowchart LR
    subgraph Original Profile
        A1[Aarav Sharma - B.Tech CSE]
        A2[Income: ₹3,20,000 | Region: Tier-2]
        A3[Skills: Python, ML, TensorFlow]
    end

    subgraph Counterfactual Profile
        B1[Counterfactual Candidate]
        B2[Income: ₹25,000,000 | Region: Tier-1 Elite]
        B3[Skills: Python, ML, TensorFlow]
    end

    A3 & B3 -->|Deterministic Match Engine| SCORE[Match Score: 63.0%]
    SCORE --> RESULT[Fairness Audit Result: 0.0% Score Variance - PASSED]
```

---

## 2. Tested Demographics & Guaranteed Protections

The `FairnessAuditService` continuously tests candidate matching across four demographic dimensions:

1. **Family Annual Income:** Evaluates score variance across low-income ($\le$ ₹3.2 Lakh) vs. high-income ($\ge$ ₹25 Lakh) candidates.
2. **Institutional Pedigree:** Evaluates score variance between non-elite state colleges vs. elite Tier-1 institutions.
3. **Geographic Location:** Evaluates score variance across Tier-3 rural locations vs. Tier-1 metros.
4. **Government Employment Status:** Evaluates score variance across government vs. non-government family backgrounds.

---

## 3. What the System Guarantees vs. What it Cannot Guarantee

| Guarantee Dimension | System Status | Technical Explanation |
| :--- | :--- | :--- |
| **Formula Neutrality** | ✅ Guaranteed | Socio-economic variables are excluded from `matcher.py` capability scoring formulas. |
| **Pedigree Independence** | ✅ Guaranteed | Candidates from non-elite institutions receive identical match scores for identical skills. |
| **Audit Transparency** | ✅ Guaranteed | Recruiters can view group bias audit summaries (`GET /api/bias-audit/{opp_id}`) for candidate pools. |
| **Human Recruiter Bias** | 🔵 Cannot Guarantee | Recruiter hiring decisions outside SkillForge cannot be controlled; SkillForge mitigates this by highlighting verifiable Skill DNA profiles. |
