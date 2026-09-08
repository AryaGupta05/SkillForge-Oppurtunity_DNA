import React from 'react';
import { Users, Award } from 'lucide-react';
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
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Applicants & Candidate Skill DNA</h1>
          <p className="text-xs text-slate-500">Inspect Evidence-Backed DNA Profiles and Shortlist Qualified Candidates</p>
        </div>

        {/* Opportunity Selector */}
        <select
          value={selectedOpportunity?.id || ''}
          onChange={(e) => onSelectOpportunity(Number(e.target.value))}
          className="bg-white border border-slate-300 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {opportunities.map((opp) => (
            <option key={opp.id} value={opp.id}>
              {opp.title} ({opp.company})
            </option>
          ))}
        </select>
      </div>

      {/* Applicants List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Applicant Ranking & Status Funnel ({rankedCandidates.length})</span>
          </h2>
        </div>

        {rankedCandidates.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No applicants found for this position.
          </div>
        ) : (
          <div className="space-y-3">
            {rankedCandidates.map((cand) => {
              const app = opportunityApplications.find(a => a.candidate_id === cand.candidate_id);
              const score = Math.round(cand.overall_score);

              return (
                <div key={cand.candidate_id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{cand.candidate_name}</span>
                      <span className="text-xs text-slate-500">• Candidate #{cand.candidate_id}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                        Match Score: {score}%
                      </span>
                      {app && (
                        <span className={`font-bold px-2 py-0.5 rounded capitalize ${
                          app.status === 'shortlisted' ? 'bg-amber-100 text-amber-800' :
                          app.status === 'offered' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'placed' ? 'bg-purple-100 text-purple-800' :
                          app.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {app.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onViewCandidateDNA(cand.candidate_id, cand.candidate_name)}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Inspect DNA</span>
                    </button>

                    {app && app.status === 'applied' && (
                      <button
                        onClick={() => onUpdateStatus(app.id, 'shortlisted')}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm"
                      >
                        Shortlist Candidate
                      </button>
                    )}

                    {app && app.status === 'shortlisted' && (
                      <button
                        onClick={() => onUpdateStatus(app.id, 'offered')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
                      >
                        Offer Position
                      </button>
                    )}

                    {app && app.status === 'offered' && (
                      <button
                        onClick={() => onUpdateStatus(app.id, 'placed')}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm"
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
    </div>
  );
};
