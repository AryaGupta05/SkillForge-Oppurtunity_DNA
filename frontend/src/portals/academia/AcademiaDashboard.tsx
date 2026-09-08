import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, TrendingUp } from 'lucide-react';
import type { InstitutionDashboardResponse, UserResponse } from '../../types';

interface AcademiaDashboardProps {
  currentUser?: UserResponse | null;
  institutionData: InstitutionDashboardResponse | null;
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onDrillDownSkill: (skillName: string) => void;
}

export const AcademiaDashboard: React.FC<AcademiaDashboardProps> = ({
  currentUser,
  institutionData,
  loading,
  onDrillDownSkill
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 to-amber-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold bg-amber-800/60 px-2.5 py-0.5 rounded-full border border-amber-600/30">
              Academia Skill Intelligence Console
            </span>
          </div>
          <h1 className="text-2xl font-black mt-2 tracking-tight">
            {currentUser?.institution || 'Delhi Institute of Engineering & Technology'}
          </h1>
          <p className="text-xs text-amber-200 mt-1">
            Institutional Admin: {currentUser?.full_name || 'Dean / Placement Cell'} • {currentUser?.email}
          </p>
        </div>

        <button
          onClick={() => navigate('/academia/skill-gaps')}
          className="bg-white hover:bg-amber-50 text-amber-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2 shrink-0"
        >
          <TrendingUp className="w-4 h-4 text-amber-700" />
          <span>View Curriculum Gap Analysis</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading institutional analytics...
        </div>
      ) : institutionData ? (
        <div className="space-y-6">
          {/* Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Student Population</span>
              <div className="text-2xl font-black text-slate-900">{institutionData.total_students}</div>
              <p className="text-[11px] text-slate-500">Registered candidates with DNA</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Active Opportunities</span>
              <div className="text-2xl font-black text-indigo-600">{institutionData.total_opportunities}</div>
              <p className="text-[11px] text-slate-500">
                {institutionData.internship_count} Internships • {institutionData.placement_count} Placements
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Campus Match Readiness</span>
              <div className="text-2xl font-black text-emerald-600">{institutionData.avg_match_readiness}%</div>
              <p className="text-[11px] text-slate-500">Average student-industry fit</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Placements</span>
              <div className="text-2xl font-black text-purple-600">
                {institutionData.application_stats.placed || 0}
              </div>
              <p className="text-[11px] text-slate-500">Placed student hires</p>
            </div>
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Student Skills Supply */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Student Skill Supply Distribution</span>
                </h3>
                <button
                  onClick={() => navigate('/academia/skill-supply')}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {institutionData.top_student_skills.slice(0, 5).map((item, idx) => {
                  const pct = Math.round((item.student_count / (institutionData.total_students || 1)) * 100);
                  return (
                    <div
                      key={idx}
                      onClick={() => onDrillDownSkill(item.skill_name)}
                      className="space-y-1 cursor-pointer group"
                    >
                      <div className="flex justify-between text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                        <span>{item.skill_name}</span>
                        <span>{item.student_count} Students ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Critical Skill Deficits */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>Highest Skill Deficits (Market Demand vs Supply)</span>
                </h3>
                <button
                  onClick={() => navigate('/academia/skill-gaps')}
                  className="text-xs font-bold text-amber-700 hover:underline"
                >
                  View Gaps
                </button>
              </div>

              <div className="space-y-2.5">
                {institutionData.skill_gaps.slice(0, 4).map((gap, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{gap.skill_name}</span>
                      <span className="text-[11px] text-slate-500 block">
                        Industry Demand: {gap.demand_count} | Student Supply: {gap.supply_count}
                      </span>
                    </div>
                    <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                      Gap Deficit: -{gap.gap}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          No institutional dashboard data available.
        </div>
      )}
    </div>
  );
};
