import React, { useState } from 'react';
import { Users, Award, Sparkles, CheckCircle2, UserCheck, HelpCircle } from 'lucide-react';
import type { Opportunity, CandidateMatchResultOut, Application } from '../../types';

interface IndustryApplicantsProps {
  opportunities: Opportunity[];
  selectedOpportunity: Opportunity | null;
  rankedCandidates: CandidateMatchResultOut[];
  opportunityApplications: Application[];
  onSelectOpportunity: (oppId: number) => void;
  onUpdateStatus: (appId: number, status: string) => Promise<void>;
  onViewCandidateDNA: (candId: number, name: string) => void;
}

export const IndustryApplicants: React.FC<IndustryApplicantsProps> = ({
  opportunities,
  selectedOpportunity,
  rankedCandidates,
  opportunityApplications,
  onSelectOpportunity,
  onUpdateStatus,
  onViewCandidateDNA
}) => {
  const [activeTab, setActiveTab] = useState<'applicants' | 'recommendations'>('applicants');

  // Separate candidates who actually submitted an application vs candidates surfacing from engine recommendations
  const actualApplicants = rankedCandidates.filter(cand => 
    opportunityApplications.some(a => a.candidate_id === cand.candidate_id)
  );

  const recommendedCandidates = rankedCandidates.filter(cand => 
    !opportunityApplications.some(a => a.candidate_id === cand.candidate_id)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Applicants & Candidate Talent Pipeline</h1>
          <p className="text-xs text-slate-500">Review formal applicants and AI-surfaced candidates for your opportunity</p>
        </div>

        {/* Opportunity Selector */}
        <select
          value={selectedOpportunity?.id || ''}
          onChange={(e) => onSelectOpportunity(Number(e.target.value))}
          className="bg-white border border-slate-300 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        >
          {opportunities.map((opp) => (
            <option key={opp.id} value={opp.id}>
              {opp.title} ({opp.company})
            </option>
          ))}
        </select>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('applicants')}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'applicants'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Actual Applicants ({actualApplicants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'recommendations'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Recommended Talent ({recommendedCandidates.length})</span>
        </button>
      </div>

      {/* Actual Applicants Tab */}
      {activeTab === 'applicants' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Formal Job Applications ({actualApplicants.length})</span>
            </h2>
            <span className="text-xs text-slate-500">Official candidate submissions with active status funnel</span>
          </div>

          {actualApplicants.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No formal applications have been submitted for this position yet.
            </div>
          ) : (
            <div className="space-y-3">
              {actualApplicants.map((cand) => {
                const app = opportunityApplications.find(a => a.candidate_id === cand.candidate_id)!;
                const score = Math.round(cand.overall_score);

                return (
                  <div key={cand.candidate_id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{cand.candidate_name}</span>
                        <span className="text-xs text-slate-500">• Candidate #{cand.candidate_id}</span>
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 inline mr-0.5" />
                          Applied
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                          DNA Match: {score}%
                        </span>
                        <span className={`font-bold px-2 py-0.5 rounded capitalize ${
                          app.status === 'shortlisted' ? 'bg-amber-100 text-amber-800' :
                          app.status === 'offered' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'placed' ? 'bg-purple-100 text-purple-800' :
                          app.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          Status: {app.status}
                        </span>
                      </div>

                      {app.notes && (
                        <div className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                          <span className="font-semibold text-slate-700">Recruiter Notes:</span> {app.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onViewCandidateDNA(cand.candidate_id, cand.candidate_name)}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm"
                      >
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Inspect Skill DNA</span>
                      </button>

                      {app.status === 'applied' && (
                        <button
                          onClick={() => onUpdateStatus(app.id, 'shortlisted')}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                        >
                          Shortlist
                        </button>
                      )}

                      {app.status === 'shortlisted' && (
                        <button
                          onClick={() => onUpdateStatus(app.id, 'offered')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                        >
                          Offer Position
                        </button>
                      )}

                      {app.status === 'offered' && (
                        <button
                          onClick={() => onUpdateStatus(app.id, 'placed')}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                        >
                          Confirm Placement
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recommended Talent Tab */}
      {activeTab === 'recommendations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI-Surfaced Recommendations ({recommendedCandidates.length})</span>
            </h2>
            <div className="flex items-center space-x-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Matching candidates who have <strong>not</strong> formally applied yet</span>
            </div>
          </div>

          {recommendedCandidates.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              All matching candidates have already applied to this position.
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedCandidates.map((cand) => {
                const score = Math.round(cand.overall_score);

                return (
                  <div key={cand.candidate_id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{cand.candidate_name}</span>
                        <span className="text-xs text-slate-500">• Candidate #{cand.candidate_id}</span>
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                          Not Applied
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                          AI DNA Match: {score}%
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Surfaced by Matching Engine
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onViewCandidateDNA(cand.candidate_id, cand.candidate_name)}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm"
                      >
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Inspect DNA Profile</span>
                      </button>

                      <span className="text-[11px] font-semibold text-slate-400 italic bg-slate-100 px-2.5 py-1 rounded-lg">
                        Status mutation locked until candidate applies
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
