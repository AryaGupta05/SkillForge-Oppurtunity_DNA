import React from 'react';
import { Award, ArrowRight } from 'lucide-react';
import type { InstitutionDashboardResponse } from '../../types';

interface StudentSkillSupplyProps {
  institutionData: InstitutionDashboardResponse | null;
  onDrillDownSkill: (skillName: string) => void;
}

export const StudentSkillSupply: React.FC<StudentSkillSupplyProps> = ({
  institutionData,
  onDrillDownSkill
}) => {
  if (!institutionData) {
    return <div className="p-8 text-center text-xs text-slate-500">No skill supply data loaded.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Student Skill Supply Distribution</h1>
        <p className="text-xs text-slate-500">Aggregate Student Capabilities Across Campus Population</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Award className="w-4 h-4 text-indigo-600" />
          <span>Skill Coverage (Click any skill to view student roster)</span>
        </h3>

        <div className="space-y-3">
          {institutionData.top_student_skills.map((item, idx) => {
            const pct = Math.round((item.student_count / (institutionData.total_students || 1)) * 100);
            return (
              <div
                key={idx}
                onClick={() => onDrillDownSkill(item.skill_name)}
                className="p-3.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl space-y-2 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                  <span>{item.skill_name}</span>
                  <span className="flex items-center space-x-1">
                    <span>{item.student_count} Students ({pct}%)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
