import React, { useEffect, useState } from 'react';
import { CheckSquare, Building2, School, CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import type { VerificationQueueItem } from '../../types';

export const AdminVerifications: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<VerificationQueueItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Reject Modal state
  const [rejectingUser, setRejectingUser] = useState<VerificationQueueItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdminVerifications();
      setQueue(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load verification queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item: VerificationQueueItem) => {
    setSubmittingAction(true);
    setError(null);
    setActionSuccess(null);
    try {
      await api.approveUser(item.id);
      setActionSuccess(`Successfully approved "${item.full_name}" (${item.role}). Account is now active.`);
      loadQueue();
    } catch (err: any) {
      setError(err.message || 'Failed to approve user.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingUser || !rejectReason.trim()) return;
    setSubmittingAction(true);
    setError(null);
    setActionSuccess(null);
    try {
      await api.rejectUser(rejectingUser.id, { reason: rejectReason.trim() });
      setActionSuccess(`Application for "${rejectingUser.full_name}" rejected. Notification email sent.`);
      setRejectingUser(null);
      setRejectReason('');
      loadQueue();
    } catch (err: any) {
      setError(err.message || 'Failed to reject user application.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Verification Management</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Institutional & Industry Verification Queue</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review submitted credentials, company domains, and AISHE/AICTE identifiers before granting active platform privileges.
          </p>
        </div>

        <button
          onClick={loadQueue}
          disabled={loading}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Queue'}
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:underline">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Queue List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading verification queue...</div>
      ) : queue.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-12 text-center space-y-3 shadow-lg">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Verification Queue Clear</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All submitted partner applications have been processed. No pending verification requests in queue.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <div key={item.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl text-white ${
                    item.role === 'industry' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}>
                    {item.role === 'industry' ? <Building2 className="w-5 h-5" /> : <School className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-white">{item.full_name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.role === 'industry' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.role} Partner
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{item.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleApprove(item)}
                    disabled={submittingAction}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Activate</span>
                  </button>
                  <button
                    onClick={() => { setRejectingUser(item); setRejectReason(''); setError(null); }}
                    disabled={submittingAction}
                    className="flex-1 sm:flex-none px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                {item.role === 'industry' ? (
                  <>
                    <div>
                      <span className="text-slate-400 block font-medium">Company / Organization:</span>
                      <span className="font-bold text-slate-200">{item.company || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Industry Sector:</span>
                      <span className="font-bold text-slate-200">{item.industry_sector || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Organization Type:</span>
                      <span className="font-bold text-slate-200">{item.organization_type || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Website:</span>
                      {item.website ? (
                        <a href={item.website} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center space-x-1">
                          <span>{item.website}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500">Not provided</span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-slate-400 block font-medium">Institution Name:</span>
                      <span className="font-bold text-slate-200">{item.institution || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Institution Type:</span>
                      <span className="font-bold text-slate-200">{item.institution_type || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Official Domain:</span>
                      <span className="font-bold text-indigo-300">{item.official_domain || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">AISHE / NIRF Code:</span>
                      <span className="font-mono font-bold text-amber-300">{item.institution_identifier || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingUser && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Reject Application: {rejectingUser.full_name}</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Please state the explicit reason for rejecting this verification request. This reason will be logged in the audit trail and sent via notification email to <strong>{rejectingUser.email}</strong>.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Rejection Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Official domain mismatch or unverified AISHE institutional code..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingUser(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction || !rejectReason.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {submittingAction ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
