import pytest
from unittest.mock import MagicMock
from sqlalchemy.orm import Session

from backend.app.services.normalization import SkillNormalizer
from backend.app.services.job_analyzer import JobAnalyzerService
from backend.app.services.matcher import MatchingEngine
from backend.app.models import models
from backend.app.schemas import schemas

# --- 1. SKILL NORMALIZATION TESTS ---
def test_skill_normalization():
    assert SkillNormalizer.normalize_name("ML") == "Machine Learning"
    assert SkillNormalizer.normalize_name("ml") == "Machine Learning"
    assert SkillNormalizer.normalize_name("reactjs") == "React"
    assert SkillNormalizer.normalize_name("Postgres") == "PostgreSQL"
    assert SkillNormalizer.normalize_name("python") == "Python"
    assert SkillNormalizer.normalize_name("docker") == "Docker"
    assert SkillNormalizer.normalize_name("unknown-skill") == "Unknown-Skill"


# --- 2. JOB DESCRIPTION PARSING MOCK TEST ---
def test_job_description_parsing(monkeypatch):
    class MockLLMService:
        def generate_json(self, prompt, response_schema=None):
            return {
                "skills": [
                    {
                        "name": "Python",
                        "category": "Backend",
                        "importance": 1.0,
                        "required_level": "Intermediate",
                        "requirement_type": "required",
                        "evidence_expectation": "GitHub repos showing clean code"
                    },
                    {
                        "name": "SQL",
                        "category": "Database",
                        "importance": 0.6,
                        "required_level": "Beginner",
                        "requirement_type": "preferred",
                        "evidence_expectation": "Queries or database projects"
                    }
                ]
            }

    monkeypatch.setattr("backend.app.services.job_analyzer.get_llm_service", lambda: MockLLMService())

    extracted = JobAnalyzerService.analyze_job_description("Dev", "Corp", "Job details...")
    assert len(extracted.skills) == 2
    assert extracted.skills[0].name == "Python"
    assert extracted.skills[1].requirement_type == "preferred"


# --- 3. DETERMINISTIC SCORE CALCULATION & INVARIANTS ---
def test_matching_score_calculation():
    # Setup mock DB session
    db_mock = MagicMock(spec=Session)

    # Define Opportunity requirements
    opp = models.Opportunity(id=1, title="Backend Engineer", company="TechCorp")
    skill_py = models.Skill(id=10, name="Python", category="Backend")
    skill_sql = models.Skill(id=11, name="SQL", category="Database")

    os_py = models.OpportunitySkill(
        id=1,
        opportunity_id=1,
        skill_id=10,
        importance=1.0,
        required_level="Intermediate",
        requirement_type="required",
        skill=skill_py
    )
    os_sql = models.OpportunitySkill(
        id=2,
        opportunity_id=1,
        skill_id=11,
        importance=0.5,
        required_level="Intermediate",
        requirement_type="preferred",
        skill=skill_sql
    )
    opp.required_skills = [os_py, os_sql]

    # Create Candidate with matching Python but missing SQL
    cand = models.Candidate(id=100, name="Candidate A")
    cs_py = models.CandidateSkill(
        id=50,
        candidate_id=100,
        skill_id=10,
        confidence=1.0,
        proficiency="Expert",
        evidence_strength=2.0,
        skill_type="explicit",
        skill=skill_py
    )
    cand.skills = [cs_py]

    # Run match (Python is Match/Strong, SQL is Preferred No Evidence)
    result = MatchingEngine.calculate_match(db_mock, cand, opp, mode="skills_first")
    
    # Assert breakdown details
    assert result.candidate_id == 100
    assert len(result.skills_breakdown) == 2
    
    py_match = next(d for d in result.skills_breakdown if d.name == "Python")
    assert py_match.match_status == "Strong match"
    assert py_match.contribution > 0.0

    sql_match = next(d for d in result.skills_breakdown if d.name == "SQL")
    assert sql_match.match_status == "No evidence"
    assert sql_match.contribution == 0.0


# --- 4. CREDENTIAL-BLIND MATCHING SAFETY INVARIANT ---
def test_credential_blindness_invariant():
    """
    Verifies that institutional pedigree, location, and career gaps 
    have absolutely ZERO influence on matching scores in skills_first mode.
    """
    db_mock = MagicMock(spec=Session)

    # Opportunity
    opp = models.Opportunity(id=1, title="Dev", company="Corp")
    skill = models.Skill(id=10, name="Python")
    os = models.OpportunitySkill(
        id=1,
        opportunity_id=1,
        skill_id=10,
        importance=1.0,
        required_level="Intermediate",
        requirement_type="required",
        skill=skill
    )
    opp.required_skills = [os]

    # Candidate A: Stanford, Seattle, No gaps
    cand_a = models.Candidate(
        id=1,
        name="Candidate A",
        institution="Stanford University",
        location="Seattle, WA",
        career_gap_info=None
    )
    cs_a = models.CandidateSkill(
        id=100,
        candidate_id=1,
        skill_id=10,
        confidence=1.0,
        proficiency="Expert",
        evidence_strength=2.0,
        skill_type="explicit",
        skill=skill
    )
    cand_a.skills = [cs_a]

    # Candidate B: No education, remote/unknown location, massive career gaps
    cand_b = models.Candidate(
        id=2,
        name="Candidate B",
        institution=None,
        location="Remote Town, WY",
        career_gap_info="Took 3 years off for family care."
    )
    cs_b = models.CandidateSkill(
        id=101,
        candidate_id=2,
        skill_id=10,
        confidence=1.0,
        proficiency="Expert",
        evidence_strength=2.0,
        skill_type="explicit",
        skill=skill
    )
    cand_b.skills = [cs_b]

    # --- Mode: skills_first (Demographic Blind) ---
    match_a_blind = MatchingEngine.calculate_match(db_mock, cand_a, opp, mode="skills_first")
    match_b_blind = MatchingEngine.calculate_match(db_mock, cand_b, opp, mode="skills_first")

    # The scores MUST be exactly identical in skills_first mode!
    assert match_a_blind.overall_score == match_b_blind.overall_score
    print(f"[+] Credentials Blind Match Verified: {match_a_blind.overall_score}% == {match_b_blind.overall_score}%")

    # --- Mode: normal (Conventional legacy resume matching) ---
    match_a_normal = MatchingEngine.calculate_match(db_mock, cand_a, opp, mode="normal")
    match_b_normal = MatchingEngine.calculate_match(db_mock, cand_b, opp, mode="normal")

    # In conventional ATS matching, Candidate B is heavily penalized for the gap and lack of elite university,
    # resulting in a much lower score.
    assert match_a_normal.overall_score > match_b_normal.overall_score
    assert match_b_blind.overall_score > match_b_normal.overall_score
    print(f"[+] Conventional ATS Penalty verified: {match_a_normal.overall_score}% > {match_b_normal.overall_score}%")


# --- 5. MULTIPLE CANDIDATES RANKING TEST ---
def test_ranking_multiple_candidates():
    db_mock = MagicMock(spec=Session)

    opp = models.Opportunity(id=1, title="Dev", company="Corp")
    skill = models.Skill(id=10, name="Python")
    os = models.OpportunitySkill(id=1, opportunity_id=1, skill_id=10, importance=1.0, required_level="Intermediate", skill=skill)
    opp.required_skills = [os]

    # Candidate 1: 100% confidence
    c1 = models.Candidate(id=1, name="Strong Candidate")
    cs1 = models.CandidateSkill(id=1, skill_id=10, confidence=1.0, proficiency="Expert", evidence_strength=2.0, skill=skill)
    c1.skills = [cs1]

    # Candidate 2: 50% confidence
    c2 = models.Candidate(id=2, name="Weak Candidate")
    cs2 = models.CandidateSkill(id=2, skill_id=10, confidence=0.5, proficiency="Beginner", evidence_strength=0.5, skill=skill)
    c2.skills = [cs2]

    m1 = MatchingEngine.calculate_match(db_mock, c1, opp, mode="skills_first")
    m2 = MatchingEngine.calculate_match(db_mock, c2, opp, mode="skills_first")

    matches = [m1, m2]
    matches.sort(key=lambda x: x.overall_score, reverse=True)

    assert matches[0].candidate_name == "Strong Candidate"
    assert matches[1].candidate_name == "Weak Candidate"
    assert matches[0].overall_score > matches[1].overall_score
