import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Target, CheckCircle2, Filter, Eye } from 'lucide-react';
import type { Opportunity, Application, Candidate } from '../../types';
import { OpportunityDetailModal } from '../../components/modals/OpportunityDetailModal';

interface StudentOpportunitiesProps {
  candidate: Candidate | null;
  opportunities: Opportunity[];
  recommendedMatches: any[];
  applications: Application[];
  onApply: (oppId: number) => Promise<void>;
  applyingOppId: number | null;
  onSelectForSim?: (opp: Opportunity) => void;
}

export const StudentOpportunities: React.FC<StudentOpportunitiesProps> = ({
  candidate,
  opportunities,
  recommendedMatches,
  applications,
  onApply,
  applyingOppId,
  onSelectForSim
}) => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<'all' | 'internship' | 'placement'>('all');
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<Opportunity | null>(null);

  const filteredOpps = opportunities.filter(opp => {
    if (filterType === 'all') return true;
    return (opp.type || 'internship') === filterType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Recommended Corporate Opportunities</h1>
          <p className="text-xs text-slate-500">PM Scheme Internships & Corporate Placements Matched to Your DNA</p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2 bg-white border border-slate-200 p-1 rounded-xl">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Positions
          </button>
          <button
            onClick={() => setFilterType('internship')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              filterType === 'internship' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Internships
          </button>
          <button
            onClick={() => setFilterType('placement')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              filterType === 'placement' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Placements
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOpps.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No opportunities match the selected criteria.
          </div>
        ) : (
          filteredOpps.map((opp) => {
            const match = recommendedMatches.find(m => m.opportunity_id === opp.id);
            const score = match ? Math.round(match.match_score * (match.match_score <= 1.0 ? 100 : 1)) : 0;
            const appliedApp = applications.find(a => a.opportunity_id === opp.id);
            const isApplying = applyingOppId === opp.id;

            return (
              <div key={opp.id} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm hover:border-indigo-200 transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${
                        opp.type === 'placement' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {opp.type || 'internship'}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">{opp.sector}</span>
                      {opp.duration_months && (
                        <span className="text-xs text-slate-400">• {opp.duration_months} Months</span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{opp.title}</h2>
                    <p className="text-xs font-semibold text-slate-700">{opp.company}</p>
                  </div>

                  <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl shrink-0">
                    <Target className="w-5 h-5 text-indigo-600" />
                    <div>
                      <div className="text-lg font-black text-slate-900 leading-none">{score}%</div>
                      <span className="text-[10px] font-bold text-slate-500">Skill Match Fit</span>
                    </div>
                  </div>
                </div>

                {opp.description && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    {opp.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-xs pt-2 text-slate-600">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opp.location || 'India'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-800">
                      Rs. {opp.stipend?.toLocaleString() || 15000} / month
                    </span>
                  </span>
                  {opp.allowed_streams && (
                    <span className="text-slate-500">
                      Eligible: <strong className="text-slate-700">{opp.allowed_streams}</strong>
                    </span>
                  )}
                </div>

                {/* Application CTA & Detail Modal Action */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500">
                    {appliedApp ? `Applied on ${new Date(appliedApp.applied_at).toLocaleDateString()}` : 'Real-time database submission'}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedOppForDetail(opp)}
                      className="text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    {appliedApp ? (
                      <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs px-4 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{appliedApp.status.toUpperCase()}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onApply(opp.id)}
                        disabled={isApplying}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-sm disabled:opacity-50"
                      >
                        {isApplying ? 'Submitting...' : 'Apply Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Opportunity Detail Modal */}
      {selectedOppForDetail && (
        <OpportunityDetailModal
          opportunity={selectedOppForDetail}
          candidate={candidate}
          matchInfo={recommendedMatches.find(m => m.opportunity_id === selectedOppForDetail.id)}
          application={applications.find(a => a.opportunity_id === selectedOppForDetail.id) || null}
          onClose={() => setSelectedOppForDetail(null)}
          onApply={onApply}
          applyingOppId={applyingOppId}
          onOpenReadiness={onSelectForSim ? (opp) => {
            onSelectForSim(opp);
            navigate('/student/readiness');
          } : undefined}
        />
      )}
    </div>
  );
};
