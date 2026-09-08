from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

# --- SKILL SCHEMAS ---
class SkillBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# --- EVIDENCE SCHEMAS ---
class EvidenceBase(BaseModel):
    type: str  # resume, project, github, certification, hackathon, portfolio, assessment, experience
    title: str
    description: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    date: Optional[datetime] = None
    raw_content: Optional[str] = None

class EvidenceCreate(EvidenceBase):
    candidate_id: int

class EvidenceResponse(EvidenceBase):
    id: int
    candidate_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- CANDIDATE SKILL SCHEMAS ---
class CandidateSkillBase(BaseModel):
    skill_id: int
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    proficiency: Optional[str] = None
    evidence_strength: float = Field(default=1.0, ge=0.0)
    skill_type: str  # explicit, inferred, adjacent

class CandidateSkillCreate(CandidateSkillBase):
    candidate_id: int

class CandidateSkillResponse(CandidateSkillBase):
    id: int
    candidate_id: int
    skill: SkillResponse
    model_config = ConfigDict(from_attributes=True)


# --- SKILL EVIDENCE SCHEMAS ---
class SkillEvidenceBase(BaseModel):
    candidate_skill_id: int
    evidence_id: int
    relationship: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)

class SkillEvidenceCreate(SkillEvidenceBase):
    pass

class SkillEvidenceResponse(SkillEvidenceBase):
    id: int
    evidence: Optional[EvidenceResponse] = None
    model_config = ConfigDict(from_attributes=True)


# --- CANDIDATE SCHEMAS ---
class CandidateBase(BaseModel):
    name: str
    email: EmailStr
    location: Optional[str] = None
    institution: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    career_gap_info: Optional[str] = None
    github_url: Optional[str] = None
    
    # PM Internship Scheme Specific Fields
    family_income: Optional[float] = 0.0
    is_family_govt_employee: Optional[bool] = False
    highest_degree: Optional[str] = None
    institution_is_elite: Optional[bool] = False
    qualification_stream: Optional[str] = None
    preferred_sector: Optional[str] = None
    preferred_location: Optional[str] = None
    is_full_time_student: Optional[bool] = False
    is_full_time_employed: Optional[bool] = False
    has_prior_nats_naps: Optional[bool] = False

class CandidateCreate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    created_at: datetime
    skills: List[CandidateSkillResponse] = []
    evidence: List[EvidenceResponse] = []
    model_config = ConfigDict(from_attributes=True)


# --- OPPORTUNITY SKILL SCHEMAS ---
class OpportunitySkillBase(BaseModel):
    skill_id: int
    importance: float = Field(default=1.0, ge=0.0, le=1.0)
    required_level: Optional[str] = None
    requirement_type: Optional[str] = "required"
    evidence_expectation: Optional[str] = None

class OpportunitySkillCreate(OpportunitySkillBase):
    pass

class OpportunitySkillResponse(OpportunitySkillBase):
    id: int
    opportunity_id: int
    skill: SkillResponse
    model_config = ConfigDict(from_attributes=True)


# --- OPPORTUNITY SCHEMAS ---
class OpportunityBase(BaseModel):
    title: str
    company: str
    description: Optional[str] = None
    type: Optional[str] = "internship"  # internship, placement, project
    duration_months: Optional[int] = None
    stipend: Optional[float] = 0.0
    location: Optional[str] = None
    sector: Optional[str] = None
    allowed_streams: Optional[str] = None

class OpportunityCreate(OpportunityBase):
    required_skills: List[OpportunitySkillCreate] = []

class OpportunityResponse(OpportunityBase):
    id: int
    created_at: datetime
    required_skills: List[OpportunitySkillResponse] = []
    model_config = ConfigDict(from_attributes=True)


# --- ASSESSMENT SCHEMAS ---
class AssessmentBase(BaseModel):
    skill_id: int
    score: float
    assessment_type: str

class AssessmentCreate(AssessmentBase):
    candidate_id: int

class AssessmentResponse(AssessmentBase):
    id: int
    candidate_id: int
    model_config = ConfigDict(from_attributes=True)


# --- RECOMMENDATION SCHEMAS ---
class RecommendationResponse(BaseModel):
    id: int
    candidate_id: int
    opportunity_id: int
    match_score: float
    explanation: Optional[str] = None
    strengths: Optional[str] = None  # JSON string
    gaps: Optional[str] = None       # JSON string
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- BIAS AUDIT SCHEMAS ---
class BiasAuditResponse(BaseModel):
    id: int
    candidate_id: int
    opportunity_id: int
    normal_score: float
    blind_score: float
    score_delta: float
    normal_rank: Optional[int] = None
    blind_rank: Optional[int] = None
    rank_change: Optional[int] = None
    affected_attributes: Optional[str] = None
    explanation: Optional[str] = None
    risk_level: Optional[str] = None
    audit_type: Optional[str] = "blind_comparison"
    tested_attribute: Optional[str] = None
    original_value: Optional[str] = None
    counterfactual_value: Optional[str] = None
    capability_data_unchanged: Optional[bool] = True
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- EMPLOYER PROFILE SCHEMAS ---
class EmployerProfileBase(BaseModel):
    company: str
    accessibility_features: Optional[str] = None
    flexible_work: Optional[str] = None
    remote_work: Optional[str] = None
    accommodations: Optional[str] = None

class EmployerProfileCreate(EmployerProfileBase):
    pass

class EmployerProfileResponse(EmployerProfileBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# --- AI EVIDENCE EXTRACTION SCHEMAS ---
class AIExtractedEvidenceItem(BaseModel):
    type: str  # e.g., project, experience, internship, certification, hackathon, education, technical_achievement, portfolio_info
    title: str
    description: Optional[str] = None
    source: str = "Resume"
    source_url: Optional[str] = None
    date: Optional[str] = None  # YYYY-MM or YYYY format
    supporting_text: str  # text chunk extracted from resume
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)

class AIExtractedEvidenceList(BaseModel):
    evidence_items: List[AIExtractedEvidenceItem]


# --- AI SKILL DISCOVERY SCHEMAS ---
class AIDiscoveredSkill(BaseModel):
    name: str
    category: str
    skill_type: str  # explicit, inferred, adjacent
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    proficiency: Optional[str] = "Intermediate"  # Beginner, Intermediate, Expert
    evidence_ids: List[int]  # Mapped database IDs of the candidate's evidence backing this skill
    explanation: str

class AIDiscoveredSkillList(BaseModel):
    skills: List[AIDiscoveredSkill]


# --- OPPORTUNITY DNA PROFILE SCHEMAS ---
class LearningProgressionSignal(BaseModel):
    status: str  # sufficient_evidence, insufficient_evidence
    timeline: List[int]  # list of years identified
    description: str
    score: float  # progress score from 0.0 to 1.0

class CapabilitySignalsOut(BaseModel):
    depth: float  # average core skills strength
    breadth: float  # count/index of distinct skill categories
    learning_progression: LearningProgressionSignal
    adaptability: float  # diversity of tech/domains mapped
    evidence_strength: float  # derived metric on amount/confidence of evidence

class OpportunityDNAProfileResponse(BaseModel):
    candidate_id: int
    candidate_name: str
    skills: List[CandidateSkillResponse]
    evidence: List[EvidenceResponse]
    signals: CapabilitySignalsOut


# --- PHASE 3: MATCHING AND JOB INTEL SCHEMAS ---
class AIExtractedJobSkill(BaseModel):
    name: str
    category: str
    importance: float = Field(default=1.0, ge=0.0, le=1.0)
    required_level: Optional[str] = "Intermediate"  # Beginner, Intermediate, Expert
    requirement_type: str = "required"  # required or preferred
    evidence_expectation: Optional[str] = None

class AIExtractedJobSkillList(BaseModel):
    skills: List[AIExtractedJobSkill]

class SkillMatchDetail(BaseModel):
    name: str
    category: str
    requirement_type: str  # required or preferred
    required_level: str
    candidate_level: Optional[str] = None  # None if missing
    match_status: str  # Strong match, Match, Partial match, Skill gap, No evidence
    contribution: float
    confidence: float
    evidence: List[EvidenceResponse] = []

class CandidateMatchResultOut(BaseModel):
    rank: int
    candidate_id: int
    candidate_name: str
    overall_score: float
    strengths: List[str]
    gaps: List[str]
    evidence_strength: float
    skills_breakdown: List[SkillMatchDetail]
    review_status: str = "AI recommendation for human review"

class CompareCandidatesResponse(BaseModel):
    opportunity_id: int
    opportunity_title: str
    company: str
    candidate_matches: List[CandidateMatchResultOut]
    mode: str
    message: str = "AI recommendation for human review"


# --- PHASE 4: BIAS AUDIT GROUP SUMMARY SCHEMAS ---
class GroupBiasAuditDetail(BaseModel):
    candidate_id: int
    candidate_name: str
    normal_rank: int
    blind_rank: int
    rank_change: int
    score_delta: float
    risk_level: str  # low, moderate, high

class GroupBiasAuditSummaryResponse(BaseModel):
    opportunity_id: int
    opportunity_title: str
    company: str
    candidates_audited: int
    rank_changes_count: int
    avg_score_delta: float
    max_score_delta: float
    risk_level: str  # low, moderate, high
    details: List[GroupBiasAuditDetail]
    message: str = "AI fairness evaluation for decision support only"

class CounterfactualAuditPayload(BaseModel):
    candidate_id: int
    opportunity_id: int
    tested_attribute: str  # institution, career_gap, location
    counterfactual_value: str


# --- SIH PMIS SCHEMAS ---

class StudentEligibilityResponse(BaseModel):
    candidate_id: int
    eligible: bool
    passed_checks: List[str]
    failed_checks: List[str]
    verdict_summary: str
    verification_date: str = "2026-08-21"
    source_guideline_url: str = "https://pminternship.mca.gov.in/"


class SkillReadinessDetail(BaseModel):
    skill_name: str
    required_level: str
    candidate_level: Optional[str] = None
    is_met: bool
    weight: float
    potential_contribution: float = 0.0


class ReadinessSimulationResponse(BaseModel):
    candidate_id: int
    opportunity_id: int
    current_readiness_score: float
    projected_readiness_score: float
    missing_skills: List[str]
    skills_breakdown: List[SkillReadinessDetail]


class UpskillingResource(BaseModel):
    type: str  # course, certificate, project
    title: str
    provider: str
    link_url: str
    estimated_hours: int


class SkillGapRoadmap(BaseModel):
    skill_name: str
    gap_severity: str  # Critical, Recommended
    resources: List[UpskillingResource]


class UpskillingRoadmapResponse(BaseModel):
    candidate_id: int
    opportunity_id: int
    gaps: List[SkillGapRoadmap]
    estimated_months_to_ready: float


# --- SIH26044: APPLICATION SCHEMAS ---
class ApplicationCreate(BaseModel):
    candidate_id: int
    opportunity_id: int

class ApplicationStatusUpdate(BaseModel):
    status: str  # shortlisted, offered, placed, rejected
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    candidate_id: int
    opportunity_id: int
    status: str
    applied_at: datetime
    updated_at: datetime
    notes: Optional[str] = None
    candidate_name: Optional[str] = None
    opportunity_title: Optional[str] = None
    opportunity_company: Optional[str] = None
    opportunity_type: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# --- SIH26044: ANALYTICS SCHEMAS ---
class SkillDemandItem(BaseModel):
    skill_name: str
    category: str
    opportunity_count: int
    percentage: float
    internship_count: int = 0
    placement_count: int = 0

class SkillDemandResponse(BaseModel):
    total_opportunities: int
    skills: List[SkillDemandItem]


class SkillSupplyItem(BaseModel):
    skill_name: str
    student_count: int

class SkillGapItem(BaseModel):
    skill_name: str
    demand_count: int
    supply_count: int
    gap: int  # demand - supply; positive = undersupply

class InstitutionDashboardResponse(BaseModel):
    total_students: int
    total_opportunities: int
    internship_count: int
    placement_count: int
    project_count: int
    top_student_skills: List[SkillSupplyItem]
    top_demanded_skills: List[SkillDemandItem]
    skill_gaps: List[SkillGapItem]
    application_stats: dict  # {applied, shortlisted, offered, placed, rejected, total}
    internship_application_stats: Optional[dict] = Field(default_factory=dict)
    placement_application_stats: Optional[dict] = Field(default_factory=dict)
    avg_match_readiness: Optional[float] = 0.0


# --- SIH26044: AUTHENTICATION & USER SCHEMAS ---
class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: str = Field(..., description="student, industry, academia")
    institution: Optional[str] = None
    qualification_stream: Optional[str] = None
    highest_degree: Optional[str] = None
    location: Optional[str] = None
    preferred_sector: Optional[str] = None
    company: Optional[str] = None
    college_id_or_enrollment_number: Optional[str] = None

class StudentRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)
    college_id_or_enrollment_number: str = Field(..., min_length=2, description="College ID or Student Enrollment Number")
    institution: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[str] = None

class IndustryRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, description="Contact Person Full Name")
    email: EmailStr = Field(..., description="Official Company Email")
    password: str = Field(..., min_length=6)
    company_name: str = Field(..., min_length=2)
    website: Optional[str] = None
    industry_sector: Optional[str] = None
    organization_type: Optional[str] = None
    designation: Optional[str] = None

class AcademiaRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, description="Authorized Person Full Name")
    email: EmailStr = Field(..., description="Official Institutional Email")
    password: str = Field(..., min_length=6)
    institution_name: str = Field(..., min_length=2)
    institution_type: Optional[str] = None
    website: Optional[str] = None
    official_domain: Optional[str] = None
    designation: Optional[str] = None
    institution_identifier: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit verification code")

class ResendVerificationRequest(BaseModel):
    email: EmailStr

class ApproveUserRequest(BaseModel):
    notes: Optional[str] = None

class RejectUserRequest(BaseModel):
    rejection_reason: str = Field(..., min_length=3, description="Reason for rejecting verification")

class SuspendUserRequest(BaseModel):
    reason: Optional[str] = None

class VerificationAuditLogResponse(BaseModel):
    id: int
    target_user_id: int
    admin_user_id: int
    action: str
    previous_status: str
    new_status: str
    reason: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    account_status: str = "active"
    created_at: datetime
    candidate_id: Optional[int] = None
    company: Optional[str] = None
    institution: Optional[str] = None
    website: Optional[str] = None
    industry_sector: Optional[str] = None
    organization_type: Optional[str] = None
    designation: Optional[str] = None
    institution_type: Optional[str] = None
    official_domain: Optional[str] = None
    institution_identifier: Optional[str] = None
    graduation_year: Optional[str] = None
    college_id_or_enrollment_number: Optional[str] = None
    
    # Verification & Audit Metadata
    email_verified_at: Optional[datetime] = None
    verification_requested_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    verified_by_user_id: Optional[int] = None
    rejection_reason: Optional[str] = None
    suspended_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- PHASE 3: GITHUB REPOSITORY EVIDENCE INGESTION SCHEMAS ---

class GitHubAnalyzeRequest(BaseModel):
    repository_url: str = Field(
        ...,
        description="Public GitHub repository URL, e.g. https://github.com/owner/repo"
    )


class GitHubAnalyzedSkill(BaseModel):
    name: str
    category: str
    skill_type: str   # explicit | inferred | adjacent
    proficiency: str
    confidence: float
    evidence_count: int  # number of evidence records backing this skill
    explanation: str


class GitHubAnalysisResponse(BaseModel):
    repository_url: str
    repository_name: str
    repository_description: Optional[str] = None
    primary_language: Optional[str] = None
    files_analyzed: int
    total_text_bytes: int
    evidence_created: int
    skills_discovered: List[GitHubAnalyzedSkill]
    dna_updated: bool
    message: str
