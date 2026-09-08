import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, TrendingUp, RefreshCw, AlertCircle, CheckSquare } from 'lucide-react';
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
  error,
  onRefresh,
  onDrillDownSkill
}) => {
  const navigate = useNavigate();

  const instName = currentUser?.institution || 'Educational Institution';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-800 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold bg-amber-800/80 px-2.5 py-0.5 rounded-full border border-amber-600/40">
              Institutional Intelligence Console
            </span>
            <span className="text-[10px] font-medium bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded-full border border-amber-700/30">
              Verified Institution Scope
            </span>
          </div>
          <h1 className="text-2xl font-black mt-2 tracking-tight">
            {instName}
          </h1>
          <p className="text-xs text-amber-200 mt-1">
            Institutional Admin: {currentUser?.full_name || 'Placement Cell / Dean'} • {currentUser?.email}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="bg-amber-900/60 hover:bg-amber-800 text-amber-100 p-2.5 rounded-xl border border-amber-700/40 transition-all"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={() => navigate('/academia/skill-gaps')}
            className="bg-white hover:bg-amber-50 text-amber-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2"
          >
            <TrendingUp className="w-4 h-4 text-amber-700" />
            <span>Skill Gap Analysis</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-xs text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1 font-medium">{error}</div>
          {onRefresh && (
            <button onClick={onRefresh} className="font-bold underline text-rose-700 hover:text-rose-900">
              Retry
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <RefreshCw className="w-6 h-6 text-amber-600 animate-spin mx-auto" />
          <p className="font-semibold">Loading institutional analytics for {instName}...</p>
        </div>
      ) : institutionData ? (
        <div className="space-y-6">
          {/* Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</span>
              <div className="text-2xl font-black text-slate-900">{institutionData.total_students}</div>
              <p className="text-[11px] text-slate-500">{instName} Candidates</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Opportunities</span>
              <div className="text-2xl font-black text-indigo-600">{institutionData.total_opportunities}</div>
              <p className="text-[11px] text-slate-500">
                {institutionData.internship_count} Internships • {institutionData.placement_count} Placements
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Internship Opportunities</span>
              <div className="text-2xl font-black text-amber-600">{institutionData.internship_count}</div>
              <p className="text-[11px] text-slate-500">Industry Internships</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Placement Roles</span>
              <div className="text-2xl font-black text-emerald-600">{institutionData.placement_count}</div>
              <p className="text-[11px] text-slate-500">Full-Time Career Opportunities</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campus Match Readiness</span>
              <div className="text-2xl font-black text-purple-600">{institutionData.avg_match_readiness}%</div>
              <p className="text-[11px] text-slate-500">Avg Student Skill Match</p>
            </div>
          </div>

          {/* Application Recruitment Funnel Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>Institutional Recruitment & Placement Funnel ({institutionData.application_stats.total} Applications)</span>
              </h3>
              <button
                onClick={() => navigate('/academia/outcomes')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Detailed Breakdown
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Applied</span>
                <div className="text-lg font-bold text-slate-800">{institutionData.application_stats.applied || 0}</div>
              </div>
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase">Shortlisted</span>
                <div className="text-lg font-bold text-amber-900">{institutionData.application_stats.shortlisted || 0}</div>
              </div>
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Offered</span>
                <div className="text-lg font-bold text-blue-900">{institutionData.application_stats.offered || 0}</div>
              </div>
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-purple-700 uppercase">Placed</span>
                <div className="text-lg font-bold text-purple-900">{institutionData.application_stats.placed || 0}</div>
              </div>
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-rose-700 uppercase">Rejected</span>
                <div className="text-lg font-bold text-rose-900">{institutionData.application_stats.rejected || 0}</div>
              </div>
            </div>
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Student Skills Supply */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>{instName} Student Skill Supply</span>
                </h3>
                <button
                  onClick={() => navigate('/academia/skill-supply')}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  View All ({institutionData.top_student_skills.length})
                </button>
              </div>

              {institutionData.top_student_skills.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No student skill data available for {instName}.
                </div>
              ) : (
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
              )}
            </div>

            {/* Critical Skill Deficits */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>Institutional Skill Gap Deficits</span>
                </h3>
                <button
                  onClick={() => navigate('/academia/skill-gaps')}
                  className="text-xs font-bold text-amber-700 hover:underline"
                >
                  View All Gaps ({institutionData.skill_gaps.length})
                </button>
              </div>

              {institutionData.skill_gaps.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No skill gap deficits detected.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {institutionData.skill_gaps.slice(0, 5).map((gap, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{gap.skill_name}</span>
                        <span className="text-[11px] text-slate-500 block">
                          Industry Demand: {gap.demand_count} | {instName} Supply: {gap.supply_count}
                        </span>
                      </div>
                      <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                        Gap: -{gap.gap}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="font-semibold text-slate-700">No institutional dashboard data available for {instName}.</p>
          <p className="text-slate-500">Ensure candidates and opportunities are registered in the platform.</p>
        </div>
      )}
    </div>
  );
};
