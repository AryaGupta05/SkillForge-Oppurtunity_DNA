import React, { useEffect, useState } from 'react';
import { Users, Search, ShieldAlert, ShieldCheck, History, X, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import type { UserResponse, VerificationAuditLogItem } from '../../types';

export const AdminUsers: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // Suspend Modal
  const [suspendingUser, setSuspendingUser] = useState<UserResponse | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Audit Log Drawer
  const [auditUser, setAuditUser] = useState<UserResponse | null>(null);
  const [userAuditLogs, setUserAuditLogs] = useState<VerificationAuditLogItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendingUser) return;
    setSubmittingAction(true);
    setError(null);
    try {
      await api.suspendUser(suspendingUser.id, { reason: suspendReason || undefined });
      setSuspendingUser(null);
      setSuspendReason('');
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to suspend user.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReactivate = async (user: UserResponse) => {
    setSubmittingAction(true);
    setError(null);
    try {
      await api.reactivateUser(user.id);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to reactivate user.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleViewAuditLogs = async (user: UserResponse) => {
    setAuditUser(user);
    setLoadingAudit(true);
    try {
      const logs = await api.getUserAuditLogs(user.id);
      setUserAuditLogs(logs);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs.');
    } finally {
      setLoadingAudit(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(search.toLowerCase())) ||
      (u.institution && u.institution.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.account_status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Identity Governance</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">User Directory & Verification Audit</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full platform account directory, status management, administrative actions, and individual audit logs.
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Directory'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, org..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl text-xs focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="industry">Industry</option>
              <option value="academia">Academia</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl text-xs focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending_email_verification">Pending Email OTP</option>
              <option value="pending_verification">Pending Admin Approval</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading platform user directory...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">No users matching search filters found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-700/80 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="px-5 py-3">User & Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Organization / Institution</th>
                  <th className="px-5 py-3">Account Status</th>
                  <th className="px-5 py-3 text-right">Governance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-white">{user.full_name}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'student' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        user.role === 'industry' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        user.role === 'academia' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {user.role === 'industry' ? user.company || '-' : user.institution || '-'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.account_status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                        user.account_status === 'pending_email_verification' ? 'bg-sky-500/20 text-sky-400' :
                        user.account_status === 'pending_verification' ? 'bg-amber-500/20 text-amber-400' :
                        user.account_status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {user.account_status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewAuditLogs(user)}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px] font-medium flex items-center space-x-1 border border-slate-600"
                          title="View Audit Log"
                        >
                          <History className="w-3 h-3" />
                          <span>Audit</span>
                        </button>

                        {user.account_status === 'suspended' ? (
                          <button
                            onClick={() => handleReactivate(user)}
                            disabled={submittingAction}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Reactivate</span>
                          </button>
                        ) : user.role !== 'admin' ? (
                          <button
                            onClick={() => { setSuspendingUser(user); setSuspendReason(''); }}
                            disabled={submittingAction}
                            className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-lg text-[11px] font-bold flex items-center space-x-1"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            <span>Suspend</span>
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suspend Modal */}
      {suspendingUser && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Suspend User Account: {suspendingUser.full_name}</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Suspending this account will immediately revoke all access privileges and display a suspended notice upon login.
            </p>

            <form onSubmit={handleSuspend} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Reason for Suspension (Optional)</label>
                <textarea
                  rows={2}
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Terms of service violation or policy audit..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSuspendingUser(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {submittingAction ? 'Suspending...' : 'Confirm Suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Log Drawer Modal */}
      {auditUser && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-slate-800 border-l border-slate-700 max-w-lg w-full h-full p-6 shadow-2xl space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  <span>Verification Audit History</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{auditUser.full_name} ({auditUser.email})</p>
              </div>
              <button onClick={() => setAuditUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingAudit ? (
              <div className="text-center py-12 text-xs text-slate-400">Loading audit history...</div>
            ) : userAuditLogs.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">No verification audit records found for this user.</div>
            ) : (
              <div className="space-y-4">
                {userAuditLogs.map((log) => (
                  <div key={log.id} className="bg-slate-900/80 border border-slate-700/70 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.action === 'approve' ? 'bg-emerald-500/20 text-emerald-400' :
                        log.action === 'reject' ? 'bg-rose-500/20 text-rose-400' :
                        log.action === 'suspend' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-sky-500/20 text-sky-400'
                      }`}>
                        Action: {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                    </div>

                    <div className="text-slate-300 text-[11px] leading-relaxed">
                      Status changed from <span className="font-semibold text-slate-400">{log.previous_status}</span> to <span className="font-bold text-indigo-300">{log.new_status}</span> by Admin (ID #{log.admin_user_id}).
                    </div>

                    {log.reason && (
                      <div className="p-2 bg-slate-950/60 rounded border border-slate-800 text-slate-400 text-[11px] italic">
                        "{log.reason}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
