import math
import logging
from sqlalchemy.orm import Session
from typing import List, Set
from backend.app.models import models
from backend.app.schemas import schemas

logger = logging.getLogger(__name__)

class DNACalculator:
    @staticmethod
    def get_source_confidence(ev: models.Evidence) -> float:
        """
        Determines the default confidence score of an evidence record 
        based on its source reliability parameters.
        """
        source = (ev.source or "").lower()
        ev_type = (ev.type or "").lower()
        
        if ev_type == "assessment":
            return 1.0
        elif source == "github" or ev_type == "github":
            return 0.90
        elif source == "upload" or ev_type == "resume":
            return 0.80
        elif ev_type in ["certification", "hackathon"]:
            return 0.85
        return 0.70

    @classmethod
    def calculate_profile_dna(cls, candidate: models.Candidate, db: Session) -> schemas.CapabilitySignalsOut:
        """
        Aggregates candidate skills and evidence to calculate evidence-backed 
        capability signals (Depth, Breadth, Adaptability, Progression, and Strength).
        """
        evidences = candidate.evidence
        cand_skills = candidate.skills
        
        # 1. Evidence Strength
        if not evidences:
            evidence_strength = 0.0
        else:
            total_confidence = sum(cls.get_source_confidence(ev) for ev in evidences)
            avg_confidence = total_confidence / len(evidences)
            # Logarithmic quantity boost, capped at 5.0
            quantity_boost = 0.8 * math.log(1 + len(evidences))
            evidence_strength = round(min(5.0, avg_confidence + quantity_boost), 2)

        # 2. Skill Depth
        # Average core skill confidence weighted by evidence strength
        if not cand_skills:
            depth = 0.0
        else:
            total_depth = sum(cs.confidence * cs.evidence_strength for cs in cand_skills)
            # Scale to 0.0 - 1.0 range
            depth = round(min(1.0, total_depth / (len(cand_skills) * 1.5)), 2)

        # 3. Skill Breadth
        # Measure diversity across core tech categories in the catalog
        if not cand_skills:
            breadth = 0.0
        else:
            unique_categories = set(cs.skill.category for cs in cand_skills if cs.skill)
            # Benchmark 5 categories as full breadth (100%)
            breadth = round(min(1.0, len(unique_categories) / 5.0), 2)

        # 4. Adaptability
        # Measures project variety (types) and tech domain diversity
        if not evidences and not cand_skills:
            adaptability = 0.0
        else:
            unique_types = set(ev.type for ev in evidences)
            unique_categories = set(cs.skill.category for cs in cand_skills if cs.skill)
            # Combined score
            adaptability = round(min(1.0, (len(unique_types) * 0.15) + (len(unique_categories) * 0.10)), 2)

        # 5. Learning Progression
        # Chronological evidence analysis
        timeline_years: List[int] = []
        for ev in evidences:
            if ev.date:
                timeline_years.append(ev.date.year)
        
        timeline_years = sorted(list(set(timeline_years)))
        
        if len(timeline_years) >= 2 and (max(timeline_years) - min(timeline_years)) >= 1:
            status = "sufficient_evidence"
            year_span = max(timeline_years) - min(timeline_years)
            score = round(min(1.0, 0.4 + (year_span * 0.2) + (len(evidences) * 0.05)), 2)
            description = (
                f"Demonstrated capability progression from {min(timeline_years)} to {max(timeline_years)} "
                f"across {len(evidences)} structured evidence entries."
            )
        else:
            status = "insufficient_evidence"
            score = 0.0
            if not timeline_years:
                description = "Insufficient chronological evidence. Timeline dates are missing."
            else:
                description = "Timeline spans less than 12 months. Progression requires longitudinal evidence."
                
        progression_signal = schemas.LearningProgressionSignal(
            status=status,
            timeline=timeline_years,
            description=description,
            score=score
        )

        return schemas.CapabilitySignalsOut(
            depth=depth,
            breadth=breadth,
            learning_progression=progression_signal,
            adaptability=adaptability,
            evidence_strength=evidence_strength
        )
