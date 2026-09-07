# Opportunity DNA - System Architecture

This document describes the high-level architecture of the Opportunity DNA MVP.

## System Flow

```
Candidate Evidence (Resume PDF, GitHub repo url, Hackathons, Portfolios)
    │
    ▼
[Evidence Extraction] (PyMuPDF parser, GitHub repository sync engine)
    │
    ▼
[Skill Discovery] (LLM service: maps raw text/code signals to capabilities)
    │
    ▼
[Opportunity DNA Profile] (Demonstrated, Inferred, and Adjacent Skills + Confidence & Signals)
    │
    ▼
[Candidate-Job Matching] (Skills-first matcher matching against Opportunity Skills)
    │
    ▼
[Bias Auditor] (Runs counterfactual ranking on anonymized vs. non-anonymized candidate profiles)
    │
    ▼
[Human-in-the-Loop Review] (Recruiter dashboard displaying matching recommendations and auditable evidence)
```

## Backend Services

1. **Database Service**: SQLAlchemy integration supporting local SQLite (`sqlite:///./opportunity_dna.db`) and PostgreSQL.
2. **AI / LLM Service**: Abstraction class supporting OpenAI and Gemini client execution, driven by `.env` configuration.
3. **PDF Parse Service**: Parses resume files and extracts structured metadata.
4. **GitHub Fetch Service**: Pulls repository statistics (languages, descriptions, stars, activity) for candidate evidence.
