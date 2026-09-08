import React from 'react';
import { Target, RefreshCw } from 'lucide-react';
import type { Candidate, Opportunity, ReadinessSimulationResponse } from '../../types';

interface StudentReadinessProps {
  candidate: Candidate | null;
  opportunities: Opportunity[];
  selectedOpportunity: Opportunity | null;
  onSelectOpportunity: (opp: Opportunity) => Promise<void>;
  readinessSim: ReadinessSimulationResponse | null;
  selectedSimSkills: string[];
  onToggleSimSkill: (skillName: string) => void;
  projectedScore: number;
  loading: boolean;
}

export const StudentReadiness: React.FC<StudentReadinessProps> = ({
  candidate,
  opportunities,
  selectedOpportunity,
  onSelectOpportunity,
  readinessSim,
  selectedSimSkills,
  onToggleSimSkill,
  projectedScore,
  loading
}) => {
  if (!candidate) {
    return <div className="p-8 text-center text-xs text-slate-500">No student profile selected.</div>;
  }

  const currentScore = readinessSim ? readinessSim.current_readiness_score : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Deterministic Readiness Simulator</h1>
          <p className="text-xs text-slate-500">Simulate how acquiring specific target skills increases your match readiness score</p>
        </div>

        {/* Position Selector */}
        <select
          value={selectedOpportunity?.id || ''}
          onChange={(e) => {
            const opp = opportunities.find(o => o.id === Number(e.target.value));
            if (opp) onSelectOpportunity(opp);
          }}
          className="bg-white border border-slate-300 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {opportunities.map((opp) => (
            <option key={opp.id} value={opp.id}>
              {opp.title} ({opp.company})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Calculating deterministic readiness simulation...</span>
        </div>
      ) : readinessSim ? (
        <div className="space-y-6">
          {/* Score Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Current Match Readiness</span>
              <div className="text-3xl font-black text-slate-900">{currentScore}%</div>
              <p className="text-[11px] text-slate-500">Based on your current verified DNA capabilities</p>
            </div>

            <div className="bg-indigo-900 text-white p-5 rounded-2xl border border-indigo-800 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-indigo-300 uppercase">Simulated Projected Readiness</span>
              <div className="text-3xl font-black text-emerald-400">{projectedScore}%</div>
              <p className="text-[11px] text-indigo-200">
                {selectedSimSkills.length === 0 
                  ? 'Select missing skills below to simulate upside' 
                  : `+${(projectedScore - currentScore).toFixed(1)}% gain from ${selectedSimSkills.length} selected skill(s)`}
              </p>
            </div>
          </div>

          {/* Missing Skill Checklist Simulator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Skill Deficits & Potential Score Impact</span>
              </h3>
              <span className="text-xs text-slate-500">Toggle skills to simulate readiness improvement</span>
            </div>

            {readinessSim.skills_breakdown.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No skill requirements specified for this position.</p>
            ) : (
              <div className="space-y-2.5">
                {readinessSim.skills_breakdown.map((s) => {
                  const isChecked = selectedSimSkills.includes(s.skill_name);
                  return (
                    <div
                      key={s.skill_name}
                      onClick={() => !s.is_met && onToggleSimSkill(s.skill_name)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        s.is_met
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 cursor-default'
                          : isChecked
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 cursor-pointer shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={s.is_met || isChecked}
                          disabled={s.is_met}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <div>
                          <div className="font-bold text-xs">{s.skill_name}</div>
                          <div className="text-[10px] text-slate-500">Required Level: {s.required_level}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        {s.is_met ? (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Met ✓</span>
                        ) : (
                          <span className="text-xs font-bold text-indigo-600">
                            +{s.potential_contribution ? s.potential_contribution.toFixed(1) : '5.0'}% score
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Select an internship or placement position above to simulate readiness.
        </div>
      )}
    </div>
  );
};
