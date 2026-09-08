import type { 
  Candidate, 
  Opportunity, 
  Recommendation, 
  BiasAudit, 
  Skill, 
  Evidence, 
  SkillEvidence, 
  OpportunityDNAProfileResponse, 
  OpportunitySkill, 
  CandidateMatchResultOut, 
  CompareCandidatesResponse, 
  GroupBiasAuditSummaryResponse, 
  StudentEligibilityResponse,
  ReadinessSimulationResponse,
  UpskillingRoadmapResponse,
  Application,
  SkillDemandResponse,
  InstitutionDashboardResponse,
  RegisterPayload,
  LoginPayload,
  TokenResponse,
  UserResponse,
  VerifyEmailPayload,
  ResendVerificationPayload,
  VerificationQueueItem,
  VerificationAuditLogItem,
  RejectUserPayload,
  SuspendUserPayload
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'skillforge_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function normalizeApiError(error: any): string {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  if (typeof error === 'string') {
    return error;
  }

  const detail = error.detail !== undefined ? error.detail : (error.message || error);

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    const formatted = detail.map((item: any) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const fieldName = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : (item.field || '');
        const readableField = fieldName
          ? String(fieldName).replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
          : '';
        const msg = item.msg || item.message || 'invalid value';
        return readableField ? `${readableField}: ${msg}` : msg;
      }
      return 'Invalid value';
    });
    return formatted.filter(Boolean).join(' | ');
  }

  if (typeof detail === 'object' && detail !== null) {
    if (typeof detail.message === 'string') return detail.message;
    if (typeof detail.detail === 'string') return detail.detail;
  }

  if (error instanceof Error && error.message && error.message !== '[object Object]') {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = normalizeApiError(errorBody);
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export const api = {
  // Authentication
  setAuthToken(token: string) {
    setStoredToken(token);
  },

  getAuthToken(): string | null {
    return getStoredToken();
  },

  logout() {
    removeStoredToken();
  },

  async register(payload: RegisterPayload): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<TokenResponse>(res);
    setStoredToken(data.access_token);
    return data;
  },

  async registerStudent(payload: import('../types').StudentRegisterPayload): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<TokenResponse>(res);
    setStoredToken(data.access_token);
    return data;
  },

  async registerIndustry(payload: import('../types').IndustryRegisterPayload): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register/industry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<TokenResponse>(res);
    setStoredToken(data.access_token);
    return data;
  },

  async registerAcademia(payload: import('../types').AcademiaRegisterPayload): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register/academia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<TokenResponse>(res);
    setStoredToken(data.access_token);
    return data;
  },

  async login(payload: LoginPayload): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<TokenResponse>(res);
    setStoredToken(data.access_token);
    return data;
  },

  async getMe(): Promise<UserResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse<UserResponse>(res);
  },

  // Health
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(res);
  },

  // Candidates
  async getCandidates(): Promise<Candidate[]> {
    const res = await fetch(`${API_BASE_URL}/candidates`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getCandidate(id: number): Promise<Candidate> {
    const res = await fetch(`${API_BASE_URL}/candidates/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async createCandidate(candidate: Omit<Candidate, 'id' | 'created_at' | 'skills' | 'evidence'>): Promise<Candidate> {
    const res = await fetch(`${API_BASE_URL}/candidates`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(candidate),
    });
    return handleResponse(res);
  },

  // Opportunities
  async getOpportunities(): Promise<Opportunity[]> {
    const res = await fetch(`${API_BASE_URL}/opportunities`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getOpportunity(id: number): Promise<Opportunity> {
    const res = await fetch(`${API_BASE_URL}/opportunities/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async createOpportunity(opp: { 
    title: string; 
    company: string; 
    description?: string; 
    type?: 'internship' | 'placement' | 'project';
    duration_months?: number;
    stipend?: number; 
    location?: string; 
    sector?: string; 
    allowed_streams?: string; 
    required_skills: { skill_id: number; importance: number; required_level?: string }[] 
  }): Promise<Opportunity> {
    const res = await fetch(`${API_BASE_URL}/opportunities`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(opp),
    });
    return handleResponse(res);
  },

  // Skills Catalog
  async getSkills(): Promise<Skill[]> {
    const res = await fetch(`${API_BASE_URL}/skills`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async createSkill(skill: Omit<Skill, 'id'>): Promise<Skill> {
    const res = await fetch(`${API_BASE_URL}/skills`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(skill),
    });
    return handleResponse(res);
  },

  // Sync / Upload Evidence
  async uploadResume(candidateId: number, file: File): Promise<Evidence[]> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/resume`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData,
    });
    return handleResponse(res);
  },

  async syncGitHub(candidateId: number): Promise<Evidence[]> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/github/sync`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async analyzeCandidate(candidateId: number): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/analyze`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // DNA Profiles
  async getDNAProfile(candidateId: number): Promise<OpportunityDNAProfileResponse> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/dna`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getSkillEvidence(candidateId: number, skillId: number): Promise<SkillEvidence[]> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/skills/${skillId}/evidence`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Matching & Auditing
  async matchCandidate(candidateId: number, opportunityId: number): Promise<Recommendation> {
    const res = await fetch(`${API_BASE_URL}/matching/match?candidate_id=${candidateId}&opportunity_id=${opportunityId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getBiasAudit(candidateId: number, opportunityId: number): Promise<BiasAudit> {
    const res = await fetch(`${API_BASE_URL}/matching/audit/${candidateId}/${opportunityId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Job Matching Operations
  async analyzeOpportunity(opportunityId: number): Promise<OpportunitySkill[]> {
    const res = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/analyze`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getOpportunitySkills(opportunityId: number): Promise<OpportunitySkill[]> {
    const res = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/skills`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async matchCandidateToOpportunity(opportunityId: number, candidateId: number, mode: string = "skills_first"): Promise<CandidateMatchResultOut> {
    const res = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/match?candidate_id=${candidateId}&mode=${mode}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getOpportunityMatches(opportunityId: number, mode: string = "skills_first"): Promise<CandidateMatchResultOut[]> {
    const res = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/matches?mode=${mode}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getCandidateMatches(candidateId: number, mode: string = "skills_first"): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/matches?mode=${mode}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async compareCandidates(payload: { opportunity_id: number; candidate_ids: number[]; mode?: string }): Promise<CompareCandidatesResponse> {
    const res = await fetch(`${API_BASE_URL}/matching/compare`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Fairness & Bias Audits
  async executeGroupBiasAudit(opportunityId: number): Promise<GroupBiasAuditSummaryResponse> {
    const res = await fetch(`${API_BASE_URL}/bias/audit/${opportunityId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getGroupBiasAuditSummary(opportunityId: number): Promise<GroupBiasAuditSummaryResponse> {
    const res = await fetch(`${API_BASE_URL}/bias/audit/${opportunityId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getCandidateBiasAudit(candidateId: number, opportunityId: number): Promise<BiasAudit> {
    const res = await fetch(`${API_BASE_URL}/bias/candidate/${candidateId}/${opportunityId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async runCounterfactual(payload: { candidate_id: number; opportunity_id: number; tested_attribute: string; counterfactual_value: string }): Promise<BiasAudit> {
    const res = await fetch(`${API_BASE_URL}/bias/counterfactual`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // --- SIH PMIS ENDPOINTS ---
  async getStudentEligibility(candidateId: number): Promise<StudentEligibilityResponse> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/eligibility`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getReadinessSimulation(candidateId: number, opportunityId: number): Promise<ReadinessSimulationResponse> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/opportunities/${opportunityId}/readiness`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getUpskillingRoadmap(candidateId: number, opportunityId: number): Promise<UpskillingRoadmapResponse> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/opportunities/${opportunityId}/roadmap`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // --- SIH26044 APPLICATION ENDPOINTS ---
  async createApplication(payload: { candidate_id: number; opportunity_id: number }): Promise<Application> {
    const res = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getCandidateApplications(candidateId: number): Promise<Application[]> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/applications`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getOpportunityApplications(opportunityId: number): Promise<Application[]> {
    const res = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/applications`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async updateApplicationStatus(applicationId: number, payload: { status: string; notes?: string }): Promise<Application> {
    const res = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // --- SIH26044 ANALYTICS ENDPOINTS ---
  async getSkillDemandAnalytics(): Promise<SkillDemandResponse> {
    const res = await fetch(`${API_BASE_URL}/analytics/skill-demand`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getInstitutionDashboard(): Promise<InstitutionDashboardResponse> {
    const res = await fetch(`${API_BASE_URL}/analytics/institution-dashboard`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // --- PHASE 1.5 AUTHENTICATION & VERIFICATION ENDPOINTS ---
  async verifyEmail(payload: VerifyEmailPayload): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async resendVerification(payload: ResendVerificationPayload): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // --- PHASE 1.5 ADMIN MANAGEMENT ENDPOINTS ---
  async getAdminVerifications(): Promise<VerificationQueueItem[]> {
    const res = await fetch(`${API_BASE_URL}/admin/verifications`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getAdminUsers(): Promise<UserResponse[]> {
    const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getAdminAuditLogs(): Promise<VerificationAuditLogItem[]> {
    const res = await fetch(`${API_BASE_URL}/admin/audit-logs`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getUserAuditLogs(userId: number): Promise<VerificationAuditLogItem[]> {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/audit-logs`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async approveUser(userId: number): Promise<UserResponse> {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/approve`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async rejectUser(userId: number, payload: RejectUserPayload): Promise<UserResponse> {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/reject`, {
      method: 'PATCH',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async suspendUser(userId: number, payload?: SuspendUserPayload): Promise<UserResponse> {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/suspend`, {
      method: 'PATCH',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload || {}),
    });
    return handleResponse(res);
  },

  async reactivateUser(userId: number, payload?: SuspendUserPayload): Promise<UserResponse> {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/reactivate`, {
      method: 'PATCH',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload || {}),
    });
    return handleResponse(res);
  },

  // Phase 3: GitHub Repository Evidence Ingestion
  async analyzeGitHubRepo(
    candidateId: number,
    repositoryUrl: string
  ): Promise<import('../types').GitHubAnalysisResponse> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/github/analyze`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ repository_url: repositoryUrl }),
    });
    return handleResponse(res);
  }
};
