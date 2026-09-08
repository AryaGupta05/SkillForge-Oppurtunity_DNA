import React from 'react';
import { Settings, ShieldCheck, Mail, Lock, CheckCircle2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-700/80 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>Platform Security Configuration</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Platform Security & Verification Policy</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Overview of active authentication providers, cryptographic hashing standards, and role-based authorization parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Email Provider Configuration */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-700/60 pb-3">
            <Mail className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Email Delivery Service</h2>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Active Provider:</span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded text-[10px] font-bold uppercase">
                  Explicit Environment Selection
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Configured via <code>EMAIL_PROVIDER</code> (development console vs Resend API). No silent fallbacks allowed.
              </p>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Development Mode (EMAIL_PROVIDER=dev): Console logging with explicit headers</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Production Mode (EMAIL_PROVIDER=resend): Validates RESEND_API_KEY at startup</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cryptographic & Verification Policy */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-700/60 pb-3">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Cryptographic OTP Security</h2>
          </div>

          <div className="space-y-3 text-slate-300">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 space-y-1">
              <span className="font-bold text-slate-200">HMAC-SHA256 Code Hashing:</span>
              <p className="text-slate-400 text-[11px]">
                Raw 6-digit OTP codes generated via secrets.randbelow(1,000,000) are never stored in database or API responses.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>OTP Expiry Window: 10 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Max Attempts Limit: 5 failed attempts locks OTP</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Resend Cooldown Enforcement: 60 seconds minimum interval</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
