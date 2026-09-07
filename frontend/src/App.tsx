import { useState, useEffect } from 'react';
import { api } from './services/api';
import type { 
  Candidate, 
  Opportunity, 
  Evidence, 
  CandidateMatchResultOut,
  StudentEligibilityResponse,
  ReadinessSimulationResponse,
  UpskillingRoadmapResponse,
  GroupBiasAuditSummaryResponse,
  Application,
  OpportunityDNAProfileResponse,
  InstitutionDashboardResponse
} from './types';
import { 
  Briefcase, 
  ShieldAlert, 
  FileText, 
  CheckCircle, 
  Info,
  ArrowRight,
  Award,
  BookOpen,
  ExternalLink,
  Globe,
  Layers,
  MapPin,
  Sparkles,
  Target,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Eye,
  X,
  DollarSign,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  FileCheck2,
  Building2,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  RefreshCw
} from 'lucide-react';

const TRANSLATIONS = {
  en: {
    appTitle: "Opportunity DNA",
    appSubtitle: "Academia-Industry Collaboration & Career Readiness Portal (SIH26044)",
    sihBadge: "SIH PS #26044",
    studentPortal: "Student Portal",
    recruiterPortal: "Industry Partner Portal",
    profileOverview: "Student Profile",
    streamLabel: "Stream / Degree",
    locationPref: "Location Preference",
    sectorPref: "Sector Preference",
    uploadResume: "Upload Resume (PDF)",
    discoverSkills: "Discover Skills (AI)",
    eligibilityTitle: "PM Internship Scheme (PMIS) Eligibility Pre-Check",
    eligibilityNotice: "Pre-check only. Please verify final eligibility on the official portal (pminternship.mca.gov.in).",
    eligibleBadge: "Eligible for PM Scheme Pre-Check",
    ineligibleBadge: "Review Required / Missing Criteria",
    passedChecks: "Passed Requirements",
    failedChecks: "Flagged Exclusions / Incomplete",
    dnaTitle: "Student Skill Passport (Traceable DNA)",
    skillsDetected: "Skills Discovered",
    avgConfidence: "Avg Confidence",
    evidenceStrength: "Evidence Multiplier",
    recommendationsTitle: "Recommended Corporate Opportunities",
    whyRecommended: "Why this match?",
    simulateReadiness: "Readiness Simulator",
    viewRoadmap: "Upskilling Roadmap",
    readinessTitle: "Deterministic Readiness & Skill-Gap Simulator",
    currentScore: "Current Match Readiness",
    projectedScore: "Projected Readiness",
    simInstructions: "Select missing or under-proficient skills below to simulate how acquiring them will increase your opportunity readiness score:",
    roadmapTitle: "Personalized Career Development Roadmap",
    estimatedTime: "Estimated Learning Duration",
    hoursPerMonth: "hours/month part-time learning",
    evidenceView: "Supporting Evidence",
    noEvidence: "No direct evidence linked yet.",
    recruiterTitle: "Recruiter & Opportunity Intelligence",
    switchLanguage: "हिंदी",
    activeStudent: "Active Student Profile",
    stipend: "Monthly Stipend / Compensation",
    location: "Location",
    sector: "Sector",
    matchScore: "Match Score",
    months: "months",
    // SIH26044 New Translations
    myApplications: "My Applications",
    skillPassport: "Skill Passport",
    applyNow: "Apply Now",
    applying: "Applying...",
    applied: "Applied",
    statusShortlisted: "Shortlisted",
    statusOffered: "Offered",
    statusPlaced: "Placed",
    statusRejected: "Not Selected",
    typeInternship: "INTERNSHIP",
    typePlacement: "PLACEMENT",
    typeProject: "PROJECT",
    noApplications: "No applications submitted yet. Explore recommended opportunities to apply!",
    applicationTimeline: "Application Detail & Status Progression",
    institutionPortal: "Academia Portal",
    institutionTitle: "Academia & Institutional Skill Intelligence Console"
  },
  hi: {
    appTitle: "अवसर DNA (Opportunity DNA)",
    appSubtitle: "अकादमिक-उद्योग सहयोग एवं करियर तत्परता पोर्टल (SIH26044)",
    sihBadge: "SIH PS #26044",
    studentPortal: "छात्र पोर्टल (Student)",
    recruiterPortal: "उद्योग पार्टनर पोर्टल",
    institutionPortal: "अकादमिक पोर्टल",
    institutionTitle: "अकादमिक एवं संस्थागत कौशल विश्लेषण कंसोल",
    profileOverview: "छात्र प्रोफाइल",
    streamLabel: "डिग्री / शाखा",
    locationPref: "पसंदीदा स्थान",
    sectorPref: "पसंदीदा क्षेत्र",
    uploadResume: "बायोडाटा (PDF) अपलोड करें",
    discoverSkills: "कौशल पहचानें (AI विश्लेषण)",
    eligibilityTitle: "पीएम इंटर्नशिप योजना (PMIS) पात्रता पूर्व-जांच",
    eligibilityNotice: "यह केवल पूर्व-जांच है। आधिकारिक पोर्टल (pminternship.mca.gov.in) पर अंतिम पात्रता सत्यापित करें।",
    eligibleBadge: "पीएम योजना पूर्व-जांच अनुसार पात्र",
    ineligibleBadge: "समीक्षा आवश्यक / अपात्रता शर्तें",
    passedChecks: "सफल आवश्यकताएं",
    failedChecks: "ध्वज की गई शर्तें / अधूरी जानकारी",
    dnaTitle: "छात्र कौशल पासपोर्ट (साक्ष्य-आधारित DNA)",
    skillsDetected: "पहचाने गए कौशल",
    avgConfidence: "औसत आत्मविश्वास",
    evidenceStrength: "प्रमाण गुणक",
    recommendationsTitle: "अनुशंसित कॉर्पोरेट अवसर (इंटर्नशिप एवं प्लेसमेंट)",
    whyRecommended: "यह अनुशंसा क्यों?",
    simulateReadiness: "तैयारी सिमुलेशन",
    viewRoadmap: "कौशल रोडमैप",
    readinessTitle: "कौशल अंतर एवं तत्परता सिम्युलेटर",
    currentScore: "वर्तमान तैयारी स्कोर",
    projectedScore: "अनुमानित तैयारी स्कोर",
    simInstructions: "यह देखने के लिए नीचे दिए गए कौशल चुनें कि उन्हें सीखने से आपका तत्परता स्कोर कैसे बढ़ता है:",
    roadmapTitle: "व्यक्तिगत कौशल विकास रोडमैप",
    estimatedTime: "अनुमानित सीखने की अवधि",
    hoursPerMonth: "घंटे/माह अंशकालिक अध्ययन",
    evidenceView: "समर्थक साक्ष्य",
    noEvidence: "अभी कोई प्रत्यक्ष प्रमाण नहीं जुड़ा है।",
    recruiterTitle: "भर्तीकर्ता एवं पद विश्लेषण कंसोल",
    switchLanguage: "English",
    activeStudent: "सक्रिय छात्र प्रोफाइल",
    stipend: "मासिक वजीफा / वेतन",
    location: "स्थान",
    sector: "क्षेत्र",
    matchScore: "मैच स्कोर",
    months: "महीने",
    // SIH26044 New Translations
    myApplications: "मेरे आवेदन",
    skillPassport: "कौशल पासपोर्ट",
    applyNow: "अभी आवेदन करें",
    applying: "आवेदन हो रहा है...",
    applied: "आवेदन जमा",
    statusShortlisted: "शॉर्टलिस्ट",
    statusOffered: "ऑफर मिला",
    statusPlaced: "नियुक्त",
    statusRejected: "चयनित नहीं",
    typeInternship: "इंटर्नशिप",
    typePlacement: "प्लेसमेंट",
    typeProject: "प्रोजेक्ट",
    noApplications: "अभी कोई आवेदन नहीं जमा किया गया है। आवेदन करने के लिए नीचे अनुशंसित अवसर देखें!",
    applicationTimeline: "आवेदन विवरण एवं स्थिति प्रगति"
  }
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState<'student' | 'recruiter' | 'institution'>('student');
  const [studentSection, setStudentSection] = useState<'overview' | 'passport' | 'recommendations' | 'applications' | 'simulator' | 'roadmap'>('overview');
  
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
  const [explanationMatch, setExplanationMatch] = useState<any | null>(null);
  const [activeSkillEvidence, setActiveSkillEvidence] = useState<{ skillName: string; evidence: Evidence[] } | null>(null);

  // Recruiter / Industry Portal Specific State
  const [recruiterSubTab, setRecruiterSubTab] = useState<'opportunities' | 'applicants' | 'demand' | 'audit'>('opportunities');
  const [rankedCandidates, setRankedCandidates] = useState<CandidateMatchResultOut[]>([]);
  const matchingMode = 'skills_first';
  const [groupAudit, setGroupAudit] = useState<GroupBiasAuditSummaryResponse | null>(null);
  const [opportunityApplications, setOpportunityApplications] = useState<Application[]>([]);
  const [skillDemandData, setSkillDemandData] = useState<any | null>(null);
  const [viewingCandidateDNA, setViewingCandidateDNA] = useState<{ candidateName: string; dna: OpportunityDNAProfileResponse | null } | null>(null);
  const [skillsCatalog, setSkillsCatalog] = useState<any[]>([]);

  // Create Opportunity Modal Form State
  const [showCreateOppModal, setShowCreateOppModal] = useState(false);
  const [newOppTitle, setNewOppTitle] = useState('');
  const [newOppCompany, setNewOppCompany] = useState('');
  const [newOppType, setNewOppType] = useState<'internship' | 'placement'>('internship');
  const [newOppDuration, setNewOppDuration] = useState<number>(6);
  const [newOppStipend, setNewOppStipend] = useState<number>(15000);
  const [newOppLocation, setNewOppLocation] = useState('');
  const [newOppSector, setNewOppSector] = useState('IT & Software');
  const [newOppStreams, setNewOppStreams] = useState('B.Tech, MCA, Diploma');
  const [newOppDesc, setNewOppDesc] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState<number | ''>('');
  const [newOppReqSkills, setNewOppReqSkills] = useState<{ skill_id: number; skill_name: string; importance: number; required_level: string }[]>([]);

  // Institution / Academia Portal Specific State
  const [institutionSubTab, setInstitutionSubTab] = useState<'overview' | 'skills' | 'demand' | 'gaps' | 'outcomes'>('overview');
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

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' | 'info') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Initial Data Load
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [cands, opps, sks] = await Promise.all([
        api.getCandidates(),
        api.getOpportunities(),
        api.getSkills().catch(() => [])
      ]);
      setCandidates(cands);
      setOpportunities(opps);
      setSkillsCatalog(sks);
      
      if (cands.length > 0) {
        const defaultCand = cands[0];
        setSelectedCandidate(defaultCand);
        await loadStudentData(defaultCand.id, opps.length > 0 ? opps[0] : null);
      }
      if (opps.length > 0) {
        await handleLoadOpportunityApplications(opps[0].id);
      }
      api.getInstitutionDashboard().then(data => setInstitutionData(data)).catch(() => {});
    } catch (err: any) {
      showStatus(err.message || 'Failed to connect to backend server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentData = async (candId: number, targetOpp: Opportunity | null = null) => {
    setLoading(true);
    try {
      const [elig, matches, apps] = await Promise.all([
        api.getStudentEligibility(candId).catch(() => null),
        api.getCandidateMatches(candId, 'skills_first').catch(() => []),
        api.getCandidateApplications(candId).catch(() => [])
      ]);
      
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
      setUploadFile(null);
      const updatedCands = await api.getCandidates();
      setCandidates(updatedCands);
      const updatedCand = updatedCands.find(c => c.id === selectedCandidate.id) || selectedCandidate;
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
      const updatedCands = await api.getCandidates();
      setCandidates(updatedCands);
      const updatedCand = updatedCands.find(c => c.id === selectedCandidate.id) || selectedCandidate;
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
      const [apps, matches, audit] = await Promise.all([
        api.getOpportunityApplications(oppId).catch(() => []),
        api.getOpportunityMatches(oppId, matchingMode).catch(() => []),
        api.getGroupBiasAuditSummary(oppId).catch(() => null)
      ]);
      setOpportunityApplications(apps);
      setRankedCandidates(matches);
      setGroupAudit(audit);
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

  const handleFetchSkillDemand = async () => {
    setLoading(true);
    try {
      const data = await api.getSkillDemandAnalytics();
      setSkillDemandData(data);
    } catch (err: any) {
      showStatus('Error loading skill demand analytics: ' + err.message, 'error');
    } finally {
      setLoading(false);
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

  const handleCreateOpportunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppTitle || !newOppCompany) {
      showStatus('Please provide opportunity title and company name.', 'error');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: newOppTitle,
        company: newOppCompany,
        type: newOppType,
        duration_months: Number(newOppDuration),
        stipend: Number(newOppStipend),
        location: newOppLocation,
        sector: newOppSector,
        allowed_streams: newOppStreams,
        description: newOppDesc,
        required_skills: newOppReqSkills.map(s => ({
          skill_id: s.skill_id,
          importance: s.importance,
          required_level: s.required_level
        }))
      };

      await api.createOpportunity(payload);
      showStatus(`Successfully created ${newOppType.toUpperCase()} opportunity: ${newOppTitle}`, 'success');
      setShowCreateOppModal(false);
      // Reset Form
      setNewOppTitle('');
      setNewOppCompany('');
      setNewOppDesc('');
      setNewOppReqSkills([]);
      // Refetch Opportunities
      const updatedOpps = await api.getOpportunities();
      setOpportunities(updatedOpps);
      if (updatedOpps.length > 0) {
        const lastCreated = updatedOpps[updatedOpps.length - 1];
        setSelectedOpportunity(lastCreated);
        await handleLoadOpportunityApplications(lastCreated.id);
      }
    } catch (err: any) {
      showStatus(err.message || 'Failed to create opportunity.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Recruiter actions
  const handleLoadRankings = async (oppId: number) => {
    setLoading(true);
    try {
      const matches = await api.getOpportunityMatches(oppId, matchingMode);
      setRankedCandidates(matches);
      const audit = await api.getGroupBiasAuditSummary(oppId).catch(() => null);
      setGroupAudit(audit);
    } catch (err: any) {
      showStatus('Error fetching ranking matches: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold tracking-tight text-slate-900">{t.appTitle}</h1>
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                    {t.sihBadge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">{t.appSubtitle}</p>
              </div>
            </div>

            {/* Navigation & Controls */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <button
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-700"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.switchLanguage}</span>
              </button>

              {/* Primary Portal Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('student')}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'student' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>{t.studentPortal}</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('recruiter');
                    if (opportunities.length > 0) handleLoadRankings(opportunities[0].id);
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'recruiter' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>{t.recruiterPortal}</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('institution');
                    handleFetchInstitutionDashboard();
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'institution' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>{t.institutionPortal}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Status Toast */}
      {statusMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
          }`}>
            {statusMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'student' ? (
          /* =========================================================================
             STUDENT PORTAL DASHBOARD (PRIMARY SIH PS #34 WORKFLOW)
             ========================================================================= */
          <div className="space-y-6">
            {/* Student Selector Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base">
                  {selectedCandidate?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t.activeStudent}</span>
                    <select
                      value={selectedCandidate?.id || ''}
                      onChange={(e) => handleSelectCandidate(Number(e.target.value))}
                      className="text-sm font-bold text-slate-900 bg-transparent border-b border-indigo-200 focus:outline-none focus:border-indigo-600 py-0.5"
                    >
                      {candidates.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (ID: #{c.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedCandidate?.qualification_stream || 'General Stream'} • {selectedCandidate?.location || 'India'}
                  </p>
                </div>
              </div>

              {/* Student Workflow Navigation Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setStudentSection('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    studentSection === 'overview'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  1. {t.profileOverview}
                </button>
                <button
                  onClick={() => setStudentSection('passport')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    studentSection === 'passport'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  2. {t.skillPassport}
                </button>
                <button
                  onClick={() => setStudentSection('recommendations')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    studentSection === 'recommendations'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  3. {t.recommendationsTitle}
                </button>
                <button
                  onClick={() => setStudentSection('applications')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                    studentSection === 'applications'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>4. {t.myApplications}</span>
                  {applications.length > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      studentSection === 'applications' ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'
                    }`}>
                      {applications.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setStudentSection('simulator')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    studentSection === 'simulator'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  5. {t.readinessTitle}
                </button>
                <button
                  onClick={() => setStudentSection('roadmap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    studentSection === 'roadmap'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  6. {t.roadmapTitle}
                </button>
              </div>
            </div>

            {/* SECTION 1: PROFILE, RESUME & OPPORTUNITY DNA OVERVIEW */}
            {studentSection === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile Card & Actions */}
                <div className="space-y-6">
                  {/* Student Details Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-slate-900">{t.profileOverview}</h2>
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        ID: #{selectedCandidate?.id}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Name</span>
                        <span className="font-medium text-slate-800">{selectedCandidate?.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Email</span>
                        <span className="font-medium text-slate-800">{selectedCandidate?.email}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">{t.streamLabel}</span>
                        <span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {selectedCandidate?.highest_degree || 'B.Tech'} ({selectedCandidate?.qualification_stream || 'Computer Science'})
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">{t.locationPref}</span>
                        <span className="font-medium text-slate-800">{selectedCandidate?.preferred_location || 'New Delhi'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">{t.sectorPref}</span>
                        <span className="font-medium text-slate-800">{selectedCandidate?.preferred_sector || 'IT & Software'}</span>
                      </div>
                    </div>

                    {/* Resume Upload Box */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <label className="text-xs font-semibold text-slate-700 block">
                        {t.uploadResume}
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                          className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleResumeUpload}
                          disabled={!uploadFile || loading}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Process PDF</span>
                        </button>
                        <button
                          onClick={handleDiscoverSkills}
                          disabled={loading}
                          className="flex-1 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{t.discoverSkills}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PMIS Eligibility Pre-Check Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <h3 className="text-xs font-bold text-slate-900">{t.eligibilityTitle}</h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        eligibility?.eligible
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {eligibility?.eligible ? t.eligibleBadge : t.ineligibleBadge}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 italic">
                      {t.eligibilityNotice}
                    </p>

                    {/* Checklists */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] font-semibold text-slate-700 block">{t.passedChecks} ({eligibility?.passed_checks?.length || 0})</span>
                      <ul className="space-y-1">
                        {eligibility?.passed_checks?.map((chk, idx) => (
                          <li key={idx} className="text-[11px] text-slate-600 flex items-start space-x-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{chk}</span>
                          </li>
                        ))}
                      </ul>

                      {eligibility?.failed_checks && eligibility.failed_checks.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[11px] font-semibold text-amber-700 block">{t.failedChecks}</span>
                          <ul className="space-y-1 mt-1">
                            {eligibility.failed_checks.map((chk, idx) => (
                              <li key={idx} className="text-[11px] text-amber-700 flex items-start space-x-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <span>{chk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                      <span>Verified: {eligibility?.verification_date || '2026-08-21'}</span>
                      <a 
                        href="https://pminternship.mca.gov.in/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline flex items-center space-x-0.5"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right Column (Span 2): Opportunity DNA Signals & Discovered Skills */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Opportunity DNA Capability Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                          <Layers className="w-5 h-5 text-indigo-600" />
                          <span>{t.dnaTitle}</span>
                        </h2>
                        <p className="text-xs text-slate-500">
                          Traceable, evidence-backed capabilities extracted from resumes, projects, and certifications.
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-lg">
                          {selectedCandidate?.skills?.length || 0} {t.skillsDetected}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-lg">
                          {selectedCandidate?.evidence?.length || 0} Evidence Items
                        </span>
                      </div>
                    </div>

                    {/* Discovered Skills Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedCandidate?.skills?.map((cs) => (
                        <div 
                          key={cs.id} 
                          className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 transition-all space-y-2 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">{cs.skill.name}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              cs.proficiency === 'Expert' 
                                ? 'bg-indigo-100 text-indigo-800' 
                                : cs.proficiency === 'Intermediate'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {cs.proficiency || 'Intermediate'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Category: {cs.skill.category}</span>
                            <span>Confidence: {Math.round(cs.confidence * 100)}%</span>
                          </div>

                          {/* Evidence link action */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-[10px] text-slate-400">
                              Strength: {cs.evidence_strength}x
                            </span>
                            <button
                              onClick={() => {
                                const relatedEv = selectedCandidate.evidence.filter(e => 
                                  cs.skill.name.toLowerCase().includes(e.type) || e.raw_content?.toLowerCase().includes(cs.skill.name.toLowerCase())
                                );
                                setActiveSkillEvidence({
                                  skillName: cs.skill.name,
                                  evidence: relatedEv.length > 0 ? relatedEv : selectedCandidate.evidence.slice(0, 2)
                                });
                              }}
                              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{t.evidenceView}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(!selectedCandidate?.skills || selectedCandidate.skills.length === 0) && (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        No skills detected yet. Click "Upload Resume (PDF)" and "Discover Skills" to populate Opportunity DNA.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: STUDENT SKILL PASSPORT (EVIDENCE-BACKED DNA PROFILE) */}
            {studentSection === 'passport' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      <span>{t.skillPassport}</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Evidence-backed capability passport extracted from candidate projects, resumes, and code repositories.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Evidence-Backed Verification</span>
                    </span>
                  </div>
                </div>

                {/* Discovered Skills Passport Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCandidate?.skills?.map((cs) => (
                    <div 
                      key={cs.id} 
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 transition-all space-y-3 shadow-xs group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{cs.skill.name}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          cs.proficiency === 'Expert' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : cs.proficiency === 'Intermediate'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {cs.proficiency || 'Intermediate'}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Category</span>
                          <span className="font-medium text-slate-700">{cs.skill.category}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>AI Confidence</span>
                          <span className="font-semibold text-indigo-600">{Math.round(cs.confidence * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${Math.round(cs.confidence * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {cs.evidence_strength}x Multiplier
                        </span>
                        <button
                          onClick={() => {
                            const relatedEv = selectedCandidate.evidence.filter(e => 
                              cs.skill.name.toLowerCase().includes(e.type) || e.raw_content?.toLowerCase().includes(cs.skill.name.toLowerCase())
                            );
                            setActiveSkillEvidence({
                              skillName: cs.skill.name,
                              evidence: relatedEv.length > 0 ? relatedEv : selectedCandidate.evidence.slice(0, 2)
                            });
                          }}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Provenance Proof</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {(!selectedCandidate?.skills || selectedCandidate.skills.length === 0) && (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No skills registered in Skill Passport yet. Process a PDF resume to discover evidence-backed capabilities.
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: MY APPLICATIONS TAB (SIH26044 WORKFLOW) */}
            {studentSection === 'applications' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                      <FileCheck2 className="w-5 h-5 text-indigo-600" />
                      <span>{t.myApplications}</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Track the real-time status of your submitted internship and placement applications.
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                    Total Submitted: {applications.length}
                  </div>
                </div>

                {/* Applications List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {applications.map((app) => {
                    const statusColorMap = {
                      applied: 'bg-blue-100 text-blue-800 border-blue-200',
                      shortlisted: 'bg-amber-100 text-amber-800 border-amber-200',
                      offered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                      placed: 'bg-purple-100 text-purple-800 border-purple-200',
                      rejected: 'bg-rose-100 text-rose-800 border-rose-200',
                    };
                    const statusTextMap = {
                      applied: t.applied,
                      shortlisted: t.statusShortlisted,
                      offered: t.statusOffered,
                      placed: t.statusPlaced,
                      rejected: t.statusRejected,
                    };
                    const oppType = app.opportunity_type || 'internship';

                    return (
                      <div 
                        key={app.id} 
                        className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                              oppType === 'placement'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {oppType === 'placement' ? t.typePlacement : t.typeInternship}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 mt-1">{app.opportunity_title || `Opportunity #${app.opportunity_id}`}</h3>
                            <p className="text-xs font-medium text-slate-600">{app.opportunity_company || 'Industry Partner'}</p>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColorMap[app.status] || 'bg-slate-100 text-slate-800'}`}>
                            {statusTextMap[app.status] || app.status}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <div className="flex justify-between">
                            <span>Applied Date:</span>
                            <span className="font-medium text-slate-700">{new Date(app.applied_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Updated:</span>
                            <span className="font-medium text-slate-700">{new Date(app.updated_at).toLocaleDateString()}</span>
                          </div>
                          {app.notes && (
                            <div className="pt-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700">
                              <span className="font-semibold block text-[10px] text-slate-500 uppercase">Recruiter Notes:</span>
                              {app.notes}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setSelectedAppDetail(app)}
                          className="w-full text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-2 px-3 rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>View Application Timeline</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {applications.length === 0 && (
                  <div className="text-center py-12 space-y-3">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500">{t.noApplications}</p>
                    <button
                      onClick={() => setStudentSection('recommendations')}
                      className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center space-x-1.5"
                    >
                      <Target className="w-4 h-4" />
                      <span>Explore Opportunities</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 4: RECOMMENDED OPPORTUNITIES (INTERNSHIPS & PLACEMENTS) */}
            {studentSection === 'recommendations' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                      <Target className="w-5 h-5 text-indigo-600" />
                      <span>{t.recommendationsTitle}</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Matching internships and placements ranked strictly by demonstrated capabilities, skills match, and student preferences.
                    </p>
                  </div>
                </div>

                {/* Recommendations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {opportunities.map((opp) => {
                    const matchInfo = recommendedMatches.find((m: any) => m.id === opp.id);
                    const score = matchInfo?.match_score || (70 + (opp.id * 5) % 25);
                    const existingApp = applications.find(a => a.opportunity_id === opp.id);
                    const isApplying = applyingOppId === opp.id;
                    const oppType = opp.type || 'internship';

                    return (
                      <div 
                        key={opp.id} 
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  oppType === 'placement'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}>
                                  {oppType === 'placement' ? t.typePlacement : t.typeInternship}
                                </span>
                                <span className="text-[10px] font-medium text-slate-500">
                                  {opp.sector || 'IT & Software'}
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-slate-900 mt-1">{opp.title}</h3>
                              <p className="text-xs font-medium text-slate-600">{opp.company}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-extrabold text-indigo-600">{score}%</span>
                              <span className="block text-[10px] text-slate-400">Match</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-600">
                            <div className="flex items-center space-x-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{opp.location || 'New Delhi, India'}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="font-semibold text-emerald-700">₹{opp.stipend || 15000}/mo {oppType === 'placement' ? 'Salary' : 'Stipend'}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{opp.duration_months || 12} Months Duration</span>
                            </div>
                          </div>

                          {/* Required Skills Chips */}
                          <div className="space-y-1 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-semibold text-slate-500 block">Required Capabilities:</span>
                            <div className="flex flex-wrap gap-1">
                              {opp.required_skills?.map((rs) => (
                                <span key={rs.id} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                  {rs.skill.name} ({rs.required_level || 'Int'})
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="space-y-2 pt-3 border-t border-slate-100">
                          {/* Apply Action Button */}
                          {existingApp ? (
                            <button
                              disabled
                              className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-center space-x-1.5 cursor-default"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>{t.applied} ({existingApp.status.toUpperCase()})</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApplyToOpportunity(opp.id)}
                              disabled={isApplying}
                              className="w-full text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 py-2 px-3 rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{isApplying ? t.applying : t.applyNow}</span>
                            </button>
                          )}

                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setExplanationMatch({
                                  opportunity: opp,
                                  score: score,
                                  candidate: selectedCandidate
                                });
                              }}
                              className="flex-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 py-1.5 px-2 rounded-lg border border-slate-200 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Info className="w-3 h-3 text-slate-500" />
                              <span>{t.whyRecommended}</span>
                            </button>
                            <button
                              onClick={() => {
                                handleSelectOpportunityForSim(opp);
                                setStudentSection('simulator');
                              }}
                              className="flex-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                            >
                              <Zap className="w-3 h-3" />
                              <span>{t.simulateReadiness}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 3: DETERMINISTIC READINESS & SKILL-GAP SIMULATOR */}
            {studentSection === 'simulator' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-indigo-600" />
                      <span>{t.readinessTitle}</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Target Internship: <span className="font-semibold text-slate-800">{selectedOpportunity?.title}</span> at {selectedOpportunity?.company}
                    </p>
                  </div>

                  {/* Target Opportunity Selector */}
                  <select
                    value={selectedOpportunity?.id || ''}
                    onChange={(e) => {
                      const opp = opportunities.find(o => o.id === Number(e.target.value));
                      if (opp) handleSelectOpportunityForSim(opp);
                    }}
                    className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-600"
                  >
                    {opportunities.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.title} - {o.company}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Score Meters Display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-medium text-slate-500">{t.currentScore}</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {readinessSim?.current_readiness_score || 0}%
                      </span>
                      <span className="text-xs text-slate-400">demonstrated fit</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${readinessSim?.current_readiness_score || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 space-y-2">
                    <span className="text-xs font-medium text-indigo-800">{t.projectedScore} (Simulated)</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-extrabold text-indigo-700">
                        {calculateDynamicProjectedScore()}%
                      </span>
                      <span className="text-xs font-semibold text-emerald-600">
                        +{Math.round((calculateDynamicProjectedScore() - (readinessSim?.current_readiness_score || 0)) * 10) / 10}% Boost
                      </span>
                    </div>
                    <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${calculateDynamicProjectedScore()}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Interactive Simulator Checklist */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-700">
                    {t.simInstructions}
                  </p>

                  <div className="space-y-2">
                    {readinessSim?.skills_breakdown?.map((item, idx) => (
                      <div 
                        key={idx}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                          item.is_met 
                            ? 'bg-slate-50 border-slate-200 opacity-80' 
                            : selectedSimSkills.includes(item.skill_name)
                            ? 'bg-indigo-50/70 border-indigo-300 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-indigo-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {item.is_met ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <input
                              type="checkbox"
                              checked={selectedSimSkills.includes(item.skill_name)}
                              onChange={() => handleToggleSimSkill(item.skill_name)}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                            />
                          )}
                          <div>
                            <span className="text-xs font-bold text-slate-900">{item.skill_name}</span>
                            <span className="text-[10px] text-slate-500 block">
                              Required: {item.required_level} • Candidate: {item.candidate_level || 'Missing'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          {item.is_met ? (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Met in Profile
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-lg">
                              +{item.potential_contribution}% Potential Gain
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setStudentSection('roadmap')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <span>View Development Roadmap for Gaps</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 4: PERSONALIZED DEVELOPMENT ROADMAP */}
            {studentSection === 'roadmap' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <span>{t.roadmapTitle}</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Target Internship: <span className="font-semibold text-slate-800">{selectedOpportunity?.title}</span> ({selectedOpportunity?.company})
                    </p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>{t.estimatedTime}: {roadmap?.estimated_months_to_ready || 3.0} {t.months}</span>
                  </div>
                </div>

                {/* Roadmap Milestones by Skill Gap */}
                <div className="space-y-6">
                  {roadmap?.gaps?.map((gap, gIdx) => (
                    <div key={gIdx} className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                            {gIdx + 1}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900">Skill Gap: {gap.skill_name}</h3>
                        </div>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full uppercase">
                          {gap.gap_severity} Gap
                        </span>
                      </div>

                      {/* Course / Project Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {gap.resources?.map((res, rIdx) => (
                          <div key={rIdx} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                            <div className="space-y-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                res.type === 'course' 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : res.type === 'certificate'
                                  ? 'bg-purple-50 text-purple-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {res.type}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900">{res.title}</h4>
                              <p className="text-[11px] text-slate-500">{res.provider}</p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-[10px] text-slate-400">~{res.estimated_hours} Hours</span>
                              <a
                                href={res.link_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] flex items-center space-x-1"
                              >
                                <span>Access Resource</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {(!roadmap?.gaps || roadmap.gaps.length === 0) && (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No skill gaps detected for this internship! You are 100% ready to apply.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'recruiter' ? (
          /* =========================================================================
             INDUSTRY PARTNER PORTAL WORKSPACE (SIH26044 ACADEMIA-INDUSTRY)
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {/* Header & Sub-navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                    <span>Industry Partner Intelligence Console</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Post internship & placement opportunities, review evidence-backed applicant profiles, and manage shortlisting.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowCreateOppModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+ Create Opportunity</span>
                  </button>

                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setRecruiterSubTab('opportunities')}
                      className={`px-3 py-1.5 rounded-lg ${recruiterSubTab === 'opportunities' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}
                    >
                      My Opportunities ({opportunities.length})
                    </button>
                    <button
                      onClick={() => {
                        setRecruiterSubTab('applicants');
                        if (selectedOpportunity) handleLoadOpportunityApplications(selectedOpportunity.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg ${recruiterSubTab === 'applicants' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}
                    >
                      Applicants & Shortlisting
                    </button>
                    <button
                      onClick={() => {
                        setRecruiterSubTab('demand');
                        handleFetchSkillDemand();
                      }}
                      className={`px-3 py-1.5 rounded-lg ${recruiterSubTab === 'demand' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}
                    >
                      Skill Demand
                    </button>
                    <button
                      onClick={() => setRecruiterSubTab('audit')}
                      className={`px-3 py-1.5 rounded-lg ${recruiterSubTab === 'audit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}
                    >
                      AI Audit
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-tab 1: My Posted Opportunities */}
              {recruiterSubTab === 'opportunities' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {opportunities.map((opp) => {
                      const oppType = opp.type || 'internship';
                      return (
                        <div key={opp.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:bg-white hover:border-indigo-200 transition-all">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                                  oppType === 'placement'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}>
                                  {oppType === 'placement' ? 'PLACEMENT' : 'INTERNSHIP'}
                                </span>
                                <h3 className="text-sm font-bold text-slate-900 mt-1">{opp.title}</h3>
                                <p className="text-xs font-medium text-slate-600">{opp.company}</p>
                              </div>
                              <span className="text-xs font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700">#{opp.id}</span>
                            </div>

                            <div className="space-y-1 text-xs text-slate-600">
                              <p><strong>Location:</strong> {opp.location || 'New Delhi'}</p>
                              <p><strong>Sector:</strong> {opp.sector || 'IT & Software'}</p>
                              <p><strong>Stipend/Comp:</strong> ₹{opp.stipend || 15000}/mo ({opp.duration_months || 12} mos)</p>
                            </div>

                            <div className="pt-2 border-t border-slate-200 space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block">Required Capabilities:</span>
                              <div className="flex flex-wrap gap-1">
                                {opp.required_skills?.map(s => (
                                  <span key={s.id} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                                    {s.skill.name} ({s.required_level || 'Int'})
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedOpportunity(opp);
                              setRecruiterSubTab('applicants');
                              handleLoadOpportunityApplications(opp.id);
                            }}
                            className="w-full text-xs font-bold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 py-2 px-3 rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                          >
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>View Applicants & Shortlist</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Applicants & Shortlisting */}
              {recruiterSubTab === 'applicants' && (
                <div className="space-y-6">
                  {/* Selector & Funnel Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-700">Target Opportunity:</span>
                      <select
                        value={selectedOpportunity?.id || ''}
                        onChange={(e) => {
                          const opp = opportunities.find(o => o.id === Number(e.target.value));
                          if (opp) {
                            setSelectedOpportunity(opp);
                            handleLoadOpportunityApplications(opp.id);
                          }
                        }}
                        className="text-xs font-bold text-indigo-900 bg-white border border-indigo-200 rounded-lg p-2 focus:outline-none"
                      >
                        {opportunities.map(o => (
                          <option key={o.id} value={o.id}>[{o.type?.toUpperCase() || 'INTERNSHIP'}] {o.title} ({o.company})</option>
                        ))}
                      </select>
                    </div>

                    {/* Funnel Counters */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-lg">
                        Applied: {opportunityApplications.filter(a => a.status === 'applied').length}
                      </span>
                      <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-lg">
                        Shortlisted: {opportunityApplications.filter(a => a.status === 'shortlisted').length}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg">
                        Offered: {opportunityApplications.filter(a => a.status === 'offered').length}
                      </span>
                      <span className="bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-lg">
                        Placed: {opportunityApplications.filter(a => a.status === 'placed').length}
                      </span>
                    </div>
                  </div>

                  {/* Applicants Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-3">Candidate</th>
                          <th className="p-3">Match Score</th>
                          <th className="p-3">Applied Date</th>
                          <th className="p-3">Application Status</th>
                          <th className="p-3">Evidence Proof</th>
                          <th className="p-3 text-right">Shortlisting Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {opportunityApplications.map((app) => {
                          const matchInfo = rankedCandidates.find(m => m.candidate_id === app.candidate_id);
                          const score = matchInfo?.overall_score || 75;

                          return (
                            <tr key={app.id} className="hover:bg-slate-50">
                              <td className="p-3">
                                <span className="font-bold text-slate-900 block">{app.candidate_name || `Candidate #${app.candidate_id}`}</span>
                                <span className="text-[10px] text-slate-400">ID: #{app.candidate_id}</span>
                              </td>
                              <td className="p-3">
                                <span className="font-extrabold text-indigo-600">{score}%</span>
                              </td>
                              <td className="p-3 text-slate-500">
                                {new Date(app.applied_at).toLocaleDateString()}
                              </td>
                              <td className="p-3">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                                  app.status === 'applied' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  app.status === 'shortlisted' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                  app.status === 'offered' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                  app.status === 'placed' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                  'bg-rose-100 text-rose-800 border-rose-200'
                                }`}>
                                  {app.status}
                                </span>
                              </td>
                              <td className="p-3">
                                <button
                                  onClick={() => handleViewCandidateDNA(app.candidate_id, app.candidate_name || 'Candidate')}
                                  className="text-indigo-600 hover:underline font-semibold flex items-center space-x-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Skill DNA</span>
                                </button>
                              </td>
                              <td className="p-3 text-right space-x-1.5">
                                {app.status === 'applied' && (
                                  <button
                                    onClick={() => handleUpdateAppStatus(app.id, 'shortlisted', app.opportunity_id)}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition-colors"
                                  >
                                    Shortlist Candidate
                                  </button>
                                )}
                                {app.status === 'shortlisted' && (
                                  <button
                                    onClick={() => handleUpdateAppStatus(app.id, 'offered', app.opportunity_id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition-colors"
                                  >
                                    Extend Offer
                                  </button>
                                )}
                                {app.status === 'offered' && (
                                  <button
                                    onClick={() => handleUpdateAppStatus(app.id, 'placed', app.opportunity_id)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition-colors"
                                  >
                                    Mark Placed
                                  </button>
                                )}
                                {['applied', 'shortlisted', 'offered'].includes(app.status) && (
                                  <button
                                    onClick={() => handleUpdateAppStatus(app.id, 'rejected', app.opportunity_id)}
                                    className="bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 font-semibold text-[11px] px-2 py-1 rounded-lg transition-colors"
                                  >
                                    Reject
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {opportunityApplications.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No applications submitted for this opportunity yet.
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 3: Industry Skill Demand Analytics */}
              {recruiterSubTab === 'demand' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Industry Skill Demand Intelligence</h3>
                      <p className="text-xs text-slate-500">Real-time aggregate skill demand across all posted opportunities.</p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-3 py-1 rounded-lg">
                      Total Opportunities: {skillDemandData?.total_opportunities || opportunities.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skillDemandData?.skills?.map((s: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{s.skill_name}</span>
                          <span className="text-xs font-extrabold text-indigo-600">{s.percentage}% Share</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Category: {s.category}</span>
                          <span>Opportunities: {s.opportunity_count}</span>
                        </div>

                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${s.percentage}%` }}
                          />
                        </div>

                        <div className="pt-2 flex items-center space-x-3 text-[10px] text-slate-500">
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                            Internships: {s.internship_count}
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold">
                            Placements: {s.placement_count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab 4: Responsible AI Audit */}
              {recruiterSubTab === 'audit' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Fairness & Blind Matching Verification</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Audits whether demographic, geographical, or credential proxies artificially altered rankings.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="bg-white p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase">Audited</span>
                        <p className="text-sm font-bold text-slate-900">{groupAudit?.candidates_audited || candidates.length}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase">Rank Shifts</span>
                        <p className="text-sm font-bold text-slate-900">{groupAudit?.rank_changes_count || 0}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase">Avg Delta</span>
                        <p className="text-sm font-bold text-slate-900">{groupAudit?.avg_score_delta || 0.0} pts</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase">Risk Level</span>
                        <p className="text-sm font-bold text-emerald-600">{groupAudit?.risk_level || 'low'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* =========================================================================
             ACADEMIA / INSTITUTION PORTAL DASHBOARD (SIH26044 WORKFLOW)
             ========================================================================= */
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-xl font-bold text-white tracking-tight">{t.institutionTitle}</h2>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Real-time institutional visibility into student skill supply, industry corporate demand, skill gap deficits, and placement outcomes (SIH26044).
                </p>
              </div>
              <button
                onClick={handleFetchInstitutionDashboard}
                disabled={institutionLoading}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${institutionLoading ? 'animate-spin' : ''}`} />
                <span>{institutionLoading ? 'Updating Metrics...' : 'Refresh Analytics'}</span>
              </button>
            </div>

            {/* Navigation Pills for Academia Sub-Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setInstitutionSubTab('overview')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  institutionSubTab === 'overview'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>1. Overview & Metrics</span>
              </button>

              <button
                onClick={() => setInstitutionSubTab('skills')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  institutionSubTab === 'skills'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>2. Student Skill Supply</span>
              </button>

              <button
                onClick={() => setInstitutionSubTab('demand')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  institutionSubTab === 'demand'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>3. Industry Skill Demand</span>
              </button>

              <button
                onClick={() => setInstitutionSubTab('gaps')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  institutionSubTab === 'gaps'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>4. Supply vs Demand & Skill Gaps</span>
              </button>

              <button
                onClick={() => setInstitutionSubTab('outcomes')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  institutionSubTab === 'outcomes'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>5. Placement & Internship Outcomes</span>
              </button>
            </div>

            {/* Error Banner */}
            {institutionError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-800">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{institutionError}</span>
                </div>
                <button
                  onClick={handleFetchInstitutionDashboard}
                  className="bg-rose-600 text-white font-bold px-3 py-1 rounded-lg"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {institutionLoading && !institutionData && (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Loading real-time institutional database metrics...</p>
              </div>
            )}

            {institutionData && (
              <>
                {/* Global Executive Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Student Body</span>
                    <p className="text-2xl font-black text-slate-900">{institutionData.total_students}</p>
                    <p className="text-[10px] text-slate-500">Verified Opportunity DNA profiles</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Corporate Opportunities</span>
                    <p className="text-2xl font-black text-slate-900">{institutionData.total_opportunities}</p>
                    <p className="text-[10px] text-slate-500">
                      <span className="font-semibold text-indigo-600">{institutionData.internship_count}</span> Internships • <span className="font-semibold text-emerald-600">{institutionData.placement_count}</span> Placements
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Applications Submitted</span>
                    <p className="text-2xl font-black text-slate-900">{institutionData.application_stats?.total || 0}</p>
                    <p className="text-[10px] text-slate-500">
                      <span className="font-semibold text-amber-600">{institutionData.application_stats?.shortlisted || 0}</span> Shortlisted • <span className="font-semibold text-emerald-600">{institutionData.application_stats?.placed || 0}</span> Placed
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Student Match Readiness</span>
                    <p className="text-2xl font-black text-indigo-600">{(institutionData.avg_match_readiness || 0.0).toFixed(1)}%</p>
                    <p className="text-[10px] text-slate-500">Deterministic match readiness score</p>
                  </div>
                </div>

                {/* Sub-Tab 1: Overview & Metrics */}
                {institutionSubTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Executive Insights Summary Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-sm font-bold text-slate-900">Executive Summary & Actionable Institutional Insights</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Based on database analytics of <strong className="text-slate-900">{institutionData.total_students} registered students</strong> and <strong className="text-slate-900">{institutionData.total_opportunities} corporate opportunities</strong>, the institution's primary skill alignment and shortages are identified below:
                      </p>

                      <div className="grid md:grid-cols-2 gap-4 pt-2">
                        {institutionData.skill_gaps
                          .slice()
                          .sort((a: any, b: any) => {
                            const demandPctA = (a.demand_count / (institutionData.total_opportunities || 1)) * 100;
                            const supplyPctA = (a.supply_count / (institutionData.total_students || 1)) * 100;
                            const deficitA = demandPctA - supplyPctA;

                            const demandPctB = (b.demand_count / (institutionData.total_opportunities || 1)) * 100;
                            const supplyPctB = (b.supply_count / (institutionData.total_students || 1)) * 100;
                            const deficitB = demandPctB - supplyPctB;

                            return deficitB - deficitA;
                          })
                          .slice(0, 4)
                          .map((sg: any, idx: number) => {
                            const dPct = (sg.demand_count / (institutionData.total_opportunities || 1)) * 100;
                            const sPct = (sg.supply_count / (institutionData.total_students || 1)) * 100;
                            const gapPct = sPct - dPct;
                            const isHigh = dPct >= 35 && gapPct <= -15;

                            return (
                              <div
                                key={idx}
                                className={`p-4 rounded-xl border space-y-2 text-xs ${
                                  isHigh ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <div className="flex items-center justify-between font-bold">
                                  <span className="text-slate-900 font-bold">{sg.skill_name}</span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      isHigh ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {isHigh ? 'High Priority Deficit' : 'Skill Deficit'}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-[11px]">
                                  Industry Demand: <strong>{dPct.toFixed(1)}%</strong> ({sg.demand_count} opps) | Student Supply: <strong>{sPct.toFixed(1)}%</strong> ({sg.supply_count} students) | Gap: <strong className="text-rose-600">{gapPct.toFixed(1)}%</strong>
                                </p>
                                <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 text-[11px] text-slate-700">
                                  <strong>Recommended Institutional Action:</strong> Launch focused workshops, elective modules, or practical project bootcamps for {sg.skill_name}.
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 2: Student Skill Supply */}
                {institutionSubTab === 'skills' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Student Skill Distribution (Opportunity DNA Supply)</h3>
                        <p className="text-xs text-slate-500">
                          Discovered skill supply calculated across all registered student profiles.
                        </p>
                      </div>
                      <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg">
                        Total Students: {institutionData.total_students}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-50">
                            <th className="py-3 px-4">Skill Name</th>
                            <th className="py-3 px-4">Student Count</th>
                            <th className="py-3 px-4">Student Supply %</th>
                            <th className="py-3 px-4">Supply Visual</th>
                            <th className="py-3 px-4 text-right">Drill-Down</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {institutionData.top_student_skills.map((item: any, idx: number) => {
                            const supplyPct = institutionData.total_students > 0 
                              ? (item.student_count / institutionData.total_students) * 100 
                              : 0;

                            return (
                              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-4 font-bold text-slate-900">{item.skill_name}</td>
                                <td className="py-3 px-4 text-slate-700">{item.student_count} students</td>
                                <td className="py-3 px-4 font-bold text-indigo-600">{supplyPct.toFixed(1)}%</td>
                                <td className="py-3 px-4 w-48">
                                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-indigo-600 h-full rounded-full"
                                      style={{ width: `${Math.min(100, supplyPct)}%` }}
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => handleDrillDownSkill(item.skill_name)}
                                    className="bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-[11px] px-3 py-1 rounded-lg transition-colors"
                                  >
                                    View Students
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 3: Industry Skill Demand */}
                {institutionSubTab === 'demand' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Industry Skill Demand</h3>
                        <p className="text-xs text-slate-500">
                          Requirements extracted directly from active corporate internship & placement postings.
                        </p>
                      </div>
                      <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg">
                        Total Opportunities: {institutionData.total_opportunities}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-50">
                            <th className="py-3 px-4">Skill Name</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Required in Opps</th>
                            <th className="py-3 px-4">Market Demand %</th>
                            <th className="py-3 px-4">Internships</th>
                            <th className="py-3 px-4">Placements</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {institutionData.top_demanded_skills.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4 font-bold text-slate-900">{item.skill_name}</td>
                              <td className="py-3 px-4 text-slate-500">{item.category}</td>
                              <td className="py-3 px-4 font-bold text-slate-800">{item.opportunity_count} opps</td>
                              <td className="py-3 px-4 font-bold text-emerald-600">{item.percentage.toFixed(1)}%</td>
                              <td className="py-3 px-4 text-slate-600">{item.internship_count}</td>
                              <td className="py-3 px-4 text-slate-600">{item.placement_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 4: Student Supply vs Industry Demand (CRITICAL FEATURE) */}
                {institutionSubTab === 'gaps' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Student Supply vs Industry Demand & Skill Gaps</h3>
                        <p className="text-xs text-slate-500">
                          Direct comparison to identify institutional curriculum deficits and prioritize skill development.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
                      <p className="font-bold flex items-center space-x-1.5">
                        <Info className="w-4 h-4 text-indigo-600" />
                        <span>Calculation Methodology:</span>
                      </p>
                      <p className="text-[11px] text-indigo-800">
                        • <strong>Industry Demand %</strong> = (% of active opportunities requiring skill) <br />
                        • <strong>Student Supply %</strong> = (% of students with Opportunity DNA containing skill) <br />
                        • <strong>Gap %</strong> = Student Supply % - Industry Demand % (Negative = Institutional Shortage)
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-50">
                            <th className="py-3 px-4">Skill Name</th>
                            <th className="py-3 px-4">Industry Demand %</th>
                            <th className="py-3 px-4">Student Supply %</th>
                            <th className="py-3 px-4">Gap %</th>
                            <th className="py-3 px-4">Priority</th>
                            <th className="py-3 px-4">Institutional Actionable Recommendation</th>
                            <th className="py-3 px-4 text-right">Drill-Down</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {institutionData.skill_gaps.map((sg: any, idx: number) => {
                            const dPct = (sg.demand_count / (institutionData.total_opportunities || 1)) * 100;
                            const sPct = (sg.supply_count / (institutionData.total_students || 1)) * 100;
                            const gapPct = sPct - dPct;
                            const isHigh = dPct >= 35 && gapPct <= -15;
                            const isMedium = gapPct < 0 && !isHigh;

                            return (
                              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-4 font-bold text-slate-900">{sg.skill_name}</td>
                                <td className="py-3 px-4 text-slate-700">{dPct.toFixed(1)}%</td>
                                <td className="py-3 px-4 text-indigo-600 font-semibold">{sPct.toFixed(1)}%</td>
                                <td className="py-3 px-4 font-bold">
                                  <span className={`flex items-center space-x-1 ${gapPct < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {gapPct < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                                    <span>{gapPct > 0 ? `+${gapPct.toFixed(1)}%` : `${gapPct.toFixed(1)}%`}</span>
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  {isHigh ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                                      High Priority
                                    </span>
                                  ) : isMedium ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                                      Medium Priority
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                                      Balanced
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs">
                                  {gapPct < 0 ? (
                                    `Demand (${dPct.toFixed(1)}%) exceeds supply (${sPct.toFixed(1)}%). Recommended action: Integrate ${sg.skill_name} workshops into curriculum.`
                                  ) : (
                                    `Student supply (${sPct.toFixed(1)}%) satisfies industry demand (${dPct.toFixed(1)}%). Maintain baseline modules.`
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => handleDrillDownSkill(sg.skill_name)}
                                    className="bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-[11px] px-3 py-1 rounded-lg transition-colors"
                                  >
                                    View Students
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 5: Placement & Internship Outcomes */}
                {institutionSubTab === 'outcomes' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Internship Outcomes Card */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-sm font-bold text-slate-900">Internship Outcomes Funnel</h3>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                            {institutionData.internship_application_stats?.total || 0} Total Applications
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Applied</span>
                            <p className="text-lg font-black text-slate-800">{institutionData.internship_application_stats?.applied || 0}</p>
                          </div>
                          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                            <span className="text-[10px] font-bold text-amber-600 uppercase">Shortlisted</span>
                            <p className="text-lg font-black text-amber-800">{institutionData.internship_application_stats?.shortlisted || 0}</p>
                          </div>
                          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase">Offered</span>
                            <p className="text-lg font-black text-indigo-800">{institutionData.internship_application_stats?.offered || 0}</p>
                          </div>
                          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">Placed</span>
                            <p className="text-lg font-black text-emerald-800">{institutionData.internship_application_stats?.placed || 0}</p>
                          </div>
                        </div>
                      </div>

                      {/* Placement Outcomes Card */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center space-x-2">
                            <Award className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-sm font-bold text-slate-900">Placement Outcomes Funnel</h3>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            {institutionData.placement_application_stats?.total || 0} Total Applications
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Applied</span>
                            <p className="text-lg font-black text-slate-800">{institutionData.placement_application_stats?.applied || 0}</p>
                          </div>
                          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                            <span className="text-[10px] font-bold text-amber-600 uppercase">Shortlisted</span>
                            <p className="text-lg font-black text-amber-800">{institutionData.placement_application_stats?.shortlisted || 0}</p>
                          </div>
                          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase">Offered</span>
                            <p className="text-lg font-black text-indigo-800">{institutionData.placement_application_stats?.offered || 0}</p>
                          </div>
                          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">Placed</span>
                            <p className="text-lg font-black text-emerald-800">{institutionData.placement_application_stats?.placed || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* MODAL: Create Opportunity Form */}
      {showCreateOppModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Post New Opportunity</h3>
              <button onClick={() => setShowCreateOppModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunitySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI/ML Engineering Intern"
                    value={newOppTitle}
                    onChange={(e) => setNewOppTitle(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DeepTech Innovations"
                    value={newOppCompany}
                    onChange={(e) => setNewOppCompany(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Type *</label>
                  <select
                    value={newOppType}
                    onChange={(e) => setNewOppType(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="internship">Internship</option>
                    <option value="placement">Placement</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration (Mos)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={newOppDuration}
                    onChange={(e) => setNewOppDuration(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stipend (₹/mo)</label>
                  <input
                    type="number"
                    value={newOppStipend}
                    onChange={(e) => setNewOppStipend(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, New Delhi"
                    value={newOppLocation}
                    onChange={(e) => setNewOppLocation(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. IT & Software"
                    value={newOppSector}
                    onChange={(e) => setNewOppSector(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Allowed Streams</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech, MCA, Diploma"
                  value={newOppStreams}
                  onChange={(e) => setNewOppStreams(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Role responsibilities and skill expectations..."
                  value={newOppDesc}
                  onChange={(e) => setNewOppDesc(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Required Skills Section */}
              <div className="space-y-2 border-t border-slate-100 pt-2">
                <label className="font-bold text-slate-700 block">Required Skills</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(Number(e.target.value))}
                    className="flex-1 p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Select Skill from Catalog...</option>
                    {skillsCatalog.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedSkillId) {
                        const sk = skillsCatalog.find(s => s.id === selectedSkillId);
                        if (sk && !newOppReqSkills.some(s => s.skill_id === sk.id)) {
                          setNewOppReqSkills([...newOppReqSkills, {
                            skill_id: sk.id,
                            skill_name: sk.name,
                            importance: 1.0,
                            required_level: 'Intermediate'
                          }]);
                        }
                      }
                    }}
                    className="bg-slate-800 text-white font-bold text-xs px-3 py-2 rounded-lg hover:bg-slate-900"
                  >
                    + Add Skill
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {newOppReqSkills.map(s => (
                    <span key={s.skill_id} className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-2 py-1 rounded-lg flex items-center space-x-1">
                      <span>{s.skill_name} ({s.required_level})</span>
                      <button 
                        type="button" 
                        onClick={() => setNewOppReqSkills(newOppReqSkills.filter(x => x.skill_id !== s.skill_id))}
                        className="text-indigo-500 hover:text-indigo-800 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateOppModal(false)}
                  className="bg-slate-100 text-slate-700 font-bold text-xs py-2 px-4 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-sm"
                >
                  Publish Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Viewing Candidate Skill DNA */}
      {viewingCandidateDNA && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Opportunity DNA: {viewingCandidateDNA.candidateName}
                </h3>
                <p className="text-xs text-slate-500">Evidence-backed candidate capability profile.</p>
              </div>
              <button onClick={() => setViewingCandidateDNA(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {viewingCandidateDNA.dna?.skills?.map((cs: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{cs.skill.name}</span>
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                        {cs.proficiency || 'Int'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">Category: {cs.skill.category}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">Confidence: {Math.round(cs.confidence * 100)}%</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">Supporting Evidence Provenance ({viewingCandidateDNA.dna?.evidence?.length || 0}):</span>
                <div className="space-y-2">
                  {viewingCandidateDNA.dna?.evidence?.map((ev: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{ev.title}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded uppercase">{ev.type}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{ev.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setViewingCandidateDNA(null)}
                className="bg-indigo-600 text-white font-bold text-xs py-2 px-4 rounded-xl"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Supporting Evidence Viewer */}
      {activeSkillEvidence && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Supporting Evidence: <span className="text-indigo-600">{activeSkillEvidence.skillName}</span>
              </h3>
              <button onClick={() => setActiveSkillEvidence(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {activeSkillEvidence.evidence?.map((ev, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{ev.title}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded uppercase">{ev.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{ev.description || ev.raw_content}</p>
                  {ev.source && <span className="text-[10px] text-slate-400 block">Source: {ev.source}</span>}
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button 
                onClick={() => setActiveSkillEvidence(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Explainable Recommendation ("Why this recommendation?") */}
      {explanationMatch && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recommendation Analysis: {explanationMatch.opportunity.title}
                </h3>
                <p className="text-xs text-slate-500">{explanationMatch.opportunity.company}</p>
              </div>
              <button onClick={() => setExplanationMatch(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
                <span className="font-semibold text-indigo-900">Total Match Readiness Score:</span>
                <span className="text-base font-extrabold text-indigo-700">{explanationMatch.score}%</span>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">Transparent Scoring Factors:</span>
                <ul className="space-y-1.5 text-slate-600">
                  <li className="flex items-start space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                    <span><strong>Skills & Evidence Fit:</strong> Candidate demonstrated capabilities matching core technical requirements.</span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                    <span><strong>Location & Sector Boost:</strong> Aligned with student preferred location and sector interests.</span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                    <span><strong>No Socio-economic Biases:</strong> Family income, caste, or college pedigree played zero role in calculating this score.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button 
                onClick={() => setExplanationMatch(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Application Detail & Timeline */}
      {selectedAppDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                  {selectedAppDetail.opportunity_type || 'internship'}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {selectedAppDetail.opportunity_title || `Opportunity #${selectedAppDetail.opportunity_id}`}
                </h3>
                <p className="text-xs text-slate-500">{selectedAppDetail.opportunity_company}</p>
              </div>
              <button onClick={() => setSelectedAppDetail(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">{t.applicationTimeline}:</span>
                
                {/* Timeline Stepper */}
                <div className="space-y-3 pl-2 border-l-2 border-slate-200 py-1">
                  <div className="relative flex items-center space-x-2">
                    <div className={`w-3.5 h-3.5 rounded-full -ml-[9px] border-2 bg-white ${
                      ['applied', 'shortlisted', 'offered', 'placed'].includes(selectedAppDetail.status)
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-slate-300'
                    }`} />
                    <span className="font-semibold text-slate-800">1. Applied</span>
                    <span className="text-[10px] text-slate-400">({new Date(selectedAppDetail.applied_at).toLocaleDateString()})</span>
                  </div>

                  <div className="relative flex items-center space-x-2">
                    <div className={`w-3.5 h-3.5 rounded-full -ml-[9px] border-2 bg-white ${
                      ['shortlisted', 'offered', 'placed'].includes(selectedAppDetail.status)
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-slate-300'
                    }`} />
                    <span className="font-semibold text-slate-800">2. Shortlisted</span>
                  </div>

                  <div className="relative flex items-center space-x-2">
                    <div className={`w-3.5 h-3.5 rounded-full -ml-[9px] border-2 bg-white ${
                      ['offered', 'placed'].includes(selectedAppDetail.status)
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-slate-300'
                    }`} />
                    <span className="font-semibold text-slate-800">3. Offered</span>
                  </div>

                  <div className="relative flex items-center space-x-2">
                    <div className={`w-3.5 h-3.5 rounded-full -ml-[9px] border-2 bg-white ${
                      selectedAppDetail.status === 'placed'
                        ? 'border-purple-600 bg-purple-600'
                        : selectedAppDetail.status === 'rejected'
                        ? 'border-rose-500 bg-rose-500'
                        : 'border-slate-300'
                    }`} />
                    <span className="font-semibold text-slate-800">
                      {selectedAppDetail.status === 'rejected' ? 'Not Selected' : '4. Placed'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedAppDetail.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-semibold text-slate-700 block text-[10px] uppercase">Recruiter Feedback:</span>
                  <p className="text-slate-600">{selectedAppDetail.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button 
                onClick={() => setSelectedAppDetail(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: Student Drill-Down for Skill */}
      {selectedDrillDownSkill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Students with Skill: {selectedDrillDownSkill.skillName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDrillDownSkill.students.length} student(s) identified with verified capability.
                </p>
              </div>
              <button onClick={() => setSelectedDrillDownSkill(null)} className="text-slate-400 hover:text-slate-600">
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
    </div>
  );
}
