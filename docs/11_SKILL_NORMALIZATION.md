# 11 — Skill Normalization

## Overview

In real-world resumes and project descriptions, candidates and recruiters refer to the same skill using different abbreviations, typos, or naming conventions (e.g., *"ML"*, *"Machine Learning"*, *"Machine-Learning"*). 

Without normalization, matching engines treat these variations as separate skills, resulting in fragmented candidate profiles and inaccurate match scores.

**SkillForge — Opportunity DNA** uses a deterministic canonical mapping service (`normalization.py`) to collapse skill variations into standardized catalog records.

---

## 1. Canonical Skill Taxonomy Mapping (`normalization.py`)

The `SkillNormalizer` class maintains a dictionary mapping raw string aliases to canonical skill names:

```python
SKILL_ALIASES = {
    # Data Science & Machine Learning
    "ml": "Machine Learning",
    "applied ml": "Machine Learning",
    "machine-learning": "Machine Learning",
    "tf": "TensorFlow",
    "tensorflow 2.0": "TensorFlow",
    "keras": "TensorFlow",
    "cv": "Computer Vision",
    "nlp": "Natural Language Processing (NLP)",
    
    # Backend & Database
    "py": "Python",
    "python3": "Python",
    "js": "JavaScript",
    "es6": "JavaScript",
    "ts": "TypeScript",
    "postgres": "SQL",
    "postgresql": "SQL",
    "mysql": "MySQL",
    
    # Web & DevOps
    "reactjs": "React",
    "react.js": "React",
    "docker containers": "Docker",
    "k8s": "Kubernetes",
    "amazon web services": "AWS"
}
```

---

## 2. The Normalization Workflow

```
[Raw Extracted Skill String: "reactjs"]
                 ↓
[Convert to lower-case & strip whitespace: "reactjs"]
                 ↓
[Lookup in SKILL_ALIASES map -> Returns "React"]
                 ↓
[Query database for canonical Skill record named "React"]
                 ↓
[Link CandidateSkill / OpportunitySkill to Canonical Skill ID]
```

---

## 3. Benefits of Deterministic Normalization

1. **Prevents Profile Fragmentation:** Guarantees that a student listing *"k8s"* in a project gets credited for the industry requirement *"Kubernetes"*.
2. **Standardized Analytics:** Enables the Academia Portal to aggregate student supply and industry demand accurately across uniform skill categories.
3. **Reproducible Matching:** Ensures that candidate-opportunity match calculations are 100% consistent regardless of minor syntax variations.
