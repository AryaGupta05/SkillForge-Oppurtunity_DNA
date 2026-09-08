import React from 'react';
import { CheckSquare } from 'lucide-react';
import type { InstitutionDashboardResponse } from '../../types';

interface PlacementOutcomesProps {
  institutionData: InstitutionDashboardResponse | null;
}

export const PlacementOutcomes: React.FC<PlacementOutcomesProps> = ({ institutionData }) => {
  if (!institutionData) {
    return <div className="p-8 text-center text-xs text-slate-500">No placement outcomes data loaded.</div>;
  }

  const internshipStats = institutionData.internship_application_stats || {};
  const placementStats = institutionData.placement_application_stats || {};

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Internship & Placement Outcomes</h1>
        <p className="text-xs text-slate-500">Campus Application Funnel & Recruitment Statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Internship Outcomes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <span>Internship Funnel ({internshipStats.total || 0} Total)</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700">Applied</span>
              <span className="font-bold text-indigo-700">{internshipStats.applied || 0}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-amber-50 rounded-xl">
              <span className="font-semibold text-amber-800">Shortlisted</span>
              <span className="font-bold text-amber-800">{internshipStats.shortlisted || 0}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-emerald-50 rounded-xl">
              <span className="font-semibold text-emerald-800">Offered</span>
              <span className="font-bold text-emerald-800">{internshipStats.offered || 0}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-purple-50 rounded-xl">
              <span className="font-semibold text-purple-800">Placed Hires</span>
              <span className="font-bold text-purple-800">{internshipStats.placed || 0}</span>
            </div>
          </div>
        </div>

        {/* Permanent Placement Outcomes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>Permanent Placement Funnel ({placementStats.total || 0} Total)</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700">Applied</span>
              <span className="font-bold text-indigo-700">{placementStats.applied || 0}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-amber-50 rounded-xl">
              <span className="font-semibold text-amber-800">Shortlisted</span>
              <span className="font-bold text-amber-800">{placementStats.shortlisted || 0}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-emerald-50 rounded-xl">
              <span className="font-semibold text-emerald-800">Offered</span>
              <span className="font-bold text-emerald-800">{placementStats.offered || 0}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-purple-50 rounded-xl">
              <span className="font-semibold text-purple-800">Placed Hires</span>
              <span className="font-bold text-purple-800">{placementStats.placed || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
