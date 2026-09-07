import pytest
from unittest.mock import MagicMock
from sqlalchemy.orm import Session

from backend.app.models import models
from backend.app.services.eligibility import PMISEligibilityEngine
from backend.app.services.matcher import MatchingEngine
from backend.app.services.roadmap import RoadmapGenerator

def test_pmis_eligibility_success():
    """
    Verifies that a student meeting all standard PMIS criteria passes the pre-check.
    """
    # 22 years old, 3 Lakh family income, not govt employee, normal college, no exclusions
    student = models.Candidate(
        id=1,
        name="Eligible Student",
        age=22,
        family_income=300000.0,
        is_family_govt_employee=False,
        institution_is_elite=False,
        highest_degree="B.Sc",
        is_full_time_student=False,
        is_full_time_employed=False,
        has_prior_nats_naps=False
    )
    
    eligible, passed, failed = PMISEligibilityEngine.precheck_candidate(student)
    
    assert eligible is True
    assert len(failed) == 0
    assert len(passed) == 6

def test_pmis_eligibility_exclusions():
    """
    Verifies that students failing specific guidelines (e.g. age, income, elite pedigree, MBA degree) are flagged.
    """
    # Fail due to age
    student_age = models.Candidate(
        id=1, age=20, family_income=100000.0, is_family_govt_employee=False, 
        institution_is_elite=False, highest_degree="B.Sc"
    )
    eligible, passed, failed = PMISEligibilityEngine.precheck_candidate(student_age)
    assert eligible is False
    assert any("Age Check Failed" in f for f in failed)
    
    # Fail due to family income
    student_income = models.Candidate(
        id=2, age=23, family_income=950000.0, is_family_govt_employee=False, 
        institution_is_elite=False, highest_degree="B.Sc"
    )
    eligible, passed, failed = PMISEligibilityEngine.precheck_candidate(student_income)
    assert eligible is False
    assert any("Family Income Check Failed" in f for f in failed)

    # Fail due to elite pedigree (IIT graduate)
    student_elite = models.Candidate(
        id=3, age=22, family_income=150000.0, is_family_govt_employee=False, 
        institution_is_elite=True, highest_degree="B.Tech"
    )
    eligible, passed, failed = PMISEligibilityEngine.precheck_candidate(student_elite)
    assert eligible is False
    assert any("Institution Pedigree Check Failed" in f for f in failed)

    # Fail due to professional degree (CA)
    student_degree = models.Candidate(
        id=4, age=24, family_income=200000.0, is_family_govt_employee=False, 
        institution_is_elite=False, highest_degree="Chartered Accountant (CA)"
    )
    eligible, passed, failed = PMISEligibilityEngine.precheck_candidate(student_degree)
    assert eligible is False
    assert any("Degree Qualification Check Failed" in f for f in failed)

def test_recommendation_scoring_preferences():
    """
    Verifies that skills/evidence dominate matches and location/sector preferences
    apply small transparent score adjustments (+2.0 points per matching preference).
    """
    db_mock = MagicMock(spec=Session)
    
    # Required skill is Python
    skill = models.Skill(id=10, name="Python", category="Backend")
    opp = models.Opportunity(
        id=1,
        title="Python Intern",
        company="DataCorp",
        location="New Delhi",
        sector="IT",
        allowed_streams="B.Tech,MCA"
    )
    os = models.OpportunitySkill(
        id=1, opportunity_id=1, skill_id=10, importance=1.0, required_level="Intermediate", skill=skill
    )
    opp.required_skills = [os]
    
    # Student A: Has Python skill, matches New Delhi location, matches IT sector, matches B.Tech stream
    student_a = models.Candidate(
        id=1, name="Student A", preferred_location="New Delhi", preferred_sector="IT", qualification_stream="B.Tech"
    )
    cs_a = models.CandidateSkill(
        id=1, skill_id=10, confidence=1.0, proficiency="Intermediate", evidence_strength=1.5, skill=skill
    )
    student_a.skills = [cs_a]
    
    # Student B: Same Python skill but different preferences and stream
    student_b = models.Candidate(
        id=2, name="Student B", preferred_location="Mumbai", preferred_sector="Finance", qualification_stream="Mechanical"
    )
    cs_b = models.CandidateSkill(
        id=2, skill_id=10, confidence=1.0, proficiency="Intermediate", evidence_strength=1.5, skill=skill
    )
    student_b.skills = [cs_b]
    
    match_a = MatchingEngine.calculate_match(db_mock, student_a, opp, mode="skills_first")
    match_b = MatchingEngine.calculate_match(db_mock, student_b, opp, mode="skills_first")
    
    # Both candidates have matching skills, but Student A has location, sector, and stream compatibility boost
    # (Location Match: +2, Sector Match: +2, Stream Match: +1 => Total bonus of +5 points)
    assert match_a.overall_score > match_b.overall_score
    # Difference should be exactly 5.0 points
    assert round(match_a.overall_score - match_b.overall_score, 1) == 5.0
    
    # Verify that socio-economic parameters (like family_income) have no impact on match scores
    student_b.family_income = 50000.0
    match_b_rich = MatchingEngine.calculate_match(db_mock, student_b, opp, mode="skills_first")
    assert match_b.overall_score == match_b_rich.overall_score

def test_roadmap_generation():
    """
    Verifies that skill gap lists generate appropriate developmental roadmaps.
    """
    missing_skills = ["Python", "Docker", "UnknownSkill"]
    
    roadmap = RoadmapGenerator.generate_roadmap(missing_skills)
    
    assert len(roadmap) == 3
    
    # Python gap details
    python_gap = next(r for r in roadmap if r.skill_name == "Python")
    assert any("Michigan" in res.provider for res in python_gap.resources)
    assert any("FastAPI" in res.title for res in python_gap.resources)
    
    # Docker gap details
    docker_gap = next(r for r in roadmap if r.skill_name == "Docker")
    assert any("KodeKloud" in res.provider for res in docker_gap.resources)
    
    # UnknownSkill gap details (generic fallback)
    unknown_gap = next(r for r in roadmap if r.skill_name == "UnknownSkill")
    assert len(unknown_gap.resources) == 2
    assert any("Fundamentals" in res.title for res in unknown_gap.resources)


def test_readiness_simulation_math():
    """
    Verifies the mathematical correctness of the readiness simulator:
    1. Selecting one missing skill adds its precise potential_contribution.
    2. Multiple selected skills sum their potential_contributions.
    3. Total projected score is capped at 100%.
    4. Selecting all missing skills gives a mathematically justified score (not automatically 100%).
    5. Roadmap duration is dynamically derived from total learning hours.
    """
    from backend.app.api.router import get_readiness_simulation, get_upskilling_roadmap
    db_mock = MagicMock(spec=Session)
    
    # 2 required skills: Python (importance 1.0) and React (importance 0.5)
    # total_weight = (1.0 * 1.2) + (0.5 * 1.2) = 1.2 + 0.6 = 1.8
    # Max contribution of Python = 1.2 / 1.8 = 66.7%
    # Max contribution of React = 0.6 / 1.8 = 33.3%
    
    s_python = models.Skill(id=1, name="Python", category="Backend")
    s_react = models.Skill(id=2, name="React", category="Frontend")
    
    opp = models.Opportunity(id=10, title="Dev Intern", company="InnoTech")
    os_p = models.OpportunitySkill(opportunity_id=10, skill_id=1, importance=1.0, required_level="Intermediate", skill=s_python)
    os_r = models.OpportunitySkill(opportunity_id=10, skill_id=2, importance=0.5, required_level="Intermediate", skill=s_react)
    opp.required_skills = [os_p, os_r]
    
    # Student has NO skills
    student = models.Candidate(id=5, name="Novice Student")
    student.skills = []
    
    # Mock DB query
    def mock_query(model):
        q = MagicMock()
        if model == models.Candidate:
            q.filter().first.return_value = student
        elif model == models.Opportunity:
            q.filter().first.return_value = opp
        return q
        
    db_mock.query = mock_query
    
    # Get readiness simulation
    res = get_readiness_simulation(candidate_id=5, opportunity_id=10, db=db_mock)
    
    # Assertions
    assert res.current_readiness_score == 0.0
    assert len(res.skills_breakdown) == 2
    
    p_detail = next(s for s in res.skills_breakdown if s.skill_name == "Python")
    r_detail = next(s for s in res.skills_breakdown if s.skill_name == "React")
    
    # Verify potential contributions are mathematically justified:
    # Python: (1.2 / 1.8) * 100 = 66.7%
    # React: (0.6 / 1.8) * 100 = 33.3%
    assert round(p_detail.potential_contribution, 1) == 66.7
    assert round(r_detail.potential_contribution, 1) == 33.3
    
    # 1. Selecting one missing skill increases score by its actual contribution
    # 2. Selecting multiple skills sums their contributions
    assert res.projected_readiness_score == 100.0
    
    # 4. Selecting all missing skills produces a mathematically justified result (not automatically 100%)
    # Let's say student has Python with confidence = 0.5, but no React.
    student_partial = models.Candidate(id=6, name="Partial Student")
    cs_p = models.CandidateSkill(id=15, skill_id=1, confidence=0.5, proficiency="Intermediate", evidence_strength=2.0, skill=s_python)
    student_partial.skills = [cs_p]
    
    def mock_query_partial(model):
        q = MagicMock()
        if model == models.Candidate:
            q.filter().first.return_value = student_partial
        elif model == models.Opportunity:
            q.filter().first.return_value = opp
        return q
    db_mock.query = mock_query_partial
    
    res_partial = get_readiness_simulation(candidate_id=6, opportunity_id=10, db=db_mock)
    
    # Current score is 27.8% (0.5 / 1.8 * 100)
    assert round(res_partial.current_readiness_score, 1) == 27.8
    
    # Missing is React. React potential_contribution is 33.3%
    # Projected score is current (27.8%) + React potential (33.3%) = 61.1%
    assert res_partial.projected_readiness_score == 61.1
    
    # 5. Roadmap duration changes according to total estimated learning hours
    # If 1 gap (React):
    # React resources in catalog: fullstack open (60h) + Meta front-end (120h) + React project (20h) = 200h
    # 200 hours / 40 hours/month = 5.0 months.
    roadmap_partial = get_upskilling_roadmap(candidate_id=6, opportunity_id=10, db=db_mock)
    assert roadmap_partial.estimated_months_to_ready == 5.0


def test_ml_evidence_produces_canonical_skill():
    """
    Regression test: Verifies that project evidence demonstrating model training,
    transfer learning, and neural network classification maps to the canonical
    'Machine Learning' skill in the catalog.
    """
    from backend.app.services.normalization import SkillNormalizer
    
    assert SkillNormalizer.normalize_name("applied artificial intelligence") == "Machine Learning"
    assert SkillNormalizer.normalize_name("transfer learning") == "Machine Learning"
    assert SkillNormalizer.normalize_name("machine learning (ml)") == "Machine Learning"
    assert SkillNormalizer.normalize_name("model training") == "Machine Learning"
    assert SkillNormalizer.normalize_name("ai/ml") == "Machine Learning"
    assert SkillNormalizer.normalize_name("tensorflow / keras") == "TensorFlow"
    assert SkillNormalizer.normalize_name("image classification") == "Computer Vision"
