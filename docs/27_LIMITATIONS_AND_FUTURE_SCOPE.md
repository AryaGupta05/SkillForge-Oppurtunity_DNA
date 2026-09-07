# 27 — Limitations and Future Scope

## Overview

While **SkillForge — Opportunity DNA** provides a complete, verified implementation for SIH Problem Statement #26044, certain production enterprise features are marked as **Future Scope** to ensure transparency.

---

## 1. Current Limitations

1. **Workspace Role Selection:** Role switching between Student, Industry, and Academia portals currently relies on interactive UI workspace tabs (`App.tsx`) rather than server-enforced OAuth2 / JWT authentication.
2. **Local Database Engine:** The system uses SQLite (`opportunity_dna.db`), which is ideal for single-instance local execution and live hackathon demonstrations, but requires migration to PostgreSQL for high-concurrency production scale.
3. **External Course Integration:** The Upskilling Roadmap provides curated resource titles and external links; auto-enrollment APIs for platforms like Coursera, edX, or NPTEL are not integrated.
4. **Third-Party Government Portal Sync:** Integration with official MCA / NATS / NAPS portal APIs (`pminternship.mca.gov.in`) is simulated via pre-check rules; live REST API webhooks do not exist.

---

## 2. Planned Future Enhancements (Roadmap)

```mermaid
flowchart TD
    subgraph Phase 1: Security & Identity (Q3)
        A1[OAuth2 / OIDC Authentication] --> A2[JWT Role-Based Access Control]
        A2 --> A3[PostgreSQL Database Scaling]
    end

    subgraph Phase 2: Platform Integrations (Q4)
        B1[Coursera / edX LMS Auto-Enrollment API] --> B2[GitHub OAuth & Direct Repo Parsing]
        B2 --> B3[Government NATS / NAPS Portal Webhooks]
    end

    subgraph Phase 3: Advanced AI & Mobile (Q1)
        C1[Multi-Modal Project Video Analysis] --> C2[Mobile App - React Native]
        C2 --> C3[Automated Interview Scheduling Engine]
    end
```

### Future Scope Details:
* **Production Authentication & Security:** Implement OAuth2 authentication with JWT token verification and server-side RBAC authorization middleware.
* **Database Scaling:** Migrate from local SQLite to managed PostgreSQL with connection pooling and automated daily backups.
* **LMS Auto-Enrollment:** Build REST API connectors for major LMS platforms to track student course completion automatically.
* **Direct GitHub Integration:** Extend `github.py` to clone public repositories directly and parse `README.md` and source code ASTs automatically.
