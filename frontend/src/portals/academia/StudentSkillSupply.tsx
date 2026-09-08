import React from 'react';
import { Award, ArrowRight, AlertCircle } from 'lucide-react';
import type { InstitutionDashboardResponse, UserResponse } from '../../types';

interface StudentSkillSupplyProps {
  currentUser?: UserResponse | null;
  institutionData: InstitutionDashboardResponse | null;
  onDrillDownSkill: (skillName: string) => void;
}

export const StudentSkillSupply: React.FC<StudentSkillSupplyProps> = ({
  currentUser,
  institutionData,
  onDrillDownSkill
}) => {
  const instName = currentUser?.institution || 'Institution Scope';

  if (!institutionData) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
        <p className="font-bold text-slate-700">No skill supply analytics loaded</p>
        <p className="text-slate-500">Ensure candidates belong to {instName}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <span>Student Skill Supply Distribution</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified Capabilities Across <strong className="text-slate-800">{instName}</strong> Candidate Population ({institutionData.total_students} Total Students)
          </p>
        </div>
        <span className="text-xs font-bold bg-indigo-50 text-indigo-900 px-3 py-1.5 rounded-xl border border-indigo-200 shrink-0">
          {institutionData.top_student_skills.length} Unique Skills Tracked
        </span>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Institutional Skill Coverage (Click skill for candidate roster)</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">
            Ranked by Student Possession
          </span>
        </div>

        {institutionData.top_student_skills.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No student skill records found for {instName}.
          </div>
        ) : (
          <div className="space-y-3">
            {institutionData.top_student_skills.map((item, idx) => {
              const pct = Math.round((item.student_count / (institutionData.total_students || 1)) * 100);
              return (
                <div
                  key={idx}
                  onClick={() => onDrillDownSkill(item.skill_name)}
                  className="p-4 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl space-y-2 cursor-pointer transition-all group shadow-2xs"
                >
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                    <span className="text-sm">{item.skill_name}</span>
                    <span className="flex items-center space-x-1.5">
                      <span>{item.student_count} Students ({pct}%)</span>
                      <ArrowRight className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${pct}%` }} />
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
