import React from 'react';
import { Building2 } from 'lucide-react';
import type { UserResponse } from '../../types';

interface AcademiaSettingsProps {
  currentUser: UserResponse | null;
}

export const AcademiaSettings: React.FC<AcademiaSettingsProps> = ({ currentUser }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Academia Admin Settings</h1>
        <p className="text-xs text-slate-500">Institution Configuration & Credentials</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Institution Admin Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Institution Name</label>
              <input
                type="text"
                disabled
                value={currentUser?.institution || 'Delhi Institute of Engineering & Technology'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Admin Contact Name</label>
              <input
                type="text"
                disabled
                value={currentUser?.full_name || 'Academia Admin'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
