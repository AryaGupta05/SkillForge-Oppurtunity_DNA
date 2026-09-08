import React from 'react';
import { Briefcase } from 'lucide-react';
import type { InstitutionDashboardResponse } from '../../types';

interface IndustryDemandViewProps {
  institutionData: InstitutionDashboardResponse | null;
}

export const IndustryDemandView: React.FC<IndustryDemandViewProps> = ({ institutionData }) => {
  if (!institutionData) {
    return <div className="p-8 text-center text-xs text-slate-500">No industry demand data loaded.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Industry Skill Demand Analysis</h1>
        <p className="text-xs text-slate-500">Skills Required Across Corporate Internship & Placement Postings</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Briefcase className="w-4 h-4 text-emerald-600" />
          <span>Top Demanded Skills Across Market Opportunities</span>
        </h3>

        <div className="space-y-3">
          {institutionData.top_demanded_skills.map((item, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{item.skill_name} ({item.category})</span>
                <span className="text-emerald-700">{item.opportunity_count} Postings ({item.percentage}%)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${Math.min(100, item.percentage)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
