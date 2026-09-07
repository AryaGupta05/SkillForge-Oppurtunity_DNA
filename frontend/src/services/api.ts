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
  InstitutionDashboardResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  // Health
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(res);
  },

  // Candidates
  async getCandidates(): Promise<Candidate[]> {
    const res = await fetch(`${API_BASE_URL}/candidates`);
    return handleResponse(res);
  },

  async getCandidate(id: number): Promise<Candidate> {
    const res = await fetch(`${API_BASE_URL}/candidates/${id}`);
    return handleResponse(res);
  },

  async createCandidate(candidate: Omit<Candidate, 'id' | 'created_at' | 'skills' | 'evidence'>): Promise<Candidate> {
    const res = await fetch(`${API_BASE_URL}/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidate),
    });
    return handleResponse(res);
  },

  // Opportunities
  async getOpportunities(): Promise<Opportunity[]> {
    const res = await fetch(`${API_BASE_URL}/opportunities`);
    return handleResponse(res);
  },

  async getOpportunity(id: number): Promise<Opportunity> {
    const res = await fetch(`${API_BASE_URL}/opportunities/${id}`);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opp),
    });
    return handleResponse(res);
  },

  // Skills Catalog
  async getSkills(): Promise<Skill[]> {
    const res = await fetch(`${API_BASE_URL}/skills`);
    return handleResponse(res);
  },

  async createSkill(skill: Omit<Skill, 'id'>): Promise<Skill> {
    const res = await fetch(`${API_BASE_URL}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      body: formData,
    });
    return handleResponse(res);
  },

  async syncGitHub(candidateId: number): Promise<Evidence[]> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/github/sync`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async analyzeCandidate(candidateId: number): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/analyze`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // DNA Profiles
  async getDNAProfile(candidateId: number): Promise<OpportunityDNAProfileResponse> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/dna`);
    return handleResponse(res);
  },

  async getSkillEvidence(candidateId: number, skillId: number): Promise<SkillEvidence[]> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/skills/${skillId}/evidence`);
    return handleResponse(res);
  },

  // Matching & Auditing
  async matchCandidate(candidateId: number, opportunityId: number): Promise<Recommendation> {
    const res = await fetch(`${API_BASE_URL}/matching/match?candidate_id=${candidateId}&opportunity_id=${opportunityId}`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async getBiasAudit(candidateId: number, opportunityId: number): Promise<BiasAudit> {
    const res = await fetch(`${API_BASE_URL}/matching/audit/${candidateId}/${opportunityId}`);
    return handleResponse(res);
  },

  // Job Matching Operations
  async analyzeOpportunity(opportunityId: number): Promise<OpportunitySkill[]> {
    const res = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/analyze`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async getOpportunitySkills(opportunityId: number): Promise<OpportunitySkill[]> {
    const res = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/skills`);
    return handleResponse(res);
  },

  async matchCandidateToOpportunity(opportunityId: number, candidateId: number, mode: string = "skills_first"): Promise<CandidateMatchResultOut> {
    const res = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/match?candidate_id=${candidateId}&mode=${mode}`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async getOpportunityMatches(opportunityId: number, mode: string = "skills_first"): Promise<CandidateMatchResultOut[]> {
    const res = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/matches?mode=${mode}`);
    return handleResponse(res);
  },

  async getCandidateMatches(candidateId: number, mode: string = "skills_first"): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/matches?mode=${mode}`);
    return handleResponse(res);
  },

  async compareCandidates(payload: { opportunity_id: number; candidate_ids: number[]; mode?: string }): Promise<CompareCandidatesResponse> {
    const res = await fetch(`${API_BASE_URL}/matching/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Fairness & Bias Audits
  async executeGroupBiasAudit(opportunityId: number): Promise<GroupBiasAuditSummaryResponse> {
    const res = await fetch(`${API_BASE_URL}/bias/audit/${opportunityId}`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async getGroupBiasAuditSummary(opportunityId: number): Promise<GroupBiasAuditSummaryResponse> {
    const res = await fetch(`${API_BASE_URL}/bias/audit/${opportunityId}`);
    return handleResponse(res);
  },

  async getCandidateBiasAudit(candidateId: number, opportunityId: number): Promise<BiasAudit> {
    const res = await fetch(`${API_BASE_URL}/bias/candidate/${candidateId}/${opportunityId}`);
    return handleResponse(res);
  },

  async runCounterfactual(payload: { candidate_id: number; opportunity_id: number; tested_attribute: string; counterfactual_value: string }): Promise<BiasAudit> {
    const res = await fetch(`${API_BASE_URL}/bias/counterfactual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // --- SIH PMIS ENDPOINTS ---
  async getStudentEligibility(candidateId: number): Promise<StudentEligibilityResponse> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/eligibility`);
    return handleResponse(res);
  },

  async getReadinessSimulation(candidateId: number, opportunityId: number): Promise<ReadinessSimulationResponse> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/opportunities/${opportunityId}/readiness`);
    return handleResponse(res);
  },

  async getUpskillingRoadmap(candidateId: number, opportunityId: number): Promise<UpskillingRoadmapResponse> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/opportunities/${opportunityId}/roadmap`);
    return handleResponse(res);
  },

  // --- SIH26044 APPLICATION ENDPOINTS ---
  async createApplication(payload: { candidate_id: number; opportunity_id: number }): Promise<Application> {
    const res = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getCandidateApplications(candidateId: number): Promise<Application[]> {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}/applications`);
    return handleResponse(res);
  },

  async getOpportunityApplications(opportunityId: number): Promise<Application[]> {
    const res = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/applications`);
    return handleResponse(res);
  },

  async updateApplicationStatus(applicationId: number, payload: { status: string; notes?: string }): Promise<Application> {
    const res = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // --- SIH26044 ANALYTICS ENDPOINTS ---
  async getSkillDemandAnalytics(): Promise<SkillDemandResponse> {
    const res = await fetch(`${API_BASE_URL}/analytics/skill-demand`);
    return handleResponse(res);
  },

  async getInstitutionDashboard(): Promise<InstitutionDashboardResponse> {
    const res = await fetch(`${API_BASE_URL}/analytics/institution-dashboard`);
    return handleResponse(res);
  }
};
