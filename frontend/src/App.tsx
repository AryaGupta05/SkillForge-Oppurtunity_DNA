import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { api } from './services/api';
import type { 
  Candidate, 
  Opportunity, 
  CandidateMatchResultOut,
  StudentEligibilityResponse,
  ReadinessSimulationResponse,
  UpskillingRoadmapResponse,
  Application,
  OpportunityDNAProfileResponse,
  InstitutionDashboardResponse,
  UserResponse
} from './types';

import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LandingPage } from './components/common/LandingPage';
import { AuthModal } from './components/common/AuthModal';
import { CandidateDNAModal } from './components/modals/CandidateDNAModal';
import { ApplicationDetailModal } from './components/modals/ApplicationDetailModal';

// Student Portal Components
import { StudentLayout } from './portals/student/StudentLayout';
import { StudentDashboard } from './portals/student/StudentDashboard';
import { StudentProfile } from './portals/student/StudentProfile';
import { StudentPassport } from './portals/student/StudentPassport';
import { StudentProjects } from './portals/student/StudentProjects';
import { StudentOpportunities } from './portals/student/StudentOpportunities';
import { StudentApplications } from './portals/student/StudentApplications';
import { StudentReadiness } from './portals/student/StudentReadiness';
import { StudentRoadmap } from './portals/student/StudentRoadmap';
import { StudentSettings } from './portals/student/StudentSettings';

// Industry Portal Components
import { IndustryLayout } from './portals/industry/IndustryLayout';
import { IndustryDashboard } from './portals/industry/IndustryDashboard';
import { IndustryCompany } from './portals/industry/IndustryCompany';
import { IndustryOpportunities } from './portals/industry/IndustryOpportunities';
import { PostOpportunity } from './portals/industry/PostOpportunity';
import { IndustryApplicants } from './portals/industry/IndustryApplicants';
import { IndustryAnalytics } from './portals/industry/IndustryAnalytics';
import { IndustrySettings } from './portals/industry/IndustrySettings';

// Academia Portal Components
import { AcademiaLayout } from './portals/academia/AcademiaLayout';
import { AcademiaDashboard } from './portals/academia/AcademiaDashboard';
import { InstitutionProfile } from './portals/academia/InstitutionProfile';
import { AcademiaStudents } from './portals/academia/AcademiaStudents';
import { StudentSkillSupply } from './portals/academia/StudentSkillSupply';
import { IndustryDemandView } from './portals/academia/IndustryDemandView';
import { SkillGapAnalysis } from './portals/academia/SkillGapAnalysis';
import { PlacementOutcomes } from './portals/academia/PlacementOutcomes';
import { AcademiaSettings } from './portals/academia/AcademiaSettings';

// Admin Portal Components
import { AdminLayout } from './portals/admin/AdminLayout';
import { AdminDashboard } from './portals/admin/AdminDashboard';
import { AdminVerifications } from './portals/admin/AdminVerifications';
import { AdminUsers } from './portals/admin/AdminUsers';
import { AdminSettings } from './portals/admin/AdminSettings';

import { X, AlertCircle } from 'lucide-react';

export default function App() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  
  // Student Specific State
  const [eligibility, setEligibility] = useState<StudentEligibilityResponse | null>(null);
  const [recommendedMatches, setRecommendedMatches] = useState<any[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applyingOppId, setApplyingOppId] = useState<number | null>(null);
  const [selectedAppDetail, setSelectedAppDetail] = useState<Application | null>(null);
  const [readinessSim, setReadinessSim] = useState<ReadinessSimulationResponse | null>(null);
  const [selectedSimSkills, setSelectedSimSkills] = useState<string[]>([]);
  const [roadmap, setRoadmap] = useState<UpskillingRoadmapResponse | null>(null);

  // Recruiter / Industry Portal Specific State
  const [rankedCandidates, setRankedCandidates] = useState<CandidateMatchResultOut[]>([]);
  const matchingMode = 'skills_first';
  const [opportunityApplications, setOpportunityApplications] = useState<Application[]>([]);
  const [viewingCandidateDNA, setViewingCandidateDNA] = useState<{ candidateName: string; dna: OpportunityDNAProfileResponse | null } | null>(null);
  const [skillsCatalog, setSkillsCatalog] = useState<any[]>([]);

  // Institution / Academia Portal Specific State
  const [institutionData, setInstitutionData] = useState<InstitutionDashboardResponse | null>(null);
  const [institutionLoading, setInstitutionLoading] = useState(false);
  const [institutionError, setInstitutionError] = useState<string | null>(null);
  const [selectedDrillDownSkill, setSelectedDrillDownSkill] = useState<{
    skillName: string;
    students: {
      candidateName: string;
      stream: string;
      proficiency: string;
      confidence: number;
      evidenceCount: number;
    }[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' | 'info') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<'student' | 'industry' | 'academia' | undefined>(undefined);

  const handleOpenAuth = (role?: 'student' | 'industry' | 'academia') => {
    setAuthInitialRole(role);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (user: UserResponse) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    showStatus(`Signed in as ${user.full_name}`, 'success');

    const roleTarget = 
      user.role === 'admin' ? '/admin/dashboard' :
      user.role === 'student' ? '/student/dashboard' :
      user.role === 'industry' ? '/industry/dashboard' :
      '/academia/dashboard';
    
    navigate(roleTarget);

    if (user.account_status === 'active') {
      if (user.role === 'student' && user.candidate_id) {
        api.getOpportunities().then(opps => {
          setOpportunities(opps);
          loadStudentData(user.candidate_id!, opps.length > 0 ? opps[0] : null);
        }).catch(() => {});
      } else if (user.role === 'industry') {
        api.getOpportunities().then(opps => {
          setOpportunities(opps);
          if (opps.length > 0) handleLoadOpportunityApplications(opps[0].id);
        }).catch(() => {});
      } else if (user.role === 'academia') {
        handleFetchInstitutionDashboard();
      }
    }
  };



  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    showStatus('Signed out successfully.', 'info');
    navigate('/');
  };

  const handleFetchInstitutionDashboard = async () => {
    setInstitutionLoading(true);
    setInstitutionError(null);
    try {
      const data = await api.getInstitutionDashboard();
      setInstitutionData(data);
    } catch (err: any) {
      setInstitutionError(err.message || 'Failed to load institution dashboard analytics.');
    } finally {
      setInstitutionLoading(false);
    }
  };

  const handleDrillDownSkill = (skillName: string) => {
    const matchingStudents: {
      candidateName: string;
      stream: string;
      proficiency: string;
      confidence: number;
      evidenceCount: number;
    }[] = [];

    candidates.forEach((cand) => {
      const match = cand.skills?.find(
        (s) => s.skill.name.toLowerCase() === skillName.toLowerCase()
      );
      if (match) {
        matchingStudents.push({
          candidateName: cand.name,
          stream: cand.qualification_stream || 'General Stream',
          proficiency: match.proficiency || 'Intermediate',
          confidence: match.confidence || 0.85,
          evidenceCount: cand.evidence?.length || 0
        });
      }
    });

    setSelectedDrillDownSkill({
      skillName,
      students: matchingStudents
    });
  };

  // Initial Data Load
  const loadInitialData = async () => {
    setLoading(true);
    try {
      if (api.getAuthToken()) {
        try {
          const u = await api.getMe();
          setCurrentUser(u);
          if (u.account_status === 'active') {
            if (u.role === 'student' && u.candidate_id) {
              const [opps, sks] = await Promise.all([
                api.getOpportunities().catch(() => []),
                api.getSkills().catch(() => [])
              ]);
              setOpportunities(opps);
              setSkillsCatalog(sks);
              await loadStudentData(u.candidate_id, opps.length > 0 ? opps[0] : null);
            } else if (u.role === 'industry') {
              const [cands, opps, sks] = await Promise.all([
                api.getCandidates().catch(() => []),
                api.getOpportunities().catch(() => []),
                api.getSkills().catch(() => [])
              ]);
              setCandidates(cands);
              setOpportunities(opps);
              setSkillsCatalog(sks);
              if (opps.length > 0) await handleLoadOpportunityApplications(opps[0].id);
            } else if (u.role === 'academia') {
              const [cands, opps, sks] = await Promise.all([
                api.getCandidates().catch(() => []),
                api.getOpportunities().catch(() => []),
                api.getSkills().catch(() => [])
              ]);
              setCandidates(cands);
              setOpportunities(opps);
              setSkillsCatalog(sks);
              await handleFetchInstitutionDashboard();
            } else if (u.role === 'admin') {
              const [cands, opps, sks] = await Promise.all([
                api.getCandidates().catch(() => []),
                api.getOpportunities().catch(() => []),
                api.getSkills().catch(() => [])
              ]);
              setCandidates(cands);
              setOpportunities(opps);
              setSkillsCatalog(sks);
            }
          }
        } catch {
          api.logout();
          setCurrentUser(null);
        }
      }
    } catch (err: any) {
      showStatus(err.message || 'Failed to connect to backend server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentData = async (candId: number, targetOpp: Opportunity | null = null) => {
    setLoading(true);
    try {
      const [candDetail, elig, matches, apps] = await Promise.all([
        api.getCandidate(candId).catch(() => null),
        api.getStudentEligibility(candId).catch(() => null),
        api.getCandidateMatches(candId, 'skills_first').catch(() => []),
        api.getCandidateApplications(candId).catch(() => [])
      ]);
      
      if (candDetail) {
        setSelectedCandidate(candDetail);
      }
      setEligibility(elig);
      setRecommendedMatches(matches);
      setApplications(apps);

      const oppToUse = targetOpp || (opportunities.length > 0 ? opportunities[0] : null);
      if (oppToUse) {
        setSelectedOpportunity(oppToUse);
        const [sim, rd] = await Promise.all([
          api.getReadinessSimulation(candId, oppToUse.id).catch(() => null),
          api.getUpskillingRoadmap(candId, oppToUse.id).catch(() => null)
        ]);
        setReadinessSim(sim);
        setSelectedSimSkills([]);
        setRoadmap(rd);
      }
    } catch (err: any) {
      showStatus('Error loading student intelligence details: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToOpportunity = async (oppId: number) => {
    if (!selectedCandidate) return;
    setApplyingOppId(oppId);
    try {
      await api.createApplication({ candidate_id: selectedCandidate.id, opportunity_id: oppId });
      showStatus(lang === 'en' ? 'Application submitted successfully!' : 'आवेदन सफलतापूर्वक जमा किया गया!', 'success');
      const updatedApps = await api.getCandidateApplications(selectedCandidate.id);
      setApplications(updatedApps);
    } catch (err: any) {
      showStatus(err.message || 'Failed to submit application', 'error');
    } finally {
      setApplyingOppId(null);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectCandidate = async (candId: number) => {
    const cand = candidates.find(c => c.id === candId);
    if (cand) {
      setSelectedCandidate(cand);
      await loadStudentData(cand.id, selectedOpportunity);
    }
  };

  const handleSelectOpportunityForSim = async (opp: Opportunity) => {
    if (!selectedCandidate) return;
    setSelectedOpportunity(opp);
    setLoading(true);
    try {
      const [sim, rd] = await Promise.all([
        api.getReadinessSimulation(selectedCandidate.id, opp.id),
        api.getUpskillingRoadmap(selectedCandidate.id, opp.id)
      ]);
      setReadinessSim(sim);
      setSelectedSimSkills([]);
      setRoadmap(rd);
    } catch (err: any) {
      showStatus('Failed to load readiness for selected internship: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!selectedCandidate || !uploadFile) {
      showStatus('Please select a candidate and a PDF resume file.', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.uploadResume(selectedCandidate.id, uploadFile);
      showStatus('Resume PDF processed successfully via Gemini AI Extraction.', 'success');
      const updatedCand = await api.getCandidate(selectedCandidate.id);
      setSelectedCandidate(updatedCand);
      await loadStudentData(updatedCand.id, selectedOpportunity);
    } catch (err: any) {
      showStatus(err.message || 'Failed to process PDF resume.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverSkills = async () => {
    if (!selectedCandidate) return;
    setLoading(true);
    try {
      await api.analyzeCandidate(selectedCandidate.id);
      showStatus('Capability skills successfully discovered and trace-linked.', 'success');
      const updatedCand = await api.getCandidate(selectedCandidate.id);
      setSelectedCandidate(updatedCand);
      await loadStudentData(updatedCand.id, selectedOpportunity);
    } catch (err: any) {
      showStatus(err.message || 'Failed to discover skills.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSimSkill = (skillName: string) => {
    if (selectedSimSkills.includes(skillName)) {
      setSelectedSimSkills(selectedSimSkills.filter(s => s !== skillName));
    } else {
      setSelectedSimSkills([...selectedSimSkills, skillName]);
    }
  };

  const calculateDynamicProjectedScore = () => {
    if (!readinessSim) return 0;
    const baseScore = readinessSim.current_readiness_score;
    let delta = 0;
    readinessSim.skills_breakdown.forEach(s => {
      if (selectedSimSkills.includes(s.skill_name)) {
        delta += (s.potential_contribution || 0);
      }
    });
    return Math.min(100.0, Math.round((baseScore + delta) * 10) / 10);
  };

  // Recruiter / Industry Portal Actions
  const handleLoadOpportunityApplications = async (oppId: number) => {
    setLoading(true);
    try {
      const [apps, matches] = await Promise.all([
        api.getOpportunityApplications(oppId).catch(() => []),
        api.getOpportunityMatches(oppId, matchingMode).catch(() => [])
      ]);
      setOpportunityApplications(apps);
      setRankedCandidates(matches);
    } catch (err: any) {
      showStatus('Error fetching applicants for opportunity: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppStatus = async (appId: number, newStatus: string, oppId: number) => {
    try {
      await api.updateApplicationStatus(appId, { status: newStatus });
      showStatus(`Application status updated to '${newStatus.toUpperCase()}'`, 'success');
      await handleLoadOpportunityApplications(oppId);
    } catch (err: any) {
      showStatus('Status transition error: ' + err.message, 'error');
    }
  };

  const handleViewCandidateDNA = async (candId: number, candName: string) => {
    setLoading(true);
    try {
      const dna = await api.getDNAProfile(candId);
      setViewingCandidateDNA({ candidateName: candName, dna });
    } catch (err: any) {
      showStatus('Failed to load candidate Opportunity DNA: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Toast Notification Banner */}
      {statusMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center space-x-3 text-xs font-semibold max-w-md ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          statusMessage.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-indigo-50 text-indigo-800 border-indigo-200'
        }`}>
          <div className="shrink-0">
            {statusMessage.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-600" /> : <AlertCircle className="w-5 h-5 text-indigo-600" />}
          </div>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="ml-auto text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Application Route Tree */}
      <Routes>
        {/* Public Landing Page */}
        <Route 
          path="/" 
          element={
            <LandingPage 
              currentUser={currentUser} 
              onOpenAuth={handleOpenAuth} 
            />
          } 
        />

        {/* Protected Student Portal Tree */}
        <Route 
          path="/student" 
          element={
            <ProtectedRoute currentUser={currentUser} allowedRole="student" onLogout={handleLogout}>
              <StudentLayout 
                currentUser={currentUser} 
                lang={lang} 
                onToggleLang={() => setLang(l => l === 'en' ? 'hi' : 'en')} 
                onLogout={handleLogout} 
                onOpenAuth={() => handleOpenAuth('student')} 
              />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route 
            path="dashboard" 
            element={
              <StudentDashboard 
                candidate={selectedCandidate} 
                eligibility={eligibility} 
                recommendedMatches={recommendedMatches} 
                applications={applications} 
                readinessSim={readinessSim} 
                opportunities={opportunities} 
              />
            } 
          />
          <Route 
            path="profile" 
            element={
              <StudentProfile 
                candidate={selectedCandidate} 
                candidates={candidates} 
                onSelectCandidate={handleSelectCandidate} 
                uploadFile={uploadFile} 
                onSetUploadFile={setUploadFile} 
                onResumeUpload={handleResumeUpload} 
                onDiscoverSkills={handleDiscoverSkills} 
                loading={loading} 
              />
            } 
          />
          <Route 
            path="skills" 
            element={
              <StudentPassport 
                candidate={selectedCandidate} 
                onDiscoverSkills={handleDiscoverSkills} 
                loading={loading} 
              />
            } 
          />
          <Route 
            path="projects" 
            element={
              <StudentProjects 
                candidate={selectedCandidate} 
              />
            } 
          />
          <Route 
            path="opportunities" 
            element={
              <StudentOpportunities 
                candidate={selectedCandidate}
                opportunities={opportunities} 
                recommendedMatches={recommendedMatches} 
                applications={applications} 
                onApply={handleApplyToOpportunity} 
                applyingOppId={applyingOppId} 
                onSelectForSim={handleSelectOpportunityForSim} 
              />
            } 
          />
          <Route 
            path="applications" 
            element={
              <StudentApplications 
                applications={applications} 
                onSelectAppDetail={(app) => setSelectedAppDetail(app)} 
              />
            } 
          />
          <Route 
            path="readiness" 
            element={
              <StudentReadiness 
                candidate={selectedCandidate} 
                opportunities={opportunities} 
                selectedOpportunity={selectedOpportunity} 
                onSelectOpportunity={handleSelectOpportunityForSim} 
                readinessSim={readinessSim} 
                selectedSimSkills={selectedSimSkills} 
                onToggleSimSkill={handleToggleSimSkill} 
                projectedScore={calculateDynamicProjectedScore()} 
                loading={loading} 
              />
            } 
          />
          <Route 
            path="roadmap" 
            element={
              <StudentRoadmap 
                candidate={selectedCandidate} 
                selectedOpportunity={selectedOpportunity} 
                roadmap={roadmap} 
                loading={loading} 
              />
            } 
          />
          <Route 
            path="settings" 
            element={
              <StudentSettings 
                currentUser={currentUser} 
              />
            } 
          />
        </Route>

        {/* Protected Industry Partner Portal Tree */}
        <Route 
          path="/industry" 
          element={
            <ProtectedRoute currentUser={currentUser} allowedRole="industry" onLogout={handleLogout}>
              <IndustryLayout 
                currentUser={currentUser} 
                lang={lang} 
                onToggleLang={() => setLang(l => l === 'en' ? 'hi' : 'en')} 
                onLogout={handleLogout} 
                onOpenAuth={() => handleOpenAuth('industry')} 
              />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/industry/dashboard" replace />} />
          <Route 
            path="dashboard" 
            element={
              <IndustryDashboard 
                currentUser={currentUser} 
                opportunities={opportunities} 
                opportunityApplications={opportunityApplications} 
                onLoadRankings={handleLoadOpportunityApplications} 
              />
            } 
          />
          <Route 
            path="company" 
            element={
              <IndustryCompany 
                currentUser={currentUser} 
              />
            } 
          />
          <Route 
            path="opportunities" 
            element={
              <IndustryOpportunities 
                opportunities={opportunities} 
                onLoadRankings={handleLoadOpportunityApplications} 
              />
            } 
          />
          <Route 
            path="opportunities/new" 
            element={
              <PostOpportunity 
                skillsCatalog={skillsCatalog} 
                onCreateSuccess={async () => {
                  const updatedOpps = await api.getOpportunities();
                  setOpportunities(updatedOpps);
                }} 
              />
            } 
          />
          <Route 
            path="applicants" 
            element={
              <IndustryApplicants 
                opportunities={opportunities} 
                selectedOpportunity={selectedOpportunity} 
                rankedCandidates={rankedCandidates} 
                opportunityApplications={opportunityApplications} 
                onSelectOpportunity={(oppId) => {
                  const opp = opportunities.find(o => o.id === oppId) || null;
                  setSelectedOpportunity(opp);
                  handleLoadOpportunityApplications(oppId);
                }} 
                onUpdateStatus={async (appId, status) => {
                  if (selectedOpportunity) await handleUpdateAppStatus(appId, status, selectedOpportunity.id);
                }} 
                onViewCandidateDNA={handleViewCandidateDNA} 
              />
            } 
          />
          <Route 
            path="analytics" 
            element={
              <IndustryAnalytics />
            } 
          />
          <Route 
            path="settings" 
            element={
              <IndustrySettings 
                currentUser={currentUser} 
              />
            } 
          />
        </Route>

        {/* Protected Academia / Institution Portal Tree */}
        <Route 
          path="/academia" 
          element={
            <ProtectedRoute currentUser={currentUser} allowedRole="academia" onLogout={handleLogout}>
              <AcademiaLayout 
                currentUser={currentUser} 
                lang={lang} 
                onToggleLang={() => setLang(l => l === 'en' ? 'hi' : 'en')} 
                onLogout={handleLogout} 
                onOpenAuth={() => handleOpenAuth('academia')} 
              />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/academia/dashboard" replace />} />
          <Route 
            path="dashboard" 
            element={
              <AcademiaDashboard 
                institutionData={institutionData} 
                loading={institutionLoading} 
                error={institutionError} 
                onRefresh={handleFetchInstitutionDashboard} 
                onDrillDownSkill={handleDrillDownSkill} 
              />
            } 
          />
          <Route 
            path="institution" 
            element={
              <InstitutionProfile 
                currentUser={currentUser} 
                institutionData={institutionData} 
              />
            } 
          />
          <Route 
            path="students" 
            element={
              <AcademiaStudents 
                candidates={candidates} 
                onViewDNA={handleViewCandidateDNA} 
              />
            } 
          />
          <Route 
            path="skill-supply" 
            element={
              <StudentSkillSupply 
                institutionData={institutionData} 
                onDrillDownSkill={handleDrillDownSkill} 
              />
            } 
          />
          <Route 
            path="industry-demand" 
            element={
              <IndustryDemandView 
                institutionData={institutionData} 
              />
            } 
          />
          <Route 
            path="skill-gaps" 
            element={
              <SkillGapAnalysis 
                institutionData={institutionData} 
              />
            } 
          />
          <Route 
            path="outcomes" 
            element={
              <PlacementOutcomes 
                institutionData={institutionData} 
              />
            } 
          />
          <Route 
            path="settings" 
            element={
              <AcademiaSettings 
                currentUser={currentUser} 
              />
            } 
          />
        </Route>

        {/* Admin Portal Tree */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute currentUser={currentUser} allowedRole="admin" onLogout={handleLogout}>
              <AdminLayout currentUser={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="verifications" element={<AdminVerifications />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Candidate DNA Modal */}
      {viewingCandidateDNA && (
        <CandidateDNAModal
          candidateName={viewingCandidateDNA.candidateName}
          dna={viewingCandidateDNA.dna}
          onClose={() => setViewingCandidateDNA(null)}
        />
      )}

      {/* Global Application Detail Modal */}
      {selectedAppDetail && (
        <ApplicationDetailModal
          application={selectedAppDetail}
          onClose={() => setSelectedAppDetail(null)}
        />
      )}

      {/* Global Drill-Down Skill Modal */}
      {selectedDrillDownSkill && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Student Roster: <span className="text-indigo-600">{selectedDrillDownSkill.skillName}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDrillDownSkill.students.length} verified candidate(s) possessing this capability skill.
                </p>
              </div>
              <button 
                onClick={() => setSelectedDrillDownSkill(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {selectedDrillDownSkill.students.length === 0 ? (
                <p className="text-xs text-slate-500 p-4 text-center">No students currently registered with this specific skill in their DNA.</p>
              ) : (
                selectedDrillDownSkill.students.map((cand, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{cand.candidateName}</span>
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                        {cand.proficiency}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Stream: {cand.stream}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="text-emerald-700 font-semibold">Confidence: {Math.round(cand.confidence * 100)}%</span>
                      <span>Evidence Count: {cand.evidenceCount} item(s)</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedDrillDownSkill(null)}
                className="bg-indigo-600 text-white font-bold text-xs py-2 px-4 rounded-xl"
              >
                Close List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Auth Modal */}
      {showAuthModal && (
        <AuthModal
          initialRole={authInitialRole}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
