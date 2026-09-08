import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  Briefcase, 
  Send, 
  Target, 
  TrendingUp, 
  ArrowRight, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import type { Candidate, Opportunity, Application, ReadinessSimulationResponse, StudentEligibilityResponse } from '../../types';

interface StudentDashboardProps {
  candidate: Candidate | null;
  eligibility: StudentEligibilityResponse | null;
  recommendedMatches: any[];
  applications: Application[];
  readinessSim: ReadinessSimulationResponse | null;
  opportunities: Opportunity[];
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  candidate,
  eligibility,
  recommendedMatches,
  applications,
  readinessSim,
  opportunities
}) => {
  const navigate = useNavigate();

  if (!candidate) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">No Student Profile Selected</h3>
        <p className="text-xs text-slate-500">Please sign in or select an active student profile.</p>
      </div>
    );
  }

  const skillCount = candidate.skills?.length || 0;
  const evidenceCount = candidate.evidence?.length || 0;
  const topMatch = recommendedMatches.length > 0 ? recommendedMatches[0] : null;
  const topMatchScore = topMatch ? Math.round(topMatch.match_score * (topMatch.match_score <= 1.0 ? 100 : 1)) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold bg-indigo-700/60 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              Student Dashboard
            </span>
            {eligibility && (
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                eligibility.eligible ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {eligibility.eligible ? '✓ PMIS Pre-Check Eligible' : '⚠ PMIS Review Flagged'}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black mt-2 tracking-tight">Welcome back, {candidate.name}</h1>
          <p className="text-xs text-indigo-200 mt-1">
            {candidate.institution} • {candidate.qualification_stream || candidate.highest_degree}
          </p>
        </div>

        <button
          onClick={() => navigate('/student/skills')}
          className="bg-white hover:bg-indigo-50 text-indigo-900 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>View Skill Passport</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Opportunity DNA</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{skillCount} Skills</div>
          <div className="text-[11px] text-slate-500">{evidenceCount} verified project evidence items</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Top Match Fit</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{topMatchScore}%</div>
          <div className="text-[11px] text-slate-500 truncate">
            {topMatch ? topMatch.opportunity_title : 'No active match'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">My Applications</span>
            <Send className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{applications.length}</div>
          <div className="text-[11px] text-slate-500">
            {applications.filter(a => a.status === 'shortlisted').length} shortlisted candidate status
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Skill Deficits</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {readinessSim ? readinessSim.missing_skills.length : 0} Gaps
          </div>
          <div className="text-[11px] text-slate-500">Identified for top internship fit</div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recommended Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <span>Recommended Corporate Positions</span>
            </h2>
            <button
              onClick={() => navigate('/student/opportunities')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {opportunities.slice(0, 3).map((opp) => {
              const match = recommendedMatches.find(m => m.opportunity_id === opp.id);
              const score = match ? Math.round(match.match_score * (match.match_score <= 1.0 ? 100 : 1)) : 0;
              const hasApplied = applications.some(a => a.opportunity_id === opp.id);

              return (
                <div key={opp.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {opp.type || 'internship'}
                        </span>
                        <span className="text-xs text-slate-500">{opp.location}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{opp.title}</h3>
                      <p className="text-xs text-slate-600">{opp.company}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-indigo-600">{score}%</div>
                      <span className="text-[10px] font-bold text-slate-400">Match Fit</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="font-semibold text-slate-700">
                      Stipend: Rs. {opp.stipend?.toLocaleString() || 15000}/mo
                    </span>
                    {hasApplied ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-lg">Applied ✓</span>
                    ) : (
                      <button
                        onClick={() => navigate('/student/opportunities')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1 rounded-lg text-xs"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Recent Applications & Skill Passport Preview */}
        <div className="space-y-6">
          {/* Applications Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Send className="w-4 h-4 text-indigo-600" />
                <span>Recent Applications</span>
              </h3>
              <button
                onClick={() => navigate('/student/applications')}
                className="text-[11px] font-bold text-indigo-600 hover:underline"
              >
                View ({applications.length})
              </button>
            </div>

            {applications.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No applications submitted yet.</p>
            ) : (
              <div className="space-y-2.5">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span className="truncate max-w-[140px]">{app.opportunity_title || `Opp #${app.opportunity_id}`}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        app.status === 'shortlisted' ? 'bg-amber-100 text-amber-800' :
                        app.status === 'offered' ? 'bg-emerald-100 text-emerald-800' :
                        app.status === 'placed' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{app.opportunity_company}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-5 rounded-2xl border border-indigo-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Next Recommended Action</h3>
            <p className="text-xs text-slate-600">
              Simulate how acquiring missing skills like Docker or SQL will boost your match score.
            </p>
            <button
              onClick={() => navigate('/student/readiness')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
            >
              Open Readiness Simulator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
