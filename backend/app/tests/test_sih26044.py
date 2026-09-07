"""
SIH26044 Backend Tests:
Tests for application workflow, analytics endpoints, opportunity types,
and shortlisting persistence.
"""
import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime

from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.api.router import (
    create_application,
    get_candidate_applications,
    get_opportunity_applications,
    update_application_status,
    get_skill_demand_analytics,
    get_institution_dashboard,
    VALID_APPLICATION_TRANSITIONS,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

def _make_candidate(id=1, name="Test Student"):
    return models.Candidate(id=id, name=name, email=f"student{id}@example.com")


def _make_opportunity(id=1, title="Test Internship", company="Test Corp", opp_type="internship"):
    return models.Opportunity(id=id, title=title, company=company, type=opp_type)


def _make_application(id=1, candidate_id=1, opportunity_id=1, status="applied"):
    c = _make_candidate(id=candidate_id)
    o = _make_opportunity(id=opportunity_id)
    return models.Application(
        id=id,
        candidate_id=candidate_id,
        opportunity_id=opportunity_id,
        status=status,
        applied_at=datetime(2026, 9, 1, 10, 0, 0),
        updated_at=datetime(2026, 9, 1, 10, 0, 0),
        notes=None,
        candidate=c,
        opportunity=o
    )


def _mock_db():
    return MagicMock()


# ---------------------------------------------------------------------------
# Test 1: Application Creation
# ---------------------------------------------------------------------------

def test_application_creation():
    """Test that a student can apply to an opportunity."""
    db = _mock_db()
    candidate = _make_candidate()
    opportunity = _make_opportunity()
    
    def query_side_effect(model):
        q = MagicMock()
        if model == models.Candidate:
            q.filter.return_value.first.return_value = candidate
        elif model == models.Opportunity:
            q.filter.return_value.first.return_value = opportunity
        elif model == models.Application:
            q.filter.return_value.first.return_value = None
        return q
    db.query = query_side_effect
    
    def mock_refresh(a):
        a.id = 1
        a.candidate = candidate
        a.opportunity = opportunity
        a.applied_at = datetime.utcnow()
        a.updated_at = datetime.utcnow()
        
    db.refresh = mock_refresh
    
    added_items = []
    db.add = lambda item: added_items.append(item)
    
    payload = schemas.ApplicationCreate(candidate_id=1, opportunity_id=1)
    result = create_application(payload, db)
    
    assert len(added_items) == 1
    assert added_items[0].status == "applied"
    assert added_items[0].candidate_id == 1
    assert added_items[0].opportunity_id == 1
    assert result.candidate_name == "Test Student"
    assert result.opportunity_title == "Test Internship"
    db.commit.assert_called()


# ---------------------------------------------------------------------------
# Test 2: Duplicate Application Prevention
# ---------------------------------------------------------------------------

def test_duplicate_application_prevention():
    """Test that duplicate applications are rejected with 409."""
    db = _mock_db()
    candidate = _make_candidate()
    opportunity = _make_opportunity()
    existing_app = _make_application()
    
    def query_side_effect(model):
        q = MagicMock()
        if model == models.Candidate:
            q.filter.return_value.first.return_value = candidate
        elif model == models.Opportunity:
            q.filter.return_value.first.return_value = opportunity
        elif model == models.Application:
            q.filter.return_value.filter.return_value.first.return_value = existing_app
        return q
    db.query = query_side_effect
    
    payload = schemas.ApplicationCreate(candidate_id=1, opportunity_id=1)
    
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        create_application(payload, db)
    assert exc_info.value.status_code == 409
    assert "already exists" in exc_info.value.detail


# ---------------------------------------------------------------------------
# Test 3: Candidate Application Listing
# ---------------------------------------------------------------------------

def test_candidate_application_listing():
    """Test that applications for a candidate are returned correctly."""
    db = _mock_db()
    candidate = _make_candidate()
    apps = [_make_application(id=1, status="applied"), _make_application(id=2, status="shortlisted")]
    
    call_count = [0]
    def query_side_effect(model):
        q = MagicMock()
        if model == models.Candidate:
            q.filter.return_value.first.return_value = candidate
        elif model == models.Application:
            q.filter.return_value.order_by.return_value.all.return_value = apps
        return q
    db.query = query_side_effect
    
    result = get_candidate_applications(1, db)
    assert len(result) == 2
    assert result[0].status == "applied"
    assert result[1].status == "shortlisted"


# ---------------------------------------------------------------------------
# Test 4: Opportunity Application Listing
# ---------------------------------------------------------------------------

def test_opportunity_application_listing():
    """Test that applications for an opportunity are returned correctly."""
    db = _mock_db()
    opportunity = _make_opportunity()
    apps = [_make_application(id=1), _make_application(id=2)]
    
    def query_side_effect(model):
        q = MagicMock()
        if model == models.Opportunity:
            q.filter.return_value.first.return_value = opportunity
        elif model == models.Application:
            q.filter.return_value.order_by.return_value.all.return_value = apps
        return q
    db.query = query_side_effect
    
    result = get_opportunity_applications(1, db)
    assert len(result) == 2


# ---------------------------------------------------------------------------
# Test 5: Valid Status Transitions
# ---------------------------------------------------------------------------

def test_valid_status_transitions():
    """Test all valid application status transitions."""
    valid_chains = [
        ("applied", "shortlisted"),
        ("applied", "rejected"),
        ("shortlisted", "offered"),
        ("shortlisted", "rejected"),
        ("offered", "placed"),
        ("offered", "rejected"),
    ]
    
    for from_status, to_status in valid_chains:
        db = _mock_db()
        app = _make_application(status=from_status)
        
        def query_side_effect(model):
            q = MagicMock()
            q.filter.return_value.first.return_value = app
            return q
        db.query = query_side_effect
        
        payload = schemas.ApplicationStatusUpdate(status=to_status)
        result = update_application_status(1, payload, db)
        
        assert app.status == to_status, f"Transition {from_status} -> {to_status} failed"
        db.commit.assert_called()


# ---------------------------------------------------------------------------
# Test 6: Invalid Status Transitions
# ---------------------------------------------------------------------------

def test_invalid_status_transitions():
    """Test that invalid transitions are rejected with 400."""
    from fastapi import HTTPException
    
    invalid_chains = [
        ("applied", "offered"),      # Can't skip shortlisted
        ("applied", "placed"),       # Can't skip to placed
        ("shortlisted", "applied"),  # Can't go backwards
        ("shortlisted", "placed"),   # Can't skip offered
        ("offered", "shortlisted"),  # Can't go backwards
        ("offered", "applied"),      # Can't go backwards
        ("placed", "applied"),       # Terminal state
        ("placed", "shortlisted"),   # Terminal state
        ("rejected", "applied"),     # Terminal state
        ("rejected", "shortlisted"), # Terminal state
    ]
    
    for from_status, to_status in invalid_chains:
        db = _mock_db()
        app = _make_application(status=from_status)
        
        def query_side_effect(model):
            q = MagicMock()
            q.filter.return_value.first.return_value = app
            return q
        db.query = query_side_effect
        
        payload = schemas.ApplicationStatusUpdate(status=to_status)
        
        with pytest.raises(HTTPException) as exc_info:
            update_application_status(1, payload, db)
        assert exc_info.value.status_code == 400, f"Transition {from_status} -> {to_status} should be rejected"


# ---------------------------------------------------------------------------
# Test 7: Skill Demand Analytics (Schema Validation)
# ---------------------------------------------------------------------------

def test_skill_demand_analytics_schema():
    """Test that skill demand response schema validates correctly."""
    response = schemas.SkillDemandResponse(
        total_opportunities=5,
        skills=[
            schemas.SkillDemandItem(
                skill_name="Python",
                category="Backend",
                opportunity_count=4,
                percentage=80.0,
                internship_count=3,
                placement_count=1,
            )
        ]
    )
    assert response.total_opportunities == 5
    assert len(response.skills) == 1
    assert response.skills[0].skill_name == "Python"
    assert response.skills[0].percentage == 80.0
    assert response.skills[0].internship_count == 3
    assert response.skills[0].placement_count == 1


# ---------------------------------------------------------------------------
# Test 8: Institution Dashboard Analytics (Schema Validation)
# ---------------------------------------------------------------------------

def test_institution_dashboard_schema():
    """Test that institution dashboard response schema validates correctly."""
    response = schemas.InstitutionDashboardResponse(
        total_students=50,
        total_opportunities=10,
        internship_count=7,
        placement_count=3,
        project_count=0,
        top_student_skills=[
            schemas.SkillSupplyItem(skill_name="Python", student_count=30)
        ],
        top_demanded_skills=[
            schemas.SkillDemandItem(skill_name="Python", category="Backend", opportunity_count=8, percentage=80.0)
        ],
        skill_gaps=[
            schemas.SkillGapItem(skill_name="Docker", demand_count=5, supply_count=2, gap=3)
        ],
        application_stats={"applied": 20, "shortlisted": 5, "offered": 2, "placed": 1, "rejected": 3, "total": 31}
    )
    assert response.total_students == 50
    assert response.internship_count == 7
    assert response.placement_count == 3
    assert len(response.skill_gaps) == 1
    assert response.skill_gaps[0].gap == 3
    assert response.application_stats["total"] == 31


def test_institution_dashboard_breakdown_schema():
    """Test that institution dashboard breakdown and readiness metrics validate correctly."""
    response = schemas.InstitutionDashboardResponse(
        total_students=10,
        total_opportunities=5,
        internship_count=3,
        placement_count=2,
        project_count=0,
        top_student_skills=[],
        top_demanded_skills=[],
        skill_gaps=[],
        application_stats={"total": 5},
        internship_application_stats={"applied": 2, "shortlisted": 1, "offered": 0, "placed": 0, "rejected": 0, "total": 3},
        placement_application_stats={"applied": 1, "shortlisted": 0, "offered": 0, "placed": 1, "rejected": 0, "total": 2},
        avg_match_readiness=78.5
    )
    assert response.internship_application_stats["total"] == 3
    assert response.placement_application_stats["placed"] == 1
    assert response.avg_match_readiness == 78.5



# ---------------------------------------------------------------------------
# Test 9: Internship Opportunity Type
# ---------------------------------------------------------------------------

def test_internship_opportunity_type():
    """Test that internship opportunities have correct type field."""
    response = schemas.OpportunityResponse(
        id=1,
        title="AI/ML Intern",
        company="Test Corp",
        type="internship",
        created_at=datetime(2026, 1, 1),
        required_skills=[]
    )
    assert response.type == "internship"


# ---------------------------------------------------------------------------
# Test 10: Placement Opportunity Type
# ---------------------------------------------------------------------------

def test_placement_opportunity_type():
    """Test that placement opportunities have correct type field and duration."""
    response = schemas.OpportunityResponse(
        id=2,
        title="Junior Business Analyst",
        company="FinServ Corp",
        type="placement",
        duration_months=12,
        created_at=datetime(2026, 1, 1),
        required_skills=[]
    )
    assert response.type == "placement"
    assert response.duration_months == 12


# ---------------------------------------------------------------------------
# Test 11: Candidate Shortlist Persistence
# ---------------------------------------------------------------------------

def test_shortlist_persistence():
    """Test that shortlisting persists via application status update."""
    db = _mock_db()
    app = _make_application(status="applied")
    
    def query_side_effect(model):
        q = MagicMock()
        q.filter.return_value.first.return_value = app
        return q
    db.query = query_side_effect
    
    payload = schemas.ApplicationStatusUpdate(status="shortlisted", notes="Strong ML profile")
    result = update_application_status(1, payload, db)
    
    # Verify the status was actually changed on the ORM object
    assert app.status == "shortlisted"
    assert app.notes == "Strong ML profile"
    db.commit.assert_called()


# ---------------------------------------------------------------------------
# Test 12: Existing Matching Behavior Unchanged
# ---------------------------------------------------------------------------

def test_existing_matching_formulas_unchanged():
    """Verify that the deterministic matching engine formulas remain intact."""
    from backend.app.services.matcher import MatchingEngine, get_proficiency_val, get_proficiency_multiplier
    
    # Proficiency value mapping (Intermediate fallback = 2)
    assert get_proficiency_val("Beginner") == 1
    assert get_proficiency_val("Intermediate") == 2
    assert get_proficiency_val("Expert") == 3
    assert get_proficiency_val(None) == 2
    
    # Proficiency multiplier mapping (Intermediate fallback = 0.8)
    assert get_proficiency_multiplier("Beginner") == 0.5
    assert get_proficiency_multiplier("Intermediate") == 0.8
    assert get_proficiency_multiplier("Expert") == 1.0
    assert get_proficiency_multiplier(None) == 0.8


# ---------------------------------------------------------------------------
# Test: Application response includes opportunity type
# ---------------------------------------------------------------------------

def test_application_response_includes_opportunity_type():
    """Test that application response includes the opportunity type."""
    response = schemas.ApplicationResponse(
        id=1,
        candidate_id=1,
        opportunity_id=1,
        status="applied",
        applied_at=datetime(2026, 9, 1),
        updated_at=datetime(2026, 9, 1),
        opportunity_type="placement",
        candidate_name="Test Student",
        opportunity_title="Business Analyst",
        opportunity_company="FinServ Corp",
    )
    assert response.opportunity_type == "placement"


# ---------------------------------------------------------------------------
# Test: Valid transition map completeness
# ---------------------------------------------------------------------------

def test_transition_map_completeness():
    """Verify the transition map covers all expected state flows."""
    assert "applied" in VALID_APPLICATION_TRANSITIONS
    assert "shortlisted" in VALID_APPLICATION_TRANSITIONS
    assert "offered" in VALID_APPLICATION_TRANSITIONS
    # Terminal states should NOT be in the map
    assert "placed" not in VALID_APPLICATION_TRANSITIONS
    assert "rejected" not in VALID_APPLICATION_TRANSITIONS
