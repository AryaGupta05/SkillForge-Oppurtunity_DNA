import React from 'react';
import { Briefcase, Info, AlertCircle } from 'lucide-react';
import type { InstitutionDashboardResponse, UserResponse } from '../../types';

interface IndustryDemandViewProps {
  currentUser?: UserResponse | null;
  institutionData: InstitutionDashboardResponse | null;
}

export const IndustryDemandView: React.FC<IndustryDemandViewProps> = ({ currentUser, institutionData }) => {
  const instName = currentUser?.institution || 'Institution Scope';

  if (!institutionData) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
        <p className="font-bold text-slate-700">No industry demand data loaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <span>Market Industry Skill Demand</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Skills Demanded Across All Active Corporate Opportunities ({institutionData.total_opportunities} Total Opportunities)
          </p>
        </div>
        <span className="text-xs font-bold bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0">
          Global Market Demand
        </span>
      </div>

      {/* Clarification Alert Banner */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-xs text-emerald-900 shadow-2xs">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Market Demand vs. Institutional Supply Clarification</p>
          <p className="text-emerald-800 text-[11px]">
            The metrics below represent global industry requirements across corporate employers. Compare these against <strong className="text-slate-900">{instName}</strong> student supply in the Skill Gap Analysis view to identify curriculum alignment priorities.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <span>Top Demanded Skills Across Industry Opportunities</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">
            Ranked by Job Opportunity Postings
          </span>
        </div>

        {institutionData.top_demanded_skills.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No industry skill demand postings found in the system.
          </div>
        ) : (
          <div className="space-y-3">
            {institutionData.top_demanded_skills.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs shadow-2xs">
                <div className="flex justify-between font-bold text-slate-800">
                  <span className="text-sm">{item.skill_name} <span className="text-xs font-normal text-slate-500">({item.category})</span></span>
                  <span className="text-emerald-700 font-bold">{item.opportunity_count} Postings ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, item.percentage)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
