import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, ShieldAlert, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import type { VerificationQueueItem, UserResponse, VerificationAuditLogItem } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<VerificationQueueItem[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [auditLogs, setAuditLogs] = useState<VerificationAuditLogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [verRes, usersRes, auditRes] = await Promise.all([
        api.getAdminVerifications(),
        api.getAdminUsers(),
        api.getAdminAuditLogs(),
      ]);
      setQueue(verRes);
      setUsers(usersRes);
      setAuditLogs(auditRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const activeUsersCount = users.filter((u) => u.account_status === 'active').length;
  const suspendedUsersCount = users.filter((u) => u.account_status === 'suspended').length;
  const pendingCount = queue.length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-800 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Operations Hub</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Governance Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time verification queue management, identity controls, security suspension, and immutable verification audit logs.
          </p>
        </div>

        <Link
          to="/admin/verifications"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center space-x-2 shrink-0"
        >
          <span>Review Verification Queue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-200">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending Verification</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{loading ? '...' : pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Industry & Academia partners awaiting review</p>
        </div>

        <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Verified Accounts</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{loading ? '...' : activeUsersCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Verified students, recruiters & institutions</p>
        </div>

        <div className="bg-slate-800/80 border border-rose-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Suspended Accounts</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{loading ? '...' : suspendedUsersCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Accounts locked due to policy enforcement</p>
        </div>

        <div className="bg-slate-800/80 border border-indigo-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Audit Events Recorded</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{loading ? '...' : auditLogs.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Immutable administrative audit log entries</p>
        </div>
      </div>

      {/* Grid: Pending Queue Preview & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Queue Section */}
        <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white">Pending Verification Queue</h2>
            </div>
            <Link to="/admin/verifications" className="text-xs font-bold text-indigo-400 hover:underline">
              View All ({pendingCount})
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 py-4">Loading verification queue...</p>
          ) : queue.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-slate-200">Verification Queue Clear</p>
              <p>All institutional and industry registration requests have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.slice(0, 4).map((item) => (
                <div key={item.id} className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{item.full_name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.role === 'industry' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.role}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {item.role === 'industry' ? item.company : item.institution} ({item.email})
                    </p>
                  </div>
                  <Link
                    to="/admin/verifications"
                    className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg font-bold text-[11px] transition-colors"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log Activity Feed */}
        <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Recent Audit Activity</h2>
            </div>
            <Link to="/admin/users" className="text-xs font-bold text-indigo-400 hover:underline">
              Full Audit Trail
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 py-4">Loading audit activity...</p>
          ) : auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No audit logs recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.action === 'approve' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      log.action === 'reject' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      log.action === 'suspend' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-200 font-medium text-[11px]">
                    User ID #{log.target_user_id} status changed: <span className="text-slate-400">{log.previous_status}</span> → <span className="text-indigo-300 font-bold">{log.new_status}</span>
                  </p>
                  {log.reason && <p className="text-[11px] text-slate-400 italic">"{log.reason}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
