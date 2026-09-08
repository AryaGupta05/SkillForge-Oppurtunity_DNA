import React from 'react';
import { CheckSquare, AlertCircle, Briefcase, Award } from 'lucide-react';
import type { InstitutionDashboardResponse, UserResponse } from '../../types';

interface PlacementOutcomesProps {
  currentUser?: UserResponse | null;
  institutionData: InstitutionDashboardResponse | null;
}

export const PlacementOutcomes: React.FC<PlacementOutcomesProps> = ({ currentUser, institutionData }) => {
  const instName = currentUser?.institution || 'Institution Scope';

  if (!institutionData) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
        <p className="font-bold text-slate-700">No placement outcomes data loaded</p>
      </div>
    );
  }

  const internshipStats = institutionData.internship_application_stats || { applied: 0, shortlisted: 0, offered: 0, placed: 0, rejected: 0, total: 0 };
  const placementStats = institutionData.placement_application_stats || { applied: 0, shortlisted: 0, offered: 0, placed: 0, rejected: 0, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-purple-600" />
            <span>Internship & Placement Recruitment Outcomes</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Campus Application Funnel & Hiring Outcomes for <strong className="text-slate-800">{instName}</strong>
          </p>
        </div>
        <span className="text-xs font-bold bg-purple-50 text-purple-900 px-3 py-1.5 rounded-xl border border-purple-200 shrink-0">
          {institutionData.application_stats.placed || 0} Total Campus Placements
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Internship Outcomes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Internship Funnel ({internshipStats.total || 0} Total Applications)</span>
            </h3>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded">
              Internships
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700">Applied</span>
              <span className="font-bold text-slate-900 text-sm">{internshipStats.applied || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="font-semibold text-amber-900">Shortlisted</span>
              <span className="font-bold text-amber-900 text-sm">{internshipStats.shortlisted || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
              <span className="font-semibold text-blue-900">Offered</span>
              <span className="font-bold text-blue-900 text-sm">{internshipStats.offered || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-purple-50 rounded-xl border border-purple-200">
              <span className="font-semibold text-purple-900">Placed Hires</span>
              <span className="font-bold text-purple-900 text-sm">{internshipStats.placed || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-rose-50 rounded-xl border border-rose-100">
              <span className="font-semibold text-rose-900">Rejected</span>
              <span className="font-bold text-rose-900 text-sm">{internshipStats.rejected || 0}</span>
            </div>
          </div>
        </div>

        {/* Permanent Placement Outcomes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Full-Time Placement Funnel ({placementStats.total || 0} Total Applications)</span>
            </h3>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
              Career Placements
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700">Applied</span>
              <span className="font-bold text-slate-900 text-sm">{placementStats.applied || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="font-semibold text-amber-900">Shortlisted</span>
              <span className="font-bold text-amber-900 text-sm">{placementStats.shortlisted || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
              <span className="font-semibold text-blue-900">Offered</span>
              <span className="font-bold text-blue-900 text-sm">{placementStats.offered || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-purple-50 rounded-xl border border-purple-200">
              <span className="font-semibold text-purple-900">Placed Hires</span>
              <span className="font-bold text-purple-900 text-sm">{placementStats.placed || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-rose-50 rounded-xl border border-rose-100">
              <span className="font-semibold text-rose-900">Rejected</span>
              <span className="font-bold text-rose-900 text-sm">{placementStats.rejected || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
