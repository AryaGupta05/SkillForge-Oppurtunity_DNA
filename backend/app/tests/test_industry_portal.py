import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.core.database import Base, get_db
from backend.app.main import app
from backend.app.models import models
from backend.app.core.security import hash_password, create_access_token

ind_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocalIndustry = sessionmaker(autocommit=False, autoflush=False, bind=ind_engine)

def override_get_db_ind():
    try:
        db = TestingSessionLocalIndustry()
        yield db
    finally:
        db.close()

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    app.dependency_overrides[get_db] = override_get_db_ind
    Base.metadata.create_all(bind=ind_engine)
    db = TestingSessionLocalIndustry()
    
    # Create test users
    u_ind1 = models.User(
        email="recruiter1@org1.com",
        password_hash=hash_password("Password123!"),
        full_name="Recruiter One",
        role="industry",
        company="Org One Pvt Ltd",
        account_status="active",
        is_active=True
    )
    db.add(u_ind1)

    u_ind2 = models.User(
        email="recruiter2@org2.com",
        password_hash=hash_password("Password123!"),
        full_name="Recruiter Two",
        role="industry",
        company="Org Two Pvt Ltd",
        account_status="active",
        is_active=True
    )
    db.add(u_ind2)

    u_admin = models.User(
        email="admin@platform.com",
        password_hash=hash_password("Password123!"),
        full_name="Platform Admin",
        role="admin",
        account_status="active",
        is_active=True
    )
    db.add(u_admin)

    u_student = models.User(
        email="student1@test.com",
        password_hash=hash_password("Password123!"),
        full_name="Student One",
        role="student",
        account_status="active",
        is_active=True
    )
    db.add(u_student)

    db.commit()
    db.refresh(u_ind1)
    db.refresh(u_ind2)
    db.refresh(u_admin)
    db.refresh(u_student)

    cand1 = models.Candidate(
        name="Student One",
        email="student1@test.com",
        user_id=u_student.id
    )
    db.add(cand1)
    db.commit()
    db.refresh(cand1)

    skill = models.Skill(name="TestPython", category="Backend")
    db.add(skill)
    db.commit()
    db.refresh(skill)

    opp1 = models.Opportunity(
        title="Org1 Python Role",
        company="Org One Pvt Ltd",
        posted_by_user_id=u_ind1.id,
        sector="IT",
        stipend=20000.0
    )
    db.add(opp1)
    db.commit()
    db.refresh(opp1)

    opp2 = models.Opportunity(
        title="Org2 Java Role",
        company="Org Two Pvt Ltd",
        posted_by_user_id=u_ind2.id,
        sector="IT",
        stipend=25000.0
    )
    db.add(opp2)
    db.commit()
    db.refresh(opp2)

    app1 = models.Application(
        candidate_id=cand1.id,
        opportunity_id=opp1.id,
        status="applied"
    )
    db.add(app1)
    db.commit()

    db.close()
    yield
    Base.metadata.drop_all(bind=ind_engine)
    app.dependency_overrides.pop(get_db, None)

def get_token(email: str, role: str) -> str:
    db = TestingSessionLocalIndustry()
    user = db.query(models.User).filter(models.User.email == email).first()
    db.close()
    return create_access_token({"sub": str(user.id), "role": role, "email": email})


def test_industry_owner_can_list_own_applications():
    token1 = get_token("recruiter1@org1.com", "industry")
    db = TestingSessionLocalIndustry()
    opp1 = db.query(models.Opportunity).filter(models.Opportunity.title == "Org1 Python Role").first()
    db.close()

    res = client.get(f"/api/opportunities/{opp1.id}/applications", headers={"Authorization": f"Bearer {token1}"})
    assert res.status_code == 200
    apps = res.json()
    assert len(apps) >= 1
    assert apps[0]["opportunity_id"] == opp1.id


def test_industry_recruiter_cannot_list_other_org_applications():
    token2 = get_token("recruiter2@org2.com", "industry")
    db = TestingSessionLocalIndustry()
    opp1 = db.query(models.Opportunity).filter(models.Opportunity.title == "Org1 Python Role").first()
    db.close()

    res = client.get(f"/api/opportunities/{opp1.id}/applications", headers={"Authorization": f"Bearer {token2}"})
    assert res.status_code == 403
    assert "Access forbidden" in res.json()["detail"]


def test_industry_owner_can_update_own_opportunity():
    token1 = get_token("recruiter1@org1.com", "industry")
    db = TestingSessionLocalIndustry()
    opp1 = db.query(models.Opportunity).filter(models.Opportunity.title == "Org1 Python Role").first()
    db.close()

    res = client.put(
        f"/api/opportunities/{opp1.id}",
        json={"title": "Updated Org1 Python Role", "stipend": 22000.0},
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "Updated Org1 Python Role"
    assert data["stipend"] == 22000.0


def test_industry_recruiter_cannot_update_other_org_opportunity():
    token2 = get_token("recruiter2@org2.com", "industry")
    db = TestingSessionLocalIndustry()
    opp1 = db.query(models.Opportunity).filter(models.Opportunity.title.in_(["Org1 Python Role", "Updated Org1 Python Role"])).first()
    db.close()

    res = client.put(
        f"/api/opportunities/{opp1.id}",
        json={"title": "Hacked Title"},
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert res.status_code == 403


def test_industry_owner_can_update_application_status():
    token1 = get_token("recruiter1@org1.com", "industry")
    db = TestingSessionLocalIndustry()
    opp1 = db.query(models.Opportunity).filter(models.Opportunity.title.in_(["Org1 Python Role", "Updated Org1 Python Role"])).first()
    app1 = db.query(models.Application).filter(models.Application.opportunity_id == opp1.id).first()
    app1.status = "applied"
    db.commit()
    app_id = app1.id
    db.close()

    res = client.patch(
        f"/api/applications/{app_id}/status",
        json={"status": "shortlisted", "notes": "Strong Python skillset"},
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "shortlisted"
    assert data["notes"] == "Strong Python skillset"


def test_industry_recruiter_cannot_update_other_org_application_status():
    token2 = get_token("recruiter2@org2.com", "industry")
    db = TestingSessionLocalIndustry()
    opp1 = db.query(models.Opportunity).filter(models.Opportunity.title.in_(["Org1 Python Role", "Updated Org1 Python Role"])).first()
    app1 = db.query(models.Application).filter(models.Application.opportunity_id == opp1.id).first()
    db.close()

    res = client.patch(
        f"/api/applications/{app1.id}/status",
        json={"status": "offered"},
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert res.status_code == 403


def test_admin_can_access_and_update_across_organizations():
    token_admin = get_token("admin@platform.com", "admin")
    db = TestingSessionLocalIndustry()
    opp1 = db.query(models.Opportunity).filter(models.Opportunity.title.in_(["Org1 Python Role", "Updated Org1 Python Role"])).first()
    db.close()

    res1 = client.get(f"/api/opportunities/{opp1.id}/applications", headers={"Authorization": f"Bearer {token_admin}"})
    assert res1.status_code == 200

    res2 = client.put(
        f"/api/opportunities/{opp1.id}",
        json={"stipend": 23000.0},
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert res2.status_code == 200
    assert res2.json()["stipend"] == 23000.0


def test_student_cannot_mutate_application_status():
    token_stu = get_token("student1@test.com", "student")
    db = TestingSessionLocalIndustry()
    app1 = db.query(models.Application).first()
    db.close()

    res = client.patch(
        f"/api/applications/{app1.id}/status",
        json={"status": "offered"},
        headers={"Authorization": f"Bearer {token_stu}"}
    )
    assert res.status_code == 403


def test_my_only_opportunities_scoping():
    token1 = get_token("recruiter1@org1.com", "industry")
    res = client.get("/api/opportunities?my_only=true", headers={"Authorization": f"Bearer {token1}"})
    assert res.status_code == 200
    opps = res.json()
    for o in opps:
        assert o["company"] == "Org One Pvt Ltd"


def test_existing_student_opportunity_discovery_still_works():
    token_stu = get_token("student1@test.com", "student")
    res = client.get("/api/opportunities", headers={"Authorization": f"Bearer {token_stu}"})
    assert res.status_code == 200
    assert len(res.json()) >= 2


def test_invalid_opportunity_returns_404():
    token1 = get_token("recruiter1@org1.com", "industry")
    res = client.get("/api/opportunities/999999/applications", headers={"Authorization": f"Bearer {token1}"})
    assert res.status_code == 404


def test_candidate_skills_cannot_be_modified_by_industry_endpoints():
    token1 = get_token("recruiter1@org1.com", "industry")
    db = TestingSessionLocalIndustry()
    cand = db.query(models.Candidate).first()
    db.close()

    res = client.put(f"/api/candidates/{cand.id}", json={"name": "Hacked Name"}, headers={"Authorization": f"Bearer {token1}"})
    assert res.status_code in [404, 405]


def test_industry_dashboard_analytics_scoping():
    token1 = get_token("recruiter1@org1.com", "industry")
    res1 = client.get("/api/analytics/industry-dashboard", headers={"Authorization": f"Bearer {token1}"})
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["company_name"] == "Org One Pvt Ltd"
    assert data1["total_opportunities"] == 1
    assert data1["total_applications"] == 1

    token_stu = get_token("student1@test.com", "student")
    res_stu = client.get("/api/analytics/industry-dashboard", headers={"Authorization": f"Bearer {token_stu}"})
    assert res_stu.status_code == 403

