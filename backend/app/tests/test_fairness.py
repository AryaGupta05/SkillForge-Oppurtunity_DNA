import pytest
from unittest.mock import MagicMock
from sqlalchemy.orm import Session

from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.services.fairness import FairnessEngine
from backend.app.services.matcher import MatchingEngine

# --- 1. BLIND PROFILE GENERATION & MASKING ---
def test_blind_profile_generation():
    cand = models.Candidate(
        id=1,
        name="Ada Lovelace",
        email="ada@test.org",
        location="London, UK",
        institution="Cambridge",
        gender="Female",
        age=36,
        career_gap_info="4 years off"
    )
    
    # Setup mock skills/evidence
    skill = models.Skill(name="Python")
    cs = models.CandidateSkill(skill=skill, proficiency="Expert")
    cand.skills = [cs]
    
    blinded = FairnessEngine.get_blind_candidate(cand)
    
    # Exclude credential/pedigree proxies
    assert blinded.institution is None
    assert blinded.location is None
    assert blinded.gender is None
    assert blinded.age is None
    assert blinded.career_gap_info is None
    
    # Retain skills/evidence
    assert len(blinded.skills) == 1
    assert blinded.skills[0].skill.name == "Python"
    assert blinded.skills[0].proficiency == "Expert"


# --- 2. COUNTERFACTUAL VARIANT CREATION & CAPABILITY INVARIANCE ---
def test_counterfactual_generation_and_invariance():
    cand = models.Candidate(
        id=1,
        name="Candidate A",
        institution="Local College",
        career_gap_info="2 years gap"
    )
    
    skill = models.Skill(name="Python")
    cs = models.CandidateSkill(skill=skill, proficiency="Expert")
    cand.skills = [cs]
    
    # Test variant changing college/institution
    variant = FairnessEngine.generate_counterfactual_variant(cand, "institution", "Elite University")
    
    # Checked attribute changed
    assert variant.institution == "Elite University"
    # Unchanged attribute preserved
    assert variant.career_gap_info == "2 years gap"
    # Capability data remains strictly identical
    assert len(variant.skills) == 1
    assert variant.skills[0].proficiency == "Expert"
    
    # Test gap masking
    variant_gap = FairnessEngine.generate_counterfactual_variant(cand, "career_gap", "none")
    assert variant_gap.career_gap_info is None


# --- 3. BIAS RISK CLASSIFICATION THRESHOLDS ---
def test_risk_classification():
    # Low risk
    assert FairnessEngine.classify_bias_risk(3.0, 0) == "low"
    assert FairnessEngine.classify_bias_risk(-2.5, 0) == "low"
    
    # Moderate risk
    assert FairnessEngine.classify_bias_risk(6.0, 0) == "moderate"
    assert FairnessEngine.classify_bias_risk(2.0, 1) == "moderate"
    
    # High risk
    assert FairnessEngine.classify_bias_risk(12.0, 0) == "high"
    assert FairnessEngine.classify_bias_risk(3.0, 2) == "high"
    assert FairnessEngine.classify_bias_risk(-15.0, -3) == "high"


# --- 4. DETERMINISTIC SCENARIO: IDENTICAL CAPABILITY, DIFFERENT INSTITUTIONS ---
def test_deterministic_fairness_scenario():
    db_mock = MagicMock(spec=Session)
    
    # 1. Setup Opportunity requiring Python
    opp = models.Opportunity(id=10, title="Dev")
    skill_py = models.Skill(id=5, name="Python")
    os = models.OpportunitySkill(
        opportunity_id=10,
        skill_id=5,
        importance=1.0,
        required_level="Intermediate",
        requirement_type="required",
        skill=skill_py
    )
    opp.required_skills = [os]
    
    # Candidate A: Elite University
    cand_a = models.Candidate(
        id=1,
        name="Candidate A",
        institution="Harvard University",
        location="Boston, MA"
    )
    cs_a = models.CandidateSkill(
        skill_id=5,
        confidence=1.0,
        proficiency="Expert",
        evidence_strength=2.0,
        skill=skill_py
    )
    cand_a.skills = [cs_a]
    
    # Candidate B: Non-elite University, identical capability evidence
    cand_b = models.Candidate(
        id=2,
        name="Candidate B",
        institution="Local Online Bootcamp",
        location="Boston, MA"
    )
    cs_b = models.CandidateSkill(
        skill_id=5,
        confidence=1.0,
        proficiency="Expert",
        evidence_strength=2.0,
        skill=skill_py
    )
    cand_b.skills = [cs_b]
    
    # --- Assert Skills-First Match is Identical ---
    match_a_blind = MatchingEngine.calculate_match(db_mock, cand_a, opp, mode="skills_first")
    match_b_blind = MatchingEngine.calculate_match(db_mock, cand_b, opp, mode="skills_first")
    
    assert match_a_blind.overall_score == match_b_blind.overall_score
    
    # --- Assert ATS Simulation changes according to proxy rules ---
    match_a_norm = MatchingEngine.calculate_match(db_mock, cand_a, opp, mode="normal")
    match_b_norm = MatchingEngine.calculate_match(db_mock, cand_b, opp, mode="normal")
    
    # Candidate B gets penalized in normal mode, Candidate A does not
    assert match_a_norm.overall_score > match_b_norm.overall_score
    
    # --- Counterfactual Engine detects institutional sensitivity ---
    # Create variant of B where institution is changed to Harvard
    variant_b = FairnessEngine.generate_counterfactual_variant(cand_b, "institution", "Harvard University")
    
    match_variant_b = MatchingEngine.calculate_match(db_mock, variant_b, opp, mode="normal")
    
    # Score delta is positive since bootcamp was penalized and Harvard is not
    delta = match_variant_b.overall_score - match_b_norm.overall_score
    assert delta == 10.0 # Standard simulated institution penalty is 10.0 points
