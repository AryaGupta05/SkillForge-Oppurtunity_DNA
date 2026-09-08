export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'industry' | 'academia' | 'admin';
  is_active: boolean;
  account_status?: 'pending_email_verification' | 'pending_verification' | 'active' | 'rejected' | 'suspended';
  created_at: string;
  candidate_id?: number;
  company?: string;
  institution?: string;
  website?: string;
  industry_sector?: string;
  organization_type?: string;
  designation?: string;
  institution_type?: string;
  official_domain?: string;
  institution_identifier?: string;
  graduation_year?: string;
  college_id_or_enrollment_number?: string;
  email_verified_at?: string;
  verification_requested_at?: string;
  verified_at?: string;
  verified_by_user_id?: number;
  rejection_reason?: string;
  suspended_at?: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface VerificationQueueItem {
  id: number;
  email: string;
  full_name: string;
  role: 'industry' | 'academia';
  account_status: string;
  created_at: string;
  verification_requested_at?: string;
  company?: string;
  website?: string;
  industry_sector?: string;
  organization_type?: string;
  designation?: string;
  institution?: string;
  institution_type?: string;
  official_domain?: string;
  institution_identifier?: string;
}

export interface VerificationAuditLogItem {
  id: number;
  target_user_id: number;
  admin_user_id: number;
  action: 'approve' | 'reject' | 'suspend' | 'reactivate';
  previous_status: string;
  new_status: string;
  reason?: string;
  created_at: string;
  admin_email?: string;
  admin_full_name?: string;
  target_email?: string;
  target_full_name?: string;
}

export interface RejectUserPayload {
  reason: string;
}

export interface SuspendUserPayload {
  reason?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role: 'student' | 'industry' | 'academia';
  institution?: string;
  qualification_stream?: string;
  highest_degree?: string;
  location?: string;
  preferred_sector?: string;
  company?: string;
}

export interface StudentRegisterPayload {
  full_name: string;
  email: string;
  password: string;
  college_id_or_enrollment_number: string;
  institution?: string;
  degree?: string;
  graduation_year?: string;
}

export interface IndustryRegisterPayload {
  full_name: string;
  email: string;
  password: string;
  company_name: string;
  website?: string;
  industry_sector?: string;
  organization_type?: string;
  designation?: string;
}

export interface AcademiaRegisterPayload {
  full_name: string;
  email: string;
  password: string;
  institution_name: string;
  institution_type?: string;
  website?: string;
  official_domain?: string;
  designation?: string;
  institution_identifier?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  description?: string;
}

export interface CandidateSkill {
  id: number;
  candidate_id: number;
  skill_id: number;
  confidence: number;
  proficiency?: string;
  evidence_strength: number;
  skill_type: 'explicit' | 'inferred' | 'adjacent';
  skill: Skill;
}

export interface Evidence {
  id: number;
  candidate_id: number;
  type: 'resume' | 'project' | 'github' | 'certification' | 'hackathon' | 'portfolio' | 'assessment' | 'experience';
  title: string;
  description?: string;
  source?: string;
  source_url?: string;
  date?: string;
  raw_content?: string;
  created_at: string;
}

export interface Candidate {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  location?: string;
  institution?: string;
  gender?: string;
  age?: number;
  career_gap_info?: string;
  github_url?: string;
  
  // PM Internship Scheme fields
  family_income?: number;
  is_family_govt_employee?: boolean;
  highest_degree?: string;
  institution_is_elite?: boolean;
  qualification_stream?: string;
  preferred_sector?: string;
  preferred_location?: string;
  is_full_time_student?: boolean;
  is_full_time_employed?: boolean;
  has_prior_nats_naps?: boolean;
  
  created_at: string;
  skills: CandidateSkill[];
  evidence: Evidence[];
}

export interface OpportunitySkill {
  id: number;
  opportunity_id: number;
  skill_id: number;
  importance: number;
  required_level?: string;
  requirement_type?: string;
  evidence_expectation?: string;
  skill: Skill;
}

export interface Opportunity {
  id: number;
  title: string;
  company: string;
  description?: string;
  type?: 'internship' | 'placement' | 'project';
  duration_months?: number;
  stipend?: number;
  location?: string;
  sector?: string;
  allowed_streams?: string;
  created_at: string;
  required_skills: OpportunitySkill[];
}

export interface Application {
  id: number;
  candidate_id: number;
  opportunity_id: number;
  status: 'applied' | 'shortlisted' | 'offered' | 'placed' | 'rejected';
  applied_at: string;
  updated_at: string;
  notes?: string;
  candidate_name?: string;
  opportunity_title?: string;
  opportunity_company?: string;
  opportunity_type?: string;
}

export interface ApplicationCreatePayload {
  candidate_id: number;
  opportunity_id: number;
}

export interface ApplicationStatusUpdatePayload {
  status: 'shortlisted' | 'offered' | 'placed' | 'rejected';
  notes?: string;
}

export interface Recommendation {
  id: number;
  candidate_id: number;
  opportunity_id: number;
  match_score: number;
  explanation?: string;
  strengths?: string; // JSON string containing string[]
  gaps?: string;      // JSON string containing string[]
  created_at: string;
}

export interface BiasAudit {
  id: number;
  candidate_id: number;
  opportunity_id: number;
  normal_score: number;
  blind_score: number;
  score_delta: number;
  normal_rank?: number;
  blind_rank?: number;
  rank_change?: number;
  affected_attributes?: string; // JSON string containing string[]
  explanation?: string;
  risk_level?: 'low' | 'moderate' | 'high';
  audit_type?: 'blind_comparison' | 'counterfactual';
  tested_attribute?: string;
  original_value?: string;
  counterfactual_value?: string;
  capability_data_unchanged?: boolean;
  created_at?: string;
}

export interface LearningProgressionSignal {
  status: 'sufficient_evidence' | 'insufficient_evidence';
  timeline: number[];
  description: string;
  score: number;
}

export interface CapabilitySignalsOut {
  depth: number;
  breadth: number;
  learning_progression: LearningProgressionSignal;
  adaptability: number;
  evidence_strength: number;
}

export interface OpportunityDNAProfileResponse {
  candidate_id: number;
  candidate_name: string;
  skills: CandidateSkill[];
  evidence: Evidence[];
  signals: CapabilitySignalsOut;
}

export interface SkillEvidence {
  id: number;
  candidate_skill_id: number;
  evidence_id: number;
  relationship?: string;
  confidence: number;
  evidence?: Evidence;
}

export interface SkillMatchDetail {
  name: string;
  category: string;
  requirement_type: string;
  required_level: string;
  candidate_level?: string;
  match_status: string;
  contribution: number;
  confidence: number;
  evidence: Evidence[];
}

export interface CandidateMatchResultOut {
  rank: number;
  candidate_id: number;
  candidate_name: string;
  overall_score: number;
  strengths: string[];
  gaps: string[];
  evidence_strength: number;
  skills_breakdown: SkillMatchDetail[];
  review_status: string;
}

export interface CompareCandidatesResponse {
  opportunity_id: number;
  opportunity_title: string;
  company: string;
  candidate_matches: CandidateMatchResultOut[];
  mode: string;
  message: string;
}

export interface GroupBiasAuditDetail {
  candidate_id: number;
  candidate_name: string;
  normal_rank: number;
  blind_rank: number;
  rank_change: number;
  score_delta: number;
  risk_level: 'low' | 'moderate' | 'high';
}

export interface GroupBiasAuditSummaryResponse {
  opportunity_id: number;
  opportunity_title: string;
  company: string;
  candidates_audited: number;
  rank_changes_count: number;
  avg_score_delta: number;
  max_score_delta: number;
  risk_level: 'low' | 'moderate' | 'high';
  details: GroupBiasAuditDetail[];
  message: string;
}

export interface CounterfactualAuditPayload {
  candidate_id: number;
  opportunity_id: number;
  tested_attribute: string;
  counterfactual_value: string;
}

// --- SIH PMIS TYPES ---

export interface StudentEligibilityResponse {
  candidate_id: number;
  eligible: boolean;
  passed_checks: string[];
  failed_checks: string[];
  verdict_summary: string;
  verification_date: string;
  source_guideline_url: string;
}

export interface SkillReadinessDetail {
  skill_name: string;
  required_level: string;
  candidate_level?: string;
  is_met: boolean;
  weight: number;
  potential_contribution: number;
}

export interface ReadinessSimulationResponse {
  candidate_id: number;
  opportunity_id: number;
  current_readiness_score: number;
  projected_readiness_score: number;
  missing_skills: string[];
  skills_breakdown: SkillReadinessDetail[];
}

export interface UpskillingResource {
  type: 'course' | 'certificate' | 'project';
  title: string;
  provider: string;
  link_url: string;
  estimated_hours: number;
}

export interface SkillGapRoadmap {
  skill_name: string;
  gap_severity: string;
  resources: UpskillingResource[];
}

export interface UpskillingRoadmapResponse {
  candidate_id: number;
  opportunity_id: number;
  gaps: SkillGapRoadmap[];
  estimated_months_to_ready: number;
}

export interface SkillDemandItem {
  skill_name: string;
  category: string;
  opportunity_count: number;
  percentage: number;
  internship_count: number;
  placement_count: number;
}

export interface SkillDemandResponse {
  total_opportunities: number;
  skills: SkillDemandItem[];
}

export interface SkillSupplyItem {
  skill_name: string;
  student_count: number;
}

export interface SkillGapItem {
  skill_name: string;
  demand_count: number;
  supply_count: number;
  gap: number;
}

export interface InstitutionDashboardResponse {
  total_students: number;
  total_opportunities: number;
  internship_count: number;
  placement_count: number;
  project_count: number;
  top_student_skills: SkillSupplyItem[];
  top_demanded_skills: SkillDemandItem[];
  skill_gaps: SkillGapItem[];
  application_stats: Record<string, number>;
  internship_application_stats?: Record<string, number>;
  placement_application_stats?: Record<string, number>;
  avg_match_readiness?: number;
}

// --- PHASE 3: GITHUB REPOSITORY EVIDENCE INGESTION TYPES ---

export interface GitHubAnalyzeRequest {
  repository_url: string;
}

export interface GitHubAnalyzedSkill {
  name: string;
  category: string;
  skill_type: 'explicit' | 'inferred' | 'adjacent';
  proficiency: string;
  confidence: number;
  evidence_count: number;
  explanation: string;
}

export interface GitHubAnalysisResponse {
  repository_url: string;
  repository_name: string;
  repository_description?: string;
  primary_language?: string;
  files_analyzed: number;
  total_text_bytes: number;
  evidence_created: number;
  skills_discovered: GitHubAnalyzedSkill[];
  dna_updated: boolean;
  message: string;
}
