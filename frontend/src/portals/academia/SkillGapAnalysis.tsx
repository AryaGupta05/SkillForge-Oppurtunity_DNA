import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import type { InstitutionDashboardResponse } from '../../types';

interface SkillGapAnalysisProps {
  institutionData: InstitutionDashboardResponse | null;
}

export const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({ institutionData }) => {
  if (!institutionData) {
    return <div className="p-8 text-center text-xs text-slate-500">No skill gap data loaded.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Institutional Skill Gap Analysis</h1>
        <p className="text-xs text-slate-500">Ranked Skill Deficits Comparing Student Supply vs. Industry Demand</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span>Curriculum Deficit Ranking & Action Priorities</span>
        </h3>

        <div className="space-y-3">
          {institutionData.skill_gaps.map((gap, idx) => {
            const isCritical = gap.gap >= 2;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border space-y-2 text-xs ${
                  isCritical
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-sm text-slate-900">{gap.skill_name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs ${
                    isCritical ? 'bg-amber-200 text-amber-900 font-bold' : 'bg-slate-200 text-slate-700'
                  }`}>
                    Gap Deficit: -{gap.gap}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Industry Demand: <strong>{gap.demand_count} Postings</strong></span>
                  <span>Student Supply: <strong>{gap.supply_count} Students</strong></span>
                </div>

                <div className="pt-2 border-t border-amber-200/50 text-[11px] font-semibold text-amber-900 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Recommended Action: Conduct targeted workshop & add practical lab modules for {gap.skill_name}.</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
