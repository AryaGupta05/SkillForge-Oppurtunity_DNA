import json
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.app.models import models
from backend.app.schemas import schemas

# Helper to map proficiency string to integer values
PROFICIENCY_MAP = {
    "beginner": 1,
    "intermediate": 2,
    "expert": 3
}

def get_proficiency_val(level_str: str) -> int:
    if not level_str:
        return 2  # default to intermediate
    cleaned = level_str.strip().lower()
    return PROFICIENCY_MAP.get(cleaned, 2)

def get_proficiency_multiplier(level_str: str) -> float:
    cleaned = (level_str or "").strip().lower()
    if cleaned == "beginner":
        return 0.5
    elif cleaned == "expert":
        return 1.0
    return 0.8  # Intermediate / default

class MatchingEngine:
    @staticmethod
    def calculate_match(db: Session, candidate: models.Candidate, opportunity: models.Opportunity, mode: str = "skills_first") -> schemas.CandidateMatchResultOut:
        """
        Calculates a deterministic matching score and explanation details between 
        a Candidate and an Opportunity.
        """
        req_skills = opportunity.required_skills
        if not req_skills:
            return schemas.CandidateMatchResultOut(
                rank=1,
                candidate_id=candidate.id,
                candidate_name=candidate.name,
                overall_score=0.0,
                strengths=[],
                gaps=[],
                evidence_strength=0.0,
                skills_breakdown=[]
            )

        skills_breakdown = []
        total_weight = 0.0
        weighted_score_sum = 0.0
        
        strengths = []
        gaps = []
        total_evidence_strength = 0.0
        matching_count = 0

        # Create a lookup for candidate skills
        cand_skills_map = {cs.skill_id: cs for cs in candidate.skills}

        for os in req_skills:
            importance = os.importance or 1.0
            total_weight += (importance * 1.2)  # Max weight contribution with 1.2x evidence multiplier
            
            cs = cand_skills_map.get(os.skill_id)
            if cs:
                matching_count += 1
                total_evidence_strength += cs.evidence_strength
                
                # 1. Proficiency Multipliers
                cand_val = get_proficiency_val(cs.proficiency)
                req_val = get_proficiency_val(os.required_level)
                
                if cand_val >= req_val:
                    prof_match_factor = 1.0
                else:
                    prof_match_factor = 0.5 + 0.5 * (cand_val / req_val)

                # 2. Adjacent/Explicit Type Factors
                type_factor = 0.8 if cs.skill_type == "adjacent" else 1.0
                
                # 3. Evidence Factor (min: 0.6, max: 1.2)
                evidence_factor = min(1.2, 0.6 + 0.2 * cs.evidence_strength)
                
                # 4. Capability Contribution
                capability = cs.confidence * prof_match_factor
                contribution = capability * importance * evidence_factor * type_factor
                weighted_score_sum += contribution

                # 5. Classify Match Status
                if cs.evidence_strength >= 1.5 and cand_val >= req_val and cs.confidence >= 0.8:
                    status = "Strong match"
                    strengths.append(f"{os.skill.name} - strong evidence ({cs.proficiency})")
                elif cand_val >= req_val:
                    status = "Match"
                else:
                    status = "Partial match"
                    gaps.append(f"{os.skill.name} - partial capability ({cs.proficiency})")

                # Fetch trace links in SkillEvidence
                evidence_links = db.query(models.SkillEvidence).filter(
                    models.SkillEvidence.candidate_skill_id == cs.id
                ).all()
                
                evidence_responses = []
                for link in evidence_links:
                    if link.evidence:
                        evidence_responses.append(
                            schemas.EvidenceResponse.model_validate(link.evidence)
                        )

                skills_breakdown.append(
                    schemas.SkillMatchDetail(
                        name=os.skill.name,
                        category=os.skill.category or "Other",
                        requirement_type=os.requirement_type or "required",
                        required_level=os.required_level or "Intermediate",
                        candidate_level=cs.proficiency,
                        match_status=status,
                        contribution=round(contribution, 2),
                        confidence=cs.confidence,
                        evidence=evidence_responses
                    )
                )
            else:
                # Skill is missing from candidate profile
                status = "Skill gap" if os.requirement_type == "required" else "No evidence"
                
                if status == "Skill gap":
                    gaps.append(f"{os.skill.name} - core skill gap")
                else:
                    gaps.append(f"{os.skill.name} - no preferred evidence")

                skills_breakdown.append(
                    schemas.SkillMatchDetail(
                        name=os.skill.name,
                        category=os.skill.category or "Other",
                        requirement_type=os.requirement_type or "required",
                        required_level=os.required_level or "Intermediate",
                        candidate_level=None,
                        match_status=status,
                        contribution=0.0,
                        confidence=0.0,
                        evidence=[]
                    )
                )

        # Compute raw percentage
        raw_score = (weighted_score_sum / total_weight) * 100 if total_weight > 0 else 0.0
        final_score = round(min(100.0, raw_score), 1)

        # Apply transparent, small preference scoring factors for eligibility/preferences
        preference_bonus = 0.0
        
        # 1. Location Preference Match
        if candidate.preferred_location and opportunity.location:
            if candidate.preferred_location.strip().lower() == opportunity.location.strip().lower():
                preference_bonus += 2.0
                strengths.append(f"Preferred Location Match ({opportunity.location})")
                
        # 2. Sector Preference Match
        if candidate.preferred_sector and opportunity.sector:
            if candidate.preferred_sector.strip().lower() == opportunity.sector.strip().lower():
                preference_bonus += 2.0
                strengths.append(f"Preferred Sector Match ({opportunity.sector})")
                
        # 3. Stream Compatibility Match
        if candidate.qualification_stream and opportunity.allowed_streams:
            allowed = [s.strip().lower() for s in opportunity.allowed_streams.split(",")]
            cand_stream = candidate.qualification_stream.strip().lower()
            stream_matched = any(a in cand_stream or cand_stream in a for a in allowed)
            if stream_matched:
                preference_bonus += 1.0
                strengths.append(f"Eligible Education Stream Match ({candidate.qualification_stream})")
            else:
                gaps.append(f"Education Stream Mismatch (Required: {opportunity.allowed_streams}, Candidate: {candidate.qualification_stream})")

        final_score = round(min(100.0, final_score + preference_bonus), 1)

        # legacy "NORMAL" matching mode simulation: Introduces credential/gap penalties (for audit comparison only)
        if mode == "normal":
            if candidate.career_gap_info:
                final_score -= 15.0
            inst = (candidate.institution or "").lower()
            prestigious = ["stanford", "harvard", "mit", "oxford", "cambridge", "caltech", "berkeley"]
            has_pedigree = any(p in inst for p in prestigious)
            if not has_pedigree and candidate.institution:
                final_score -= 10.0
            loc = (candidate.location or "").lower()
            job_loc = (opportunity.description or "").lower()
            if "seattle" in job_loc and "seattle" not in loc:
                final_score -= 5.0
            final_score = round(max(0.0, final_score), 1)

        avg_evidence_strength = round(total_evidence_strength / matching_count, 2) if matching_count > 0 else 0.0

        return schemas.CandidateMatchResultOut(
            rank=1,  # will be set dynamically by parent comparison lists
            candidate_id=candidate.id,
            candidate_name=candidate.name,
            overall_score=final_score,
            strengths=strengths[:4],  # limit to top 4 strengths
            gaps=gaps[:3],            # limit to top 3 gaps
            evidence_strength=avg_evidence_strength,
            skills_breakdown=skills_breakdown,
            review_status="AI recommendation for human review"
        )
