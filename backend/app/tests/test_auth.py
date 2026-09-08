import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.core.database import Base, get_db
from backend.app.main import app
from backend.app.models import models
from backend.app.core.security import hash_password, create_access_token

# Setup in-memory SQLite database for test suite
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database(monkeypatch):
    monkeypatch.setenv("EMAIL_PROVIDER", "dev")
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# --- 1. REGISTRATION TESTS ---

def test_register_student_success():
    payload = {
        "email": "student1@example.com",
        "password": "Password123!",
        "full_name": "Student One",
        "role": "student",
        "institution": "Test University"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "student1@example.com"
    assert data["user"]["role"] == "student"
    assert data["user"]["candidate_id"] is not None


def test_register_duplicate_email():
    payload = {
        "email": "dup@example.com",
        "password": "Password123!",
        "full_name": "Dup User",
        "role": "student"
    }
    res1 = client.post("/api/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


def test_register_invalid_role():
    payload = {
        "email": "badrole@example.com",
        "password": "Password123!",
        "full_name": "Bad Role",
        "role": "superhero"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "Invalid role" in response.json()["detail"]


# --- 2. LOGIN TESTS ---

def test_login_success():
    # Register first
    reg_payload = {
        "email": "recruiter@techcorp.com",
        "password": "SecurePassword123",
        "full_name": "Jane Recruiter",
        "role": "industry",
        "company": "Tech Corp"
    }
    client.post("/api/auth/register", json=reg_payload)

    # Login
    login_payload = {
        "email": "recruiter@techcorp.com",
        "password": "SecurePassword123"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "industry"
    assert data["user"]["company"] == "Tech Corp"


def test_login_invalid_password():
    reg_payload = {
        "email": "user@example.com",
        "password": "CorrectPassword123",
        "full_name": "Test User",
        "role": "student"
    }
    client.post("/api/auth/register", json=reg_payload)

    login_payload = {
        "email": "user@example.com",
        "password": "WrongPassword123"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_nonexistent_user():
    response = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "any"})
    assert response.status_code == 401


# --- 3. ME ENDPOINT & TOKEN VALIDATION ---

def test_auth_me_unauthenticated():
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_auth_me_authenticated():
    reg_res = client.post("/api/auth/register", json={
        "email": "me@example.com",
        "password": "Password123",
        "full_name": "Me User",
        "role": "academia",
        "institution": "IIT Delhi"
    })
    token = reg_res.json()["access_token"]

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["role"] == "academia"
    assert data["institution"] == "IIT Delhi"


def test_auth_me_invalid_token():
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_token_123"})
    assert response.status_code == 401


# --- 4. ROLE-BASED ACCESS CONTROL (RBAC) TESTS ---

def test_student_cannot_create_opportunity():
    reg_res = client.post("/api/auth/register", json={
        "email": "student_no_opp@example.com",
        "password": "Password123",
        "full_name": "Student No Opp",
        "role": "student"
    })
    token = reg_res.json()["access_token"]

    # Activate student account in DB so we test role permission rather than pending account check
    db = TestingSessionLocal()
    u = db.query(models.User).filter(models.User.email == "student_no_opp@example.com").first()
    u.account_status = "active"
    db.commit()
    db.close()

    opp_payload = {
        "title": "Software Engineer",
        "company": "Fake Corp",
        "description": "Test",
        "stipend": 10000.0,
        "location": "Remote",
        "sector": "Tech",
        "required_skills": []
    }
    response = client.post("/api/opportunities", json=opp_payload, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    assert "requires" in response.json()["detail"].lower() or "forbidden" in response.json()["detail"].lower()


def test_register_role_specific_endpoints():
    # Student
    s_res = client.post("/api/auth/register/student", json={
        "full_name": "Role Student",
        "email": "rolestudent@example.com",
        "password": "Password123",
        "college_id_or_enrollment_number": "2026-CS-101",
        "institution": "Delhi Tech",
        "degree": "B.Tech",
        "graduation_year": "2026"
    })
    assert s_res.status_code == 201
    s_data = s_res.json()
    assert s_data["user"]["role"] == "student"
    assert s_data["user"]["account_status"] == "pending_email_verification"
    assert s_data["user"]["graduation_year"] == "2026"
    assert s_data["user"]["college_id_or_enrollment_number"] == "2026-CS-101"

    # Industry
    i_res = client.post("/api/auth/register/industry", json={
        "full_name": "Role Industry Contact",
        "email": "roleindustry@corp.com",
        "password": "Password123",
        "company_name": "Corp Inc",
        "industry_sector": "Information Technology",
        "website": "https://corp.com",
        "designation": "HR Manager"
    })
    assert i_res.status_code == 201
    i_data = i_res.json()
    assert i_data["user"]["role"] == "industry"
    assert i_data["user"]["account_status"] == "pending_email_verification"
    assert i_data["user"]["company"] == "Corp Inc"
    assert i_data["user"]["designation"] == "HR Manager"

    # Academia
    a_res = client.post("/api/auth/register/academia", json={
        "full_name": "Role Academia Admin",
        "email": "roleacademia@university.edu",
        "password": "Password123",
        "institution_name": "State University",
        "institution_type": "University",
        "official_domain": "university.edu",
        "designation": "Registrar"
    })
    assert a_res.status_code == 201
    a_data = a_res.json()
    assert a_data["user"]["role"] == "academia"
    assert a_data["user"]["account_status"] == "pending_email_verification"
    assert a_data["user"]["institution"] == "State University"


def test_industry_creates_opportunity_when_active():
    reg_res = client.post("/api/auth/register/industry", json={
        "full_name": "Recruiter User",
        "email": "industry_creator@corp.com",
        "password": "Password123",
        "company_name": "Tech Corp",
        "industry_sector": "IT",
        "website": "https://techcorp.com"
    })
    data = reg_res.json()
    assert data["user"]["account_status"] == "pending_email_verification"
    token = data["access_token"]

    opp_payload = {
        "title": "Data Analyst Intern",
        "company": "DataCorp",
        "description": "Analyze data",
        "stipend": 15000.0,
        "location": "Mumbai",
        "sector": "Analytics",
        "required_skills": []
    }
    # Pending verification -> 403
    p_res = client.post("/api/opportunities", json=opp_payload, headers={"Authorization": f"Bearer {token}"})
    assert p_res.status_code == 403

    # Activate account in DB for test
    db = TestingSessionLocal()
    u = db.query(models.User).filter(models.User.email == "industry_creator@corp.com").first()
    u.account_status = "active"
    db.commit()
    db.close()

    # Active user -> 200
    response = client.post("/api/opportunities", json=opp_payload, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["title"] == "Data Analyst Intern"


def test_student_views_own_dna_and_blocked_for_other():
    # Register Student 1
    s1_res = client.post("/api/auth/register/student", json={
        "email": "s1@example.com", "password": "Password123", "full_name": "Student One", "college_id_or_enrollment_number": "2026-CS-001"
    }).json()
    token_s1 = s1_res["access_token"]
    cand1_id = s1_res["user"]["candidate_id"]

    # Register Student 2
    s2_res = client.post("/api/auth/register/student", json={
        "email": "s2@example.com", "password": "Password123", "full_name": "Student Two", "college_id_or_enrollment_number": "2026-CS-002"
    }).json()
    cand2_id = s2_res["user"]["candidate_id"]

    # Activate students in DB for active testing
    db = TestingSessionLocal()
    u1 = db.query(models.User).filter(models.User.email == "s1@example.com").first()
    u2 = db.query(models.User).filter(models.User.email == "s2@example.com").first()
    u1.account_status = "active"
    u2.account_status = "active"
    db.commit()
    db.close()

    # Student 1 views own DNA
    r1 = client.get(f"/api/candidates/{cand1_id}/dna", headers={"Authorization": f"Bearer {token_s1}"})
    assert r1.status_code == 200

    # Student 1 attempts to view Student 2's DNA -> 403
    r2 = client.get(f"/api/candidates/{cand2_id}/dna", headers={"Authorization": f"Bearer {token_s1}"})
    assert r2.status_code == 403
    assert "Students are only allowed to access their own candidate data" in r2.json()["detail"]


def test_student_cannot_view_opportunity_applications():
    # Register student
    s_res = client.post("/api/auth/register/student", json={
        "email": "app_viewer@example.com", "password": "Password123", "full_name": "App Viewer", "college_id_or_enrollment_number": "2026-CS-003"
    }).json()
    token = s_res["access_token"]

    # Activate student account in DB to test role restrictions
    db = TestingSessionLocal()
    u = db.query(models.User).filter(models.User.email == "app_viewer@example.com").first()
    u.account_status = "active"
    db.commit()
    db.close()

    response = client.get("/api/opportunities/1/applications", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    assert "requires one of roles" in response.json()["detail"] or "forbidden" in response.json()["detail"].lower()


def test_student_cannot_access_institution_dashboard():
    s_res = client.post("/api/auth/register/student", json={
        "email": "dash_student@example.com", "password": "Password123", "full_name": "Dash Student", "college_id_or_enrollment_number": "2026-CS-004"
    }).json()
    token = s_res["access_token"]

    # Activate student account in DB to test role restrictions
    db = TestingSessionLocal()
    u = db.query(models.User).filter(models.User.email == "dash_student@example.com").first()
    u.account_status = "active"
    db.commit()
    db.close()

    response = client.get("/api/analytics/institution-dashboard", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    assert "requires one of roles" in response.json()["detail"] or "forbidden" in response.json()["detail"].lower()


def test_student_registration_validation_errors():
    # 1. Missing college_id_or_enrollment_number -> 422 validation error
    missing_id_res = client.post("/api/auth/register/student", json={
        "email": "noid@example.com",
        "password": "Password123",
        "full_name": "No ID Student"
    })
    assert missing_id_res.status_code == 422

    # 2. Invalid Email format -> 422 validation error
    invalid_email_res = client.post("/api/auth/register/student", json={
        "email": "not-an-email",
        "password": "Password123",
        "full_name": "Invalid Email",
        "college_id_or_enrollment_number": "2026-CS-005"
    })
    assert invalid_email_res.status_code == 422

    # 3. Weak password (<6 chars) -> 422 validation error
    weak_pwd_res = client.post("/api/auth/register/student", json={
        "email": "weakpwd@example.com",
        "password": "123",
        "full_name": "Weak Pwd",
        "college_id_or_enrollment_number": "2026-CS-006"
    })
    assert weak_pwd_res.status_code == 422


def test_academia_can_access_institution_dashboard():
    a_res = client.post("/api/auth/register/academia", json={
        "full_name": "Dean Smith",
        "email": "academia_user@school.edu",
        "password": "Password123",
        "institution_name": "IIT Delhi"
    }).json()
    assert a_res["user"]["account_status"] == "pending_email_verification"
    token = a_res["access_token"]

    # Pending -> 403
    p_res = client.get("/api/analytics/institution-dashboard", headers={"Authorization": f"Bearer {token}"})
    assert p_res.status_code == 403

    # Activate account in DB
    db = TestingSessionLocal()
    u = db.query(models.User).filter(models.User.email == "academia_user@school.edu").first()
    u.account_status = "active"
    db.commit()
    db.close()

    # Active -> 200
    response = client.get("/api/analytics/institution-dashboard", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert "total_students" in response.json()


# --- PHASE 1.5 DETAILED EMAIL OTP & ADMIN AUDIT TESTS ---

def test_email_provider_explicit_configuration():
    from backend.app.services.email import DevelopmentEmailService, ResendEmailService, get_email_service

    # Development provider returns DevelopmentEmailService
    dev_svc = get_email_service()
    assert isinstance(dev_svc, DevelopmentEmailService)

    # Resend provider without API key raises ValueError explicitly
    with pytest.raises(ValueError) as exc_info:
        ResendEmailService(api_key=None, email_from=None)
    assert "RESEND_API_KEY" in str(exc_info.value)


def test_otp_security_and_verification_flow():
    from datetime import datetime, timedelta
    from backend.app.core.security import hash_otp

    # 1. Register student
    reg_res = client.post("/api/auth/register/student", json={
        "email": "otp_test_student@example.com",
        "password": "Password123!",
        "full_name": "OTP Student",
        "college_id_or_enrollment_number": "2026-CS-007"
    })
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert reg_data["user"]["account_status"] == "pending_email_verification"

    # Verify raw OTP is NOT in API response
    assert "otp" not in reg_data
    assert "code" not in reg_data
    assert "verification_code" not in reg_data

    # Fetch OTP from DB to inspect security
    db = TestingSessionLocal()
    user = db.query(models.User).filter(models.User.email == "otp_test_student@example.com").first()
    ver_code = db.query(models.VerificationCode).filter(models.VerificationCode.user_id == user.id).first()
    
    # Check plaintext OTP is NOT in database
    assert len(ver_code.code_hash) == 64  # SHA256 hex digest length
    assert not hasattr(ver_code, "code")

    # 2. Wrong OTP fails verification
    wrong_res = client.post("/api/auth/verify-email", json={
        "email": "otp_test_student@example.com",
        "otp": "000000"
    })
    assert wrong_res.status_code == 400
    assert "Invalid verification code" in wrong_res.json()["detail"]

    # 3. Inject known code hash in DB to simulate receiving OTP via email
    test_otp = "654321"
    ver_code.code_hash = hash_otp(test_otp)
    db.commit()
    db.close()

    # 4. Correct OTP succeeds verification for student -> transitions to active
    correct_res = client.post("/api/auth/verify-email", json={
        "email": "otp_test_student@example.com",
        "otp": "654321"
    })
    assert correct_res.status_code == 200
    correct_data = correct_res.json()
    assert correct_data["user"]["account_status"] == "active"
    assert correct_data["user"]["email_verified_at"] is not None

    # 5. Used OTP cannot be reused
    reuse_res = client.post("/api/auth/verify-email", json={
        "email": "otp_test_student@example.com",
        "otp": "654321"
    })
    assert reuse_res.status_code == 400
    assert "expired or is invalid" in reuse_res.json()["detail"].lower()


def test_otp_expiry_and_attempt_limits():
    from datetime import datetime, timedelta
    from backend.app.core.security import hash_otp

    client.post("/api/auth/register/student", json={
        "email": "expiry_student@example.com",
        "password": "Password123!",
        "full_name": "Expiry Student",
        "college_id_or_enrollment_number": "2026-CS-008"
    })

    db = TestingSessionLocal()
    user = db.query(models.User).filter(models.User.email == "expiry_student@example.com").first()
    ver_code = db.query(models.VerificationCode).filter(models.VerificationCode.user_id == user.id).first()
    test_otp = "123456"
    ver_code.code_hash = hash_otp(test_otp)
    ver_code.expires_at = datetime.utcnow() - timedelta(minutes=1)  # Expire
    db.commit()
    db.close()

    # Expired code fails
    exp_res = client.post("/api/auth/verify-email", json={
        "email": "expiry_student@example.com",
        "otp": "123456"
    })
    assert exp_res.status_code == 400
    assert "expired" in exp_res.json()["detail"].lower()


def test_admin_verification_workflow_and_audit_trail():
    from backend.app.core.security import hash_otp

    # 1. Register Industry user
    ind_res = client.post("/api/auth/register/industry", json={
        "email": "ind_audit@company.com",
        "password": "Password123!",
        "full_name": "Industry Audit",
        "company_name": "Audit Corp"
    }).json()

    # 2. Verify email -> transitions to pending_verification
    db = TestingSessionLocal()
    ind_user = db.query(models.User).filter(models.User.email == "ind_audit@company.com").first()
    ind_user_id = ind_user.id
    ver_code = db.query(models.VerificationCode).filter(models.VerificationCode.user_id == ind_user.id).first()
    test_otp = "112233"
    ver_code.code_hash = hash_otp(test_otp)
    db.commit()
    db.close()

    v_res = client.post("/api/auth/verify-email", json={"email": "ind_audit@company.com", "otp": "112233"})
    assert v_res.status_code == 200
    assert v_res.json()["user"]["account_status"] == "pending_verification"

    # 3. Create platform admin user
    db = TestingSessionLocal()
    admin_user = models.User(
        email="admin_audit@platform.com",
        password_hash=hash_password("AdminPass123!"),
        full_name="Platform Admin",
        role="admin",
        account_status="active"
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    admin_user_id = admin_user.id
    admin_token = create_access_token({"sub": str(admin_user.id), "role": "admin"})
    db.close()

    # 4. Admin views pending verifications queue
    queue_res = client.get("/api/admin/verifications", headers={"Authorization": f"Bearer {admin_token}"})
    assert queue_res.status_code == 200
    queue_emails = [item["email"] for item in queue_res.json()]
    assert "ind_audit@company.com" in queue_emails

    # 5. Non-admin accessing admin endpoint gets 403
    non_admin_token = ind_res["access_token"]
    na_res = client.get("/api/admin/verifications", headers={"Authorization": f"Bearer {non_admin_token}"})
    assert na_res.status_code == 403

    # 6. Admin approves user -> check status and AuditLog creation
    app_res = client.patch(f"/api/admin/users/{ind_user_id}/approve", headers={"Authorization": f"Bearer {admin_token}"})
    assert app_res.status_code == 200
    assert app_res.json()["account_status"] == "active"

    # Check Audit Log in DB
    db = TestingSessionLocal()
    logs = db.query(models.VerificationAuditLog).filter(models.VerificationAuditLog.target_user_id == ind_user_id).all()
    assert len(logs) == 1
    assert logs[0].action == "approve"
    assert logs[0].previous_status == "pending_verification"
    assert logs[0].new_status == "active"
    assert logs[0].admin_user_id == admin_user_id
    db.close()

    # 7. Admin suspends user
    susp_res = client.patch(f"/api/admin/users/{ind_user_id}/suspend", json={"reason": "Policy violation"}, headers={"Authorization": f"Bearer {admin_token}"})
    assert susp_res.status_code == 200
    assert susp_res.json()["account_status"] == "suspended"

    # 8. Admin reactivates user
    react_res = client.patch(f"/api/admin/users/{ind_user_id}/reactivate", json={"reason": "Appeal accepted"}, headers={"Authorization": f"Bearer {admin_token}"})
    assert react_res.status_code == 200
    assert react_res.json()["account_status"] == "active"

    # 9. Verify admin audit log retrieval endpoint
    audit_res = client.get(f"/api/admin/users/{ind_user_id}/audit-logs", headers={"Authorization": f"Bearer {admin_token}"})
    assert audit_res.status_code == 200
    audit_data = audit_res.json()
    assert len(audit_data) == 3  # approve, suspend, reactivate
    actions = [a["action"] for a in audit_data]
    assert set(actions) == {"approve", "suspend", "reactivate"}


def test_email_service_resend_missing_config_fails(monkeypatch):
    from backend.app.services.email import get_email_service
    from backend.app.core.config import settings

    monkeypatch.setenv("EMAIL_PROVIDER", "resend")
    monkeypatch.setenv("RESEND_API_KEY", "")
    monkeypatch.setenv("EMAIL_FROM", "")
    monkeypatch.setattr(settings, "RESEND_API_KEY", "")
    monkeypatch.setattr(settings, "EMAIL_FROM", "")

    with pytest.raises(ValueError) as exc_info:
        get_email_service()
    assert "RESEND_API_KEY and EMAIL_FROM environment variables are required" in str(exc_info.value)


def test_resend_verification_cooldown_and_new_otp():
    reg_res = client.post("/api/auth/register/student", json={
        "email": "cooldown_test@example.com",
        "password": "Password123!",
        "full_name": "Cooldown Student",
        "college_id_or_enrollment_number": "2026-CS-009"
    })
    assert reg_res.status_code == 201

    # Immediate resend should trigger 429 cooldown
    resend1 = client.post("/api/auth/resend-verification", json={"email": "cooldown_test@example.com"})
    assert resend1.status_code == 429
    assert "wait 60 seconds" in resend1.json()["detail"].lower()


def test_resend_email_service_constructed_and_invoked():
    from unittest.mock import patch, MagicMock
    import json
    from backend.app.services.email import ResendEmailService

    resend_svc = ResendEmailService(api_key="re_dummy_key_12345", email_from="noreply@opportunity-dna.in")

    with patch("urllib.request.urlopen") as mock_urlopen:
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.__enter__.return_value = mock_resp
        mock_urlopen.return_value = mock_resp

        resend_svc.send_verification_otp("user@example.com", "Test User", "123456")

        assert mock_urlopen.called
        req = mock_urlopen.call_args[0][0]
        assert req.full_url == "https://api.resend.com/emails"
        assert req.headers["Authorization"] == "Bearer re_dummy_key_12345"
        assert req.headers["Content-type"] == "application/json"

        body = json.loads(req.data.decode("utf-8"))
        assert body["from"] == "noreply@opportunity-dna.in"
        assert body["to"] == ["user@example.com"]
        assert body["subject"] == "Verify your SkillForge account"
        assert "123456" in body["html"]


def test_pending_student_all_private_endpoints_denied():
    # 1. Register student -> pending_email_verification
    reg_res = client.post("/api/auth/register/student", json={
        "email": "pending_student_security@example.com",
        "password": "Password123!",
        "full_name": "Pending Security Student",
        "college_id_or_enrollment_number": "2026-CS-999"
    })
    assert reg_res.status_code == 201
    data = reg_res.json()
    token = data["access_token"]
    cand_id = data["user"]["candidate_id"]
    headers = {"Authorization": f"Bearer {token}"}

    # /api/auth/me MUST return 200 OK for pending users so frontend can inspect account_status
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["account_status"] == "pending_email_verification"

    # All private endpoints MUST return 403 Forbidden for pending users
    private_get_endpoints = [
        "/api/candidates",
        "/api/opportunities",
        "/api/skills",
        f"/api/candidates/{cand_id}/dna",
        f"/api/candidates/{cand_id}/eligibility",
        f"/api/candidates/{cand_id}/matches",
        f"/api/candidates/{cand_id}/opportunities/1/readiness",
        f"/api/candidates/{cand_id}/opportunities/1/roadmap",
        f"/api/candidates/{cand_id}/applications",
        "/api/analytics/institution-dashboard",
        "/api/analytics/skill-demand",
    ]

    for endpoint in private_get_endpoints:
        res = client.get(endpoint, headers=headers)
        assert res.status_code == 403, f"Endpoint {endpoint} allowed access to pending user! Got status {res.status_code}"
        assert "Account status is 'pending_email_verification'" in res.json()["detail"] or "requires" in res.json()["detail"] or "forbidden" in res.json()["detail"].lower()


def test_critical_jwt_token_auth_lifecycle():
    from backend.app.core.security import hash_otp

    # 1. Register student -> get token (pending_email_verification)
    reg_res = client.post("/api/auth/register/student", json={
        "email": "lifecycle_student@example.com",
        "password": "Password123!",
        "full_name": "Lifecycle Student",
        "college_id_or_enrollment_number": "2026-CS-888"
    })
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Attempt private endpoint (/api/opportunities) -> 403 Forbidden
    opp_res1 = client.get("/api/opportunities", headers=headers)
    assert opp_res1.status_code == 403

    # 3. Verify OTP -> user account transitions to 'active'
    db = TestingSessionLocal()
    user = db.query(models.User).filter(models.User.email == "lifecycle_student@example.com").first()
    ver_code = db.query(models.VerificationCode).filter(models.VerificationCode.user_id == user.id).first()
    ver_code.code_hash = hash_otp("888888")
    db.commit()
    db.close()

    verify_res = client.post("/api/auth/verify-email", json={
        "email": "lifecycle_student@example.com",
        "otp": "888888"
    })
    assert verify_res.status_code == 200
    assert verify_res.json()["user"]["account_status"] == "active"

    # 4. Call /api/opportunities with SAME JWT token -> 200 OK
    opp_res2 = client.get("/api/opportunities", headers=headers)
    assert opp_res2.status_code == 200


def test_pending_industry_and_academia_restrictions():
    from backend.app.core.security import hash_otp

    # 1. Register Industry user
    ind_res = client.post("/api/auth/register/industry", json={
        "email": "pending_ind@corp.com",
        "password": "Password123!",
        "full_name": "Pending Industry",
        "company_name": "Pending Corp"
    }).json()
    ind_token = ind_res["access_token"]
    ind_headers = {"Authorization": f"Bearer {ind_token}"}

    # Stage 1: pending_email_verification -> 403
    assert client.get("/api/opportunities", headers=ind_headers).status_code == 403

    # Verify Email OTP -> transition to Stage 2: pending_verification
    db = TestingSessionLocal()
    ind_user = db.query(models.User).filter(models.User.email == "pending_ind@corp.com").first()
    ver_code = db.query(models.VerificationCode).filter(models.VerificationCode.user_id == ind_user.id).first()
    ver_code.code_hash = hash_otp("777777")
    db.commit()
    db.close()

    v1_res = client.post("/api/auth/verify-email", json={"email": "pending_ind@corp.com", "otp": "777777"})
    assert v1_res.json()["user"]["account_status"] == "pending_verification"

    # Stage 2: pending_verification -> STILL 403 for private/creation routes
    opp_create_payload = {
        "title": "Blocked Opp", "company": "Pending Corp", "description": "Test",
        "stipend": 10000.0, "location": "Remote", "sector": "Tech", "required_skills": []
    }
    assert client.post("/api/opportunities", json=opp_create_payload, headers=ind_headers).status_code == 403

    # 2. Register Academia user
    acad_res = client.post("/api/auth/register/academia", json={
        "email": "pending_acad@college.edu",
        "password": "Password123!",
        "full_name": "Pending Academia",
        "institution_name": "Pending College"
    }).json()
    acad_token = acad_res["access_token"]
    acad_headers = {"Authorization": f"Bearer {acad_token}"}

    # Stage 1: pending_email_verification -> 403
    assert client.get("/api/analytics/institution-dashboard", headers=acad_headers).status_code == 403

    # Verify Email OTP -> transition to Stage 2: pending_verification
    db = TestingSessionLocal()
    acad_user = db.query(models.User).filter(models.User.email == "pending_acad@college.edu").first()
    ver_code2 = db.query(models.VerificationCode).filter(models.VerificationCode.user_id == acad_user.id).first()
    ver_code2.code_hash = hash_otp("666666")
    db.commit()
    db.close()

    v2_res = client.post("/api/auth/verify-email", json={"email": "pending_acad@college.edu", "otp": "666666"})
    assert v2_res.json()["user"]["account_status"] == "pending_verification"

    # Stage 2: pending_verification -> STILL 403 for analytics dashboard
    assert client.get("/api/analytics/institution-dashboard", headers=acad_headers).status_code == 403





