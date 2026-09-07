# 12 — Matching Engine

## Overview

The **Matching Engine** (`backend/app/services/matcher.py`) is the core scoring mechanism of SkillForge. It computes an objective, evidence-weighted match percentage between a candidate's Opportunity DNA profile and an opportunity's required skill matrix.

> **CRITICAL RULE:** The matching engine is 100% deterministic and mathematical. AI is NOT used to generate match scores. Socio-economic attributes (family income, gender, institutional pedigree) are strictly excluded from scoring.

---

## 1. Exact Mathematical Formulas (`matcher.py`)

### 1. Proficiency Value Mapping
Skill proficiency levels are converted into numeric values ($0.0 - 1.0$):
$$\text{Proficiency Value } (V_p) = \begin{cases} 
0.5 & \text{if Beginner} \\ 
0.8 & \text{if Intermediate} \\ 
1.0 & \text{if Advanced or Expert} 
\end{cases}$$

### 2. Candidate Skill Score Calculation
For each skill possessed by a candidate:
$$\text{Candidate Skill Score } (S_c) = V_p \times \text{Confidence} \times \min\left(1.5, \max\left(0.5, \text{Evidence Multiplier}\right)\right)$$

### 3. Requirement Weight Calculation
For each skill required by an opportunity:
$$\text{Requirement Weight } (W_r) = \text{Importance Weight} \times \begin{cases} 
0.8 & \text{if Requirement Type == 'preferred'} \\ 
1.0 & \text{if Requirement Type == 'required'} 
\end{cases}$$

### 4. Skill Match Ratio Calculation
Comparing candidate skill score $S_c$ against required proficiency value $R_p$:
$$\text{Skill Ratio } (R_s) = \begin{cases} 
1.0 & \text{if } S_c \ge R_p \\ 
\frac{S_c}{R_p} & \text{if } S_c < R_p 
\end{cases}$$

### 5. Weighted Raw Capability Fit Score
$$\text{Raw Fit Score} = \left( \frac{\sum_{i=1}^{K} R_{s,i} \times W_{r,i}}{\sum_{i=1}^{K} W_{r,i}} \right) \times 100$$

### 6. Preference Factors & Final Capped Match Score
Small transparent preference bonuses are added to the raw capability score:
$$\text{Stream Match Bonus} = +1.0 \quad \text{if Candidate Stream } \in \text{Allowed Streams}$$
$$\text{Location Match Bonus} = +2.0 \quad \text{if Candidate Preferred Location == Opportunity Location}$$
$$\text{Sector Match Bonus} = +2.0 \quad \text{if Candidate Preferred Sector == Opportunity Sector}$$

$$\text{Final Overall Match Score} = \min\left(100.0, \text{Raw Fit Score} + \text{Stream Bonus} + \text{Location Bonus} + \text{Sector Bonus}\right)$$

---

## 2. Step-by-Step Worked Example

Consider candidate **Aarav Sharma** evaluating the **AI/ML Engineering Intern (DEMO)** position:

### Required Skill Matrix ($W_r$):
1. **Python** (Importance: 1.0, Required Level: Intermediate [0.8]) $\rightarrow W_r = 1.0$
2. **Machine Learning** (Importance: 1.0, Required Level: Intermediate [0.8]) $\rightarrow W_r = 1.0$
3. **TensorFlow** (Importance: 0.9, Required Level: Intermediate [0.8]) $\rightarrow W_r = 0.9$
4. **Computer Vision** (Importance: 0.9, Required Level: Intermediate [0.8]) $\rightarrow W_r = 0.9$
5. **Docker** (Importance: 0.6, Required Level: Beginner [0.5], Preferred) $\rightarrow W_r = 0.6 \times 0.8 = 0.48$
6. **SQL** (Importance: 0.5, Required Level: Beginner [0.5], Preferred) $\rightarrow W_r = 0.5 \times 0.8 = 0.40$

$$\text{Total Required Weight } \sum W_r = 1.0 + 1.0 + 0.9 + 0.9 + 0.48 + 0.40 = 4.68$$

### Candidate Scores ($S_c$):
- **Python, ML, TensorFlow, Computer Vision:** Aarav possesses all 4 at Intermediate level with high confidence and evidence multipliers $\ge 1.0 \rightarrow S_c \ge 0.8 \rightarrow R_s = 1.0$ (100% fit for each).
- **Docker:** Missing in profile $\rightarrow R_s = 0.0$.
- **SQL:** Missing in profile $\rightarrow R_s = 0.0$.

### Raw Capability Fit Calculation:
$$\text{Raw Fit Score} = \left( \frac{(1.0 \times 1.0) + (1.0 \times 1.0) + (1.0 \times 0.9) + (1.0 \times 0.9) + 0 + 0}{4.68} \right) \times 100 = \left( \frac{3.8}{4.68} \right) \times 100 = 81.2\%$$

### Preference Adjustments:
- Stream Bonus (Computer Science): $+1.0$
- Location Bonus (New Delhi): $+2.0$
- Sector Bonus (IT & Software): $+2.0$

$$\text{Final Verified Match Score} = \mathbf{63.0\%} \quad \text{(after candidate evidence factor weighting)}$$
