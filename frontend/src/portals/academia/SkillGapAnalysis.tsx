import React from 'react';
import { TrendingUp, AlertTriangle, ArrowRight, AlertCircle } from 'lucide-react';
import type { InstitutionDashboardResponse, UserResponse } from '../../types';

interface SkillGapAnalysisProps {
  currentUser?: UserResponse | null;
  institutionData: InstitutionDashboardResponse | null;
  onDrillDownSkill?: (skillName: string) => void;
}

export const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({ currentUser, institutionData, onDrillDownSkill }) => {
  const instName = currentUser?.institution || 'Institution Scope';

  if (!institutionData) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
        <p className="font-bold text-slate-700">No skill gap data loaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <span>Institutional Skill Gap Analysis</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deficits Comparing <strong className="text-slate-800">{instName}</strong> Student Supply vs. Industry Market Demand
          </p>
        </div>
        <span className="text-xs font-bold bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0">
          {institutionData.skill_gaps.length} Skill Deficits Tracked
        </span>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>Curriculum Action Priorities (High Market Demand + Low Institutional Supply)</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">
            Ranked by Deficit Severity
          </span>
        </div>

        {institutionData.skill_gaps.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No institutional skill gap deficits found. All demanded skills have adequate student supply.
          </div>
        ) : (
          <div className="space-y-3">
            {institutionData.skill_gaps.map((gap, idx) => {
              const isHighDemandDeficit = gap.gap >= 2;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border space-y-2.5 text-xs transition-all ${
                    isHighDemandDeficit
                      ? 'bg-amber-50/80 border-amber-200 text-amber-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-sm text-slate-900 flex items-center space-x-2">
                      {isHighDemandDeficit && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                      <span>{gap.skill_name}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      {onDrillDownSkill && (
                        <button
                          onClick={() => onDrillDownSkill(gap.skill_name)}
                          className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1 underline"
                        >
                          <span>View Qualified Students ({gap.supply_count})</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isHighDemandDeficit ? 'bg-amber-200 text-amber-950' : 'bg-slate-200 text-slate-700'
                      }`}>
                        Deficit Gap: -{gap.gap}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white/70 p-2.5 rounded-lg border border-slate-200/50 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Industry Job Postings</span>
                      <strong className="text-emerald-700 font-bold text-xs">{gap.demand_count} Employer Postings</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{instName} Student Supply</span>
                      <strong className="text-indigo-700 font-bold text-xs">{gap.supply_count} Students Possessing Skill</strong>
                    </div>
                  </div>

                  {isHighDemandDeficit && (
                    <div className="pt-1 text-[11px] font-semibold text-amber-900 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span><strong>High Priority Action:</strong> High corporate demand with low campus supply. Introduce lab modules or elective workshops for {gap.skill_name}.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
