import React from 'react';
import type { UserResponse, InstitutionDashboardResponse } from '../../types';

interface InstitutionProfileProps {
  currentUser: UserResponse | null;
  institutionData?: InstitutionDashboardResponse | null;
}

export const InstitutionProfile: React.FC<InstitutionProfileProps> = ({ currentUser }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Institution Profile</h1>
        <p className="text-xs text-slate-500">College & Campus Placement Cell Configuration</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
            {currentUser?.institution ? currentUser.institution.charAt(0) : 'I'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{currentUser?.institution || 'Delhi Institute of Engineering & Technology'}</h2>
            <p className="text-xs text-slate-500">Registered Higher Education Institution</p>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">
              Verified Educational Partner
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Institutional Admin</span>
            <p className="font-bold text-slate-800">{currentUser?.full_name || 'Dean / Placement Head'}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Admin Email</span>
            <p className="font-bold text-slate-800">{currentUser?.email || 'academia@example.com'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
