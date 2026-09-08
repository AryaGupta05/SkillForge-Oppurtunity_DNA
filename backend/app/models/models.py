import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # student, industry, academia, admin
    is_active = Column(Boolean, default=True, nullable=False)
    account_status = Column(String, default="active", nullable=False)  # active, pending_email_verification, pending_verification, rejected, suspended
    company = Column(String, nullable=True)
    institution = Column(String, nullable=True)
    website = Column(String, nullable=True)
    industry_sector = Column(String, nullable=True)
    organization_type = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    institution_type = Column(String, nullable=True)
    official_domain = Column(String, nullable=True)
    institution_identifier = Column(String, nullable=True)
    graduation_year = Column(String, nullable=True)
    college_id_or_enrollment_number = Column(String, nullable=True)
    
    # Verification & Audit Columns
    email_verified_at = Column(DateTime, nullable=True)
    verification_requested_at = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    verified_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    suspended_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    candidate = relationship("Candidate", back_populates="user", uselist=False)
    posted_opportunities = relationship("Opportunity", back_populates="posted_by_user")


class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    code_hash = Column(String, nullable=False)
    purpose = Column(String, default="email_verification", nullable=False)
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    max_attempts = Column(Integer, default=5, nullable=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", foreign_keys=[user_id])


class VerificationAuditLog(Base):
    __tablename__ = "verification_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    target_user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    admin_user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    action = Column(String, nullable=False)  # approve, reject, suspend, reactivate
    previous_status = Column(String, nullable=False)
    new_status = Column(String, nullable=False)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    target_user = relationship("User", foreign_keys=[target_user_id])
    admin_user = relationship("User", foreign_keys=[admin_user_id])


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    location = Column(String, nullable=True)
    institution = Column(String, nullable=True)  # College/Institution
    gender = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    career_gap_info = Column(Text, nullable=True)  # Career gap details
    github_url = Column(String, nullable=True)
    
    # PM Internship Scheme specific columns
    family_income = Column(Float, default=0.0, nullable=True)
    is_family_govt_employee = Column(Boolean, default=False, nullable=True)
    highest_degree = Column(String, nullable=True)          # e.g., B.Tech, Diploma, ITI, MCA
    institution_is_elite = Column(Boolean, default=False, nullable=True) # IIT/IIM/NIT etc.
    qualification_stream = Column(String, nullable=True)    # e.g., Computer Science, Commerce
    preferred_sector = Column(String, nullable=True)        # e.g., IT, Finance, Retail
    preferred_location = Column(String, nullable=True)      # e.g., Mumbai, New Delhi
    is_full_time_student = Column(Boolean, default=False, nullable=True)
    is_full_time_employed = Column(Boolean, default=False, nullable=True)
    has_prior_nats_naps = Column(Boolean, default=False, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="candidate")
    evidence = relationship("Evidence", back_populates="candidate", cascade="all, delete-orphan")
    skills = relationship("CandidateSkill", back_populates="candidate", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="candidate", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="candidate", cascade="all, delete-orphan")
    bias_audits = relationship("BiasAudit", back_populates="candidate", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    type = Column(String, nullable=False)  # e.g., resume, project, github, certification, hackathon, portfolio, assessment, experience
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    source = Column(String, nullable=True)  # e.g., GitHub, Uploaded PDF, Cert Provider
    source_url = Column(String, nullable=True)
    date = Column(DateTime, nullable=True)
    raw_content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    candidate = relationship("Candidate", back_populates="evidence")
    skill_links = relationship("SkillEvidence", back_populates="evidence", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)  # e.g., Frontend, Cloud, Management
    description = Column(Text, nullable=True)

    # Relationships
    candidate_skills = relationship("CandidateSkill", back_populates="skill", cascade="all, delete-orphan")
    opportunity_skills = relationship("OpportunitySkill", back_populates="skill", cascade="all, delete-orphan")


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    confidence = Column(Float, default=1.0)
    proficiency = Column(String, nullable=True)      # e.g., Beginner, Intermediate, Expert
    evidence_strength = Column(Float, default=1.0)
    skill_type = Column(String, nullable=False)       # explicit, inferred, adjacent

    __table_args__ = (UniqueConstraint('candidate_id', 'skill_id', name='_candidate_skill_uc'),)

    # Relationships
    candidate = relationship("Candidate", back_populates="skills")
    skill = relationship("Skill", back_populates="candidate_skills")
    evidence_links = relationship("SkillEvidence", back_populates="candidate_skill", cascade="all, delete-orphan")


class SkillEvidence(Base):
    __tablename__ = "skill_evidence"

    id = Column(Integer, primary_key=True, index=True)
    candidate_skill_id = Column(Integer, ForeignKey("candidate_skills.id"), nullable=False)
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False)
    confidence = Column(Float, default=1.0)

    # Relationships
    candidate_skill = relationship("CandidateSkill", back_populates="evidence_links")
    evidence = relationship("Evidence", back_populates="skill_links")

    relationship = Column(Text, nullable=True)  # How this evidence supports the skill


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    posted_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # SIH26044: Opportunity classification
    type = Column(String, default="internship", nullable=False)  # internship, placement, project
    duration_months = Column(Integer, nullable=True)
    
    # PM Internship Scheme specific columns
    stipend = Column(Float, default=0.0, nullable=True)
    location = Column(String, nullable=True)
    sector = Column(String, nullable=True)
    allowed_streams = Column(String, nullable=True)          # Comma-separated list e.g. "B.Tech,MCA,Diploma"
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    posted_by_user = relationship("User", back_populates="posted_opportunities")
    required_skills = relationship("OpportunitySkill", back_populates="opportunity", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="opportunity", cascade="all, delete-orphan")
    bias_audits = relationship("BiasAudit", back_populates="opportunity", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="opportunity", cascade="all, delete-orphan")


class OpportunitySkill(Base):
    __tablename__ = "opportunity_skills"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    importance = Column(Float, default=1.0)        # Importance weight, e.g. 0.0 to 1.0
    required_level = Column(String, nullable=True)  # Required proficiency e.g. Intermediate
    requirement_type = Column(String, default="required", nullable=True)  # required or preferred
    evidence_expectation = Column(Text, nullable=True)

    __table_args__ = (UniqueConstraint('opportunity_id', 'skill_id', name='_opportunity_skill_uc'),)

    # Relationships
    opportunity = relationship("Opportunity", back_populates="required_skills")
    skill = relationship("Skill", back_populates="opportunity_skills")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    score = Column(Float, nullable=False)
    assessment_type = Column(String, nullable=False)  # e.g., coding-test, mcq, peer-review

    # Relationships
    candidate = relationship("Candidate", back_populates="assessments")
    skill = relationship("Skill")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    match_score = Column(Float, nullable=False)
    explanation = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)  # Can store JSON as string (e.g. List of key strengths)
    gaps = Column(Text, nullable=True)       # Can store JSON as string (e.g. List of missing skills)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    candidate = relationship("Candidate", back_populates="recommendations")
    opportunity = relationship("Opportunity", back_populates="recommendations")


class BiasAudit(Base):
    __tablename__ = "bias_audits"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    normal_score = Column(Float, nullable=False)
    blind_score = Column(Float, nullable=False)
    score_delta = Column(Float, nullable=False)
    normal_rank = Column(Integer, nullable=True)
    blind_rank = Column(Integer, nullable=True)
    rank_change = Column(Integer, nullable=True)
    affected_attributes = Column(Text, nullable=True)  # JSON-string list of proxy attributes
    explanation = Column(Text, nullable=True)
    risk_level = Column(String, nullable=True)          # e.g., low, medium, high
    audit_type = Column(String, default="blind_comparison", nullable=True) # blind_comparison or counterfactual
    tested_attribute = Column(String, nullable=True)
    original_value = Column(String, nullable=True)
    counterfactual_value = Column(String, nullable=True)
    capability_data_unchanged = Column(Boolean, default=True, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    candidate = relationship("Candidate", back_populates="bias_audits")
    opportunity = relationship("Opportunity", back_populates="bias_audits")


class EmployerProfile(Base):
    __tablename__ = "employer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, unique=True, index=True, nullable=False)
    accessibility_features = Column(Text, nullable=True)
    flexible_work = Column(Text, nullable=True)
    remote_work = Column(Text, nullable=True)
    accommodations = Column(Text, nullable=True)       # Workplace accommodations


class Application(Base):
    """SIH26044: Student application to an internship/placement opportunity."""
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False, index=True)
    status = Column(String, default="applied", nullable=False)  # applied, shortlisted, offered, placed, rejected
    applied_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)
    notes = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint('candidate_id', 'opportunity_id', name='_candidate_opportunity_application_uc'),
    )

    # Relationships
    candidate = relationship("Candidate", back_populates="applications")
    opportunity = relationship("Opportunity", back_populates="applications")
