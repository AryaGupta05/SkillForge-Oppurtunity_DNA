import logging
import json
from sqlalchemy.orm import Session

from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.services.matcher import MatchingEngine
from backend.app.services.llm import get_llm_service

logger = logging.getLogger(__name__)

class FairnessEngine:
    @staticmethod
    def get_blind_candidate(candidate: models.Candidate) -> models.Candidate:
        """
        Creates a decoupled, capability-only copy of the Candidate profile 
        where all credential pedigree and demographic proxies are masked/deleted.
        """
        # We copy skills and evidence list references but strip demographics
        return models.Candidate(
            id=candidate.id,
            name=candidate.name,
            email=candidate.email,
            location=None,
            institution=None,
            gender=None,
            age=None,
            career_gap_info=None,
            github_url=candidate.github_url,
            skills=candidate.skills,
            evidence=candidate.evidence,
            assessments=candidate.assessments
        )

    @staticmethod
    def generate_counterfactual_variant(candidate: models.Candidate, attribute: str, new_value: str) -> models.Candidate:
        """
        Generates a copy of the Candidate where ONLY a single demographic proxy 
        attribute is modified. Demonstrated skills and evidence remain strictly unchanged.
        """
        variant = models.Candidate(
            id=candidate.id,
            name=candidate.name,
            email=candidate.email,
            location=candidate.location,
            institution=candidate.institution,
            gender=candidate.gender,
            age=candidate.age,
            career_gap_info=candidate.career_gap_info,
            github_url=candidate.github_url,
            skills=candidate.skills,
            evidence=candidate.evidence,
            assessments=candidate.assessments
        )

        attr_clean = attribute.strip().lower()
        if attr_clean == "institution" or attr_clean == "college":
            variant.institution = new_value
        elif attr_clean == "location":
            variant.location = new_value
        elif attr_clean == "career_gap":
            # If new_value is empty/none, we mask the gap
            if not new_value or new_value.strip().lower() in ["none", "false", "masked", "null"]:
                variant.career_gap_info = None
            else:
                variant.career_gap_info = new_value
        elif attr_clean == "gender":
            variant.gender = new_value
        elif attr_clean == "age":
            try:
                variant.age = int(new_value)
            except Exception:
                pass
                
        return variant

    @staticmethod
    def classify_bias_risk(score_delta: float, rank_change: int) -> str:
        """
        Transparent risk thresholds based purely on measurable changes.
        """
        abs_delta = abs(score_delta)
        abs_rank = abs(rank_change)
        
        if abs_delta >= 10.0 or abs_rank >= 2:
            return "high"
        elif abs_delta >= 5.0 or abs_rank >= 1:
            return "moderate"
        return "low"

    @staticmethod
    def run_individual_audit(db: Session, candidate: models.Candidate, opportunity: models.Opportunity) -> schemas.BiasAuditResponse:
        """
        Performs a full normal vs blind matching comparison audit for a candidate.
        """
        # 1. Normal Match
        normal_match = MatchingEngine.calculate_match(db, candidate, opportunity, mode="normal")
        
        # 2. Blind Match (Calculated on the masked candidate)
        blind_candidate = FairnessEngine.get_blind_candidate(candidate)
        blind_match = MatchingEngine.calculate_match(db, blind_candidate, opportunity, mode="normal")
        
        # In a list of matches, we would query rankings. 
        # For a single candidate comparison, we calculate delta and risk.
        score_delta = round(blind_match.overall_score - normal_match.overall_score, 2)
        rank_change = 0 # Single candidate doesn't have list rank changes unless matched globally.
        
        # Determine risk
        risk_level = FairnessEngine.classify_bias_risk(score_delta, rank_change)
        
        # Check affected proxies
        affected = []
        if candidate.institution:
            affected.append("institution")
        if candidate.career_gap_info:
            affected.append("career_gap")
        if candidate.location:
            affected.append("location")
            
        explanation = FairnessEngine.generate_explanation(
            candidate_name=candidate.name,
            audit_type="blind_comparison",
            tested_attribute="demographics & credentials",
            original_val="Visible",
            counterfactual_val="Masked",
            normal_score=normal_match.overall_score,
            blind_score=blind_match.overall_score,
            score_delta=score_delta,
            rank_change=rank_change,
            capability_unchanged=True
        )

        return schemas.BiasAuditResponse(
            id=0,
            candidate_id=candidate.id,
            opportunity_id=opportunity.id,
            normal_score=normal_match.overall_score,
            blind_score=blind_match.overall_score,
            score_delta=score_delta,
            normal_rank=1,
            blind_rank=1,
            rank_change=rank_change,
            affected_attributes=json.dumps(affected),
            explanation=explanation,
            risk_level=risk_level,
            audit_type="blind_comparison",
            capability_data_unchanged=True
        )

    @staticmethod
    def generate_explanation(
        candidate_name: str,
        audit_type: str,
        tested_attribute: str,
        original_val: str,
        counterfactual_val: str,
        normal_score: float,
        blind_score: float,
        score_delta: float,
        rank_change: int,
        capability_unchanged: bool
    ) -> str:
        """
        Feeds the structured audit results to the LLM agent to explain the variance 
        in a neutral, decision-support manner.
        """
        llm = get_llm_service()
        
        prompt = f"""
You are an expert talent fairness auditing agent.
Analyze the following structured matching comparison results and write a neutral explanation.

Candidate Name: {candidate_name}
Audit Type: {audit_type}
Tested Attribute: {tested_attribute}
Original Value: '{original_val}'
Counterfactual / Masked Value: '{counterfactual_val}'
Original Normal Score: {normal_score}%
Counterfactual / Blind Score: {blind_score}%
Score Delta: {score_delta} points
Rank Change: {rank_change} positions
Capability Evidence Unchanged: {capability_unchanged}

Rules:
1. Explain what attribute was changed/masked and how it affected the candidate's score.
2. Confirm whether capability evidence remained constant between evaluations.
3. Keep the tone completely objective. Do not claim statistical proof of discrimination or declare the company/recruiter biased.
4. Recommend human review if a material rank change or score delta (>5.0 points) is observed.
5. Keep the explanation concise (2-4 sentences max).

Neutral Product Language Guidelines:
- Use terms like "Potential credential sensitivity detected", "Material ranking change observed", "Human review recommended".
- Avoid terms like "biased recruiter", "discrimination", "prejudice", "unfair hiring".
"""
        try:
            # We fetch explanation text from LLM
            # Since generate_json is standard, we can call generate_text or ask generate_json to return a dict
            response = llm.generate_json(
                prompt,
                response_schema=schemas.BaseModel # We can just ask it to return a basic JSON with an explanation field
            )
            if isinstance(response, dict) and "explanation" in response:
                return response["explanation"]
            elif isinstance(response, dict) and len(response) > 0:
                # Return the first string value
                return list(response.values())[0]
        except Exception as e:
            logger.error(f"Failed to generate LLM bias explanation: {e}", exc_info=True)
            
        # Fallback explanation
        dir_str = "increased" if score_delta > 0 else "decreased" if score_delta < 0 else "remained constant"
        return (
            f"Candidate '{candidate_name}' capability score {dir_str} by {abs(score_delta)} points "
            f"after masking/changing the '{tested_attribute}' attribute. Demonstrated capability evidence remained constant. "
            f"Potential credential sensitivity detected; human review recommended."
        )
