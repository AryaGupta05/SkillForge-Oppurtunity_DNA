import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.core.database import Base, get_db
from backend.app.main import app
from backend.app.models import models
from backend.app.core.security import hash_password, create_access_token

acad_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocalAcademia = sessionmaker(autocommit=False, autoflush=False, bind=acad_engine)

def override_get_db_acad():
    try:
        db = TestingSessionLocalAcademia()
        yield db
    finally:
        db.close()

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    app.dependency_overrides[get_db] = override_get_db_acad
    Base.metadata.drop_all(bind=acad_engine)
    Base.metadata.create_all(bind=acad_engine)
    db = TestingSessionLocalAcademia()

    # Academia 1 (IIT Bombay)
    u_acad1 = models.User(
        email="academia1@iitb.ac.in",
        password_hash=hash_password("Password123!"),
        full_name="Prof. Sharma",
        role="academia",
        institution="IIT Bombay",
        account_status="active",
        is_active=True
    )
    db.add(u_acad1)

    # Academia 2 (BITS Pilani)
    u_acad2 = models.User(
        email="academia2@bits.ac.in",
        password_hash=hash_password("Password123!"),
        full_name="Prof. Verma",
        role="academia",
        institution="BITS Pilani",
        account_status="active",
        is_active=True
    )
    db.add(u_acad2)

    # Admin
    u_admin = models.User(
        email="admin@opportunity-dna.in",
        password_hash=hash_password("Password123!"),
        full_name="Admin User",
        role="admin",
        account_status="active",
        is_active=True
    )
    db.add(u_admin)

    # Student 1 (IIT Bombay)
    u_stud1 = models.User(
        email="student1@iitb.ac.in",
        password_hash=hash_password("Password123!"),
        full_name="Student One",
        role="student",
        institution="IIT Bombay",
        account_status="active",
        is_active=True
    )
    db.add(u_stud1)

    # Student 2 (BITS Pilani)
    u_stud2 = models.User(
        email="student2@bits.ac.in",
        password_hash=hash_password("Password123!"),
        full_name="Student Two",
        role="student",
        institution="BITS Pilani",
        account_status="active",
        is_active=True
    )
    db.add(u_stud2)

    # Industry User
    u_ind = models.User(
        email="industry@company.com",
        password_hash=hash_password("Password123!"),
        full_name="Industry Recruiter",
        role="industry",
        company="TechCorp",
        account_status="active",
        is_active=True
    )
    db.add(u_ind)

    db.commit()

    # Candidates
    c1 = models.Candidate(
        name="Aarav Sharma",
        email="student1@iitb.ac.in",
        user_id=u_stud1.id,
        institution="IIT Bombay",
        highest_degree="B.Tech"
    )
    c2 = models.Candidate(
        name="Rohan Verma",
        email="student2@bits.ac.in",
        user_id=u_stud2.id,
        institution="BITS Pilani",
        highest_degree="M.Tech"
    )
    db.add(c1)
    db.add(c2)
    db.commit()

    # Skills
    s1 = models.Skill(name="Python", category="Programming")
    s2 = models.Skill(name="SQL", category="Database")
    db.add(s1)
    db.add(s2)
    db.commit()

    cs1 = models.CandidateSkill(candidate_id=c1.id, skill_id=s1.id, confidence=0.9, skill_type="technical")
    cs2 = models.CandidateSkill(candidate_id=c2.id, skill_id=s2.id, confidence=0.8, skill_type="technical")
    db.add(cs1)
    db.add(cs2)

    # Opportunity
    opp = models.Opportunity(
        title="Software Intern",
        company="TechCorp",
        posted_by_user_id=u_ind.id,
        type="internship"
    )
    db.add(opp)
    db.commit()

    # Application for Candidate 1
    app1 = models.Application(
        candidate_id=c1.id,
        opportunity_id=opp.id,
        status="shortlisted"
    )
    db.add(app1)

    # Recommendation for Candidate 1
    rec1 = models.Recommendation(
        candidate_id=c1.id,
        opportunity_id=opp.id,
        match_score=0.85
    )
    db.add(rec1)

    # Evidence for Candidate 1
    ev1 = models.Evidence(
        candidate_id=c1.id,
        type="project",
        title="AI Chatbot",
        source="GitHub"
    )
    db.add(ev1)

    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=acad_engine)
    app.dependency_overrides.pop(get_db, None)


def get_token(email: str, role: str) -> str:
    db = TestingSessionLocalAcademia()
    user = db.query(models.User).filter(models.User.email == email).first()
    token = create_access_token({"sub": str(user.id), "role": role})
    db.close()
    return f"Bearer {token}"


def test_academia_only_sees_own_institution_candidates():
    """Test A: Academia 1 sees only IIT Bombay candidates, Academia 2 sees only BITS Pilani candidates."""
    token1 = get_token("academia1@iitb.ac.in", "academia")
    res1 = client.get("/api/candidates", headers={"Authorization": token1})
    assert res1.status_code == 200
    data1 = res1.json()
    assert len(data1) == 1
    assert data1[0]["institution"] == "IIT Bombay"

    token2 = get_token("academia2@bits.ac.in", "academia")
    res2 = client.get("/api/candidates", headers={"Authorization": token2})
    assert res2.status_code == 200
    data2 = res2.json()
    assert len(data2) == 1
    assert data2[0]["institution"] == "BITS Pilani"


def test_academia_cross_institution_candidate_detail_forbidden():
    """Test B: Academia 1 trying to GET /candidates/{candidate_id_bits} receives 403 Forbidden."""
    db = TestingSessionLocalAcademia()
    cand2 = db.query(models.Candidate).filter(models.Candidate.institution == "BITS Pilani").first()
    db.close()

    token1 = get_token("academia1@iitb.ac.in", "academia")
    res = client.get(f"/api/candidates/{cand2.id}", headers={"Authorization": token1})
    assert res.status_code == 403
    assert "own institution" in res.json()["detail"].lower()


def test_academia_cross_institution_candidate_dna_forbidden():
    """Test C: Academia 1 trying to GET /candidates/{candidate_id_bits}/dna receives 403 Forbidden."""
    db = TestingSessionLocalAcademia()
    cand2 = db.query(models.Candidate).filter(models.Candidate.institution == "BITS Pilani").first()
    db.close()

    token1 = get_token("academia1@iitb.ac.in", "academia")
    res = client.get(f"/api/candidates/{cand2.id}/dna", headers={"Authorization": token1})
    assert res.status_code == 403


def test_academia_cross_institution_candidate_evidence_forbidden():
    """Test D: Academia 1 trying to GET /candidates/{candidate_id_bits}/evidence receives 403 Forbidden."""
    db = TestingSessionLocalAcademia()
    cand2 = db.query(models.Candidate).filter(models.Candidate.institution == "BITS Pilani").first()
    db.close()

    token1 = get_token("academia1@iitb.ac.in", "academia")
    res = client.get(f"/api/candidates/{cand2.id}/evidence", headers={"Authorization": token1})
    assert res.status_code == 403


def test_academia_cross_institution_candidate_skills_forbidden():
    """Test E: Academia 1 trying to GET /candidates/{candidate_id_bits}/skills receives 403 Forbidden."""
    db = TestingSessionLocalAcademia()
    cand2 = db.query(models.Candidate).filter(models.Candidate.institution == "BITS Pilani").first()
    db.close()

    token1 = get_token("academia1@iitb.ac.in", "academia")
    res = client.get(f"/api/candidates/{cand2.id}/skills", headers={"Authorization": token1})
    assert res.status_code == 403


def test_admin_retains_cross_institution_access():
    """Test F: Admin receives all candidates and details across institutions."""
    token = get_token("admin@opportunity-dna.in", "admin")
    res = client.get("/api/candidates", headers={"Authorization": token})
    assert res.status_code == 200
    assert len(res.json()) == 2

    db = TestingSessionLocalAcademia()
    cands = db.query(models.Candidate).all()
    db.close()

    for c in cands:
        r = client.get(f"/api/candidates/{c.id}", headers={"Authorization": token})
        assert r.status_code == 200


def test_institution_dashboard_scoped_strictly():
    """Test G: Institution dashboard numbers are scoped to the user's institution."""
    token1 = get_token("academia1@iitb.ac.in", "academia")
    res1 = client.get("/api/analytics/institution-dashboard", headers={"Authorization": token1})
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["total_students"] == 1
    assert data1["application_stats"]["total"] == 1
    assert data1["application_stats"]["shortlisted"] == 1

    token2 = get_token("academia2@bits.ac.in", "academia")
    res2 = client.get("/api/analytics/institution-dashboard", headers={"Authorization": token2})
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["total_students"] == 1
    assert data2["application_stats"]["total"] == 0


def test_student_and_industry_access_unaffected():
    """Test H: Student and Industry authorization rules remain active."""
    db = TestingSessionLocalAcademia()
    c1 = db.query(models.Candidate).filter(models.Candidate.institution == "IIT Bombay").first()
    c2 = db.query(models.Candidate).filter(models.Candidate.institution == "BITS Pilani").first()
    db.close()

    t_stud1 = get_token("student1@iitb.ac.in", "student")
    # Student 1 can access own candidate detail
    assert client.get(f"/api/candidates/{c1.id}", headers={"Authorization": t_stud1}).status_code == 200
    # Student 1 cannot access Student 2 candidate detail
    assert client.get(f"/api/candidates/{c2.id}", headers={"Authorization": t_stud1}).status_code == 403

    t_ind = get_token("industry@company.com", "industry")
    # Industry recruiter can view list of all candidates
    assert client.get("/api/candidates", headers={"Authorization": t_ind}).status_code == 200


def test_academia_user_without_institution_safe_fallback():
    """Test I: Academia user with empty institution receives empty candidate list and 0 stats cleanly."""
    db = TestingSessionLocalAcademia()
    no_inst_user = models.User(
        email="noinst@academia.com",
        password_hash=hash_password("Password123!"),
        full_name="No Inst Professor",
        role="academia",
        institution=None,
        account_status="active",
        is_active=True
    )
    db.add(no_inst_user)
    db.commit()
    db.close()

    token = get_token("noinst@academia.com", "academia")
    res_list = client.get("/api/candidates", headers={"Authorization": token})
    assert res_list.status_code == 200
    assert res_list.json() == []

    res_dash = client.get("/api/analytics/institution-dashboard", headers={"Authorization": token})
    assert res_dash.status_code == 200
    assert res_dash.json()["total_students"] == 0
