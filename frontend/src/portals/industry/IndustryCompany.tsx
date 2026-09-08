import React from 'react';
import type { UserResponse } from '../../types';

interface IndustryCompanyProps {
  currentUser: UserResponse | null;
}

export const IndustryCompany: React.FC<IndustryCompanyProps> = ({ currentUser }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Company Profile</h1>
        <p className="text-xs text-slate-500">Corporate Information & Recruiter Verification Status</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
            {currentUser?.company ? currentUser.company.charAt(0) : 'C'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{currentUser?.company || 'Bharat AI Innovations Ltd'}</h2>
            <p className="text-xs text-slate-500">Corporate Partner Account</p>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
              Verified Industry Partner
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Recruiter Contact</span>
            <p className="font-bold text-slate-800">{currentUser?.full_name || 'Recruiter'}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Email</span>
            <p className="font-bold text-slate-800">{currentUser?.email || 'recruiter@example.com'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
