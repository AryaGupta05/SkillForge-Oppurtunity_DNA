import React from 'react';
import { Building2 } from 'lucide-react';
import type { UserResponse } from '../../types';

interface IndustrySettingsProps {
  currentUser: UserResponse | null;
}

export const IndustrySettings: React.FC<IndustrySettingsProps> = ({ currentUser }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Industry Partner Settings</h1>
        <p className="text-xs text-slate-500">Corporate Account Credentials & Verification Settings</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Corporate Account Info</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Company / Organization</label>
              <input
                type="text"
                disabled
                value={currentUser?.company || 'Bharat AI Innovations Ltd'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Recruiter Name</label>
              <input
                type="text"
                disabled
                value={currentUser?.full_name || 'Recruiter Account'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
