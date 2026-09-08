import React from 'react';
import { Lock, User } from 'lucide-react';
import type { UserResponse } from '../../types';

interface StudentSettingsProps {
  currentUser: UserResponse | null;
}

export const StudentSettings: React.FC<StudentSettingsProps> = ({ currentUser }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Student Account Settings</h1>
        <p className="text-xs text-slate-500">Security Credentials & Notification Preferences</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Account Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={currentUser?.full_name || 'Student Account'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser?.email || 'student@example.com'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>Security & Authentication</span>
          </h3>
          <p className="text-xs text-slate-500">
            Password changes and two-factor authentication managed securely via JWT session cookies.
          </p>
        </div>
      </div>
    </div>
  );
};
