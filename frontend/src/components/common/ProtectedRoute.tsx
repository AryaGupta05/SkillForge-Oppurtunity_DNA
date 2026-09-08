import React from 'react';
import { Navigate } from 'react-router-dom';
import type { UserResponse } from '../../types';
import { AlertTriangle, Clock, ShieldAlert, MailCheck } from 'lucide-react';

interface ProtectedRouteProps {
  currentUser: UserResponse | null;
  allowedRole?: 'student' | 'industry' | 'academia' | 'admin';
  children: React.ReactNode;
  onLogout?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  currentUser,
  allowedRole,
  children,
  onLogout,
}) => {
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // 1. Pending Email Verification Status
  if (currentUser.account_status === 'pending_email_verification') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-sky-500/30 rounded-xl p-8 shadow-2xl space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            <MailCheck className="w-4 h-4 text-sky-400" />
            <span>Email Verification Required</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-50">Verify Your Email</h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            A 6-digit verification OTP code has been dispatched to <strong>{currentUser.email}</strong>. Please enter the OTP code in the authentication dialog to verify your identity.
          </p>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg text-sm transition-colors border border-slate-600"
            >
              Sign Out / Return to Sign In
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. Rejected Status
  if (currentUser.account_status === 'rejected') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-rose-500/40 rounded-xl p-8 shadow-2xl space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Registration Rejected</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-50">Account Not Approved</h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Your application for platform verification was reviewed by SkillForge administrators and could not be approved at this time.
          </p>

          {currentUser.rejection_reason && (
            <div className="bg-rose-950/40 border border-rose-800/50 rounded-lg p-4 text-left space-y-1">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">Rejection Reason:</span>
              <p className="text-xs text-rose-200 leading-relaxed">{currentUser.rejection_reason}</p>
            </div>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg text-sm transition-colors border border-slate-600"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Suspended Status
  if (currentUser.account_status === 'suspended') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-amber-500/40 rounded-xl p-8 shadow-2xl space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Account Suspended</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-50">Account Suspended</h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Your account access has been temporarily suspended by SkillForge administrators.
          </p>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg text-sm transition-colors border border-slate-600"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    );
  }

  // 4. Pending Verification Status (Industry / Academia)
  if (currentUser.account_status === 'pending_verification') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-amber-500/30 rounded-xl p-8 shadow-2xl space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Verification Pending</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-50">Account Under Review</h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            {currentUser.role === 'industry' 
              ? `Your organization account for "${currentUser.company || 'Industry Partner'}" has been created and is currently undergoing verification by SkillForge administrators.`
              : `Your institutional account for "${currentUser.institution || 'Academic Institution'}" has been created and is pending domain and identifier verification.`
            }
          </p>

          <div className="bg-slate-900/60 rounded-lg p-4 text-left border border-slate-700/50 space-y-2 text-xs text-slate-300">
            <div><span className="text-slate-400 font-medium">Contact Person:</span> {currentUser.full_name}</div>
            <div><span className="text-slate-400 font-medium">Official Email:</span> {currentUser.email}</div>
            {currentUser.company && <div><span className="text-slate-400 font-medium">Organization:</span> {currentUser.company}</div>}
            {currentUser.institution && <div><span className="text-slate-400 font-medium">Institution:</span> {currentUser.institution}</div>}
            <div><span className="text-slate-400 font-medium">Account Status:</span> <span className="text-amber-400 font-semibold uppercase">Pending Admin Approval</span></div>
          </div>

          <p className="text-xs text-slate-400">
            Privileged features like posting opportunities and accessing institution analytics are disabled until verification is complete.
          </p>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg text-sm transition-colors border border-slate-600"
            >
              Sign Out / Switch Account
            </button>
          )}
        </div>
      </div>
    );
  }

  // 5. Role-based Route Guarding
  if (allowedRole && currentUser.role !== allowedRole) {
    const roleTarget = 
      currentUser.role === 'admin' ? '/admin/dashboard' :
      currentUser.role === 'student' ? '/student/dashboard' :
      currentUser.role === 'industry' ? '/industry/dashboard' :
      '/academia/dashboard';
    return <Navigate to={roleTarget} replace />;
  }

  return <>{children}</>;
};
