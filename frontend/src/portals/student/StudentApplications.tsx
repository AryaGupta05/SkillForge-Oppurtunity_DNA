import React from 'react';
import { Send, Eye, Calendar } from 'lucide-react';
import type { Application } from '../../types';

interface StudentApplicationsProps {
  applications: Application[];
  onSelectAppDetail: (app: Application) => void;
}

export const StudentApplications: React.FC<StudentApplicationsProps> = ({
  applications,
  onSelectAppDetail
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Submitted Applications</h1>
          <p className="text-xs text-slate-500">Real-Time Persistent Application Status & Recruiter Feedback</p>
        </div>
        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl border border-indigo-100">
          Total: {applications.length}
        </span>
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-2">
            <Send className="w-8 h-8 text-slate-400 mx-auto" />
            <p>No applications submitted yet. Explore recommended opportunities to apply!</p>
          </div>
        ) : (
          applications.map((app) => {
            const statusConfig = 
              app.status === 'shortlisted' ? { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Shortlisted' } :
              app.status === 'offered' ? { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Offered' } :
              app.status === 'placed' ? { bg: 'bg-purple-50 text-purple-800 border-purple-200', label: 'Placed' } :
              app.status === 'rejected' ? { bg: 'bg-rose-50 text-rose-800 border-rose-200', label: 'Not Selected' } :
              { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', label: 'Applied' };

            return (
              <div
                key={app.id}
                onClick={() => onSelectAppDetail(app)}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {app.opportunity_type || 'internship'}
                      </span>
                      <span className="text-xs text-slate-400">Application #{app.id}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{app.opportunity_title || `Opportunity #${app.opportunity_id}`}</h3>
                    <p className="text-xs text-slate-500">{app.opportunity_company}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${statusConfig.bg}`}>
                      {statusConfig.label}
                    </span>
                    <button 
                      onClick={() => onSelectAppDetail(app)}
                      className="p-1.5 bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-lg cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                  </span>

                  {app.notes && (
                    <span className="text-indigo-600 font-semibold truncate max-w-[200px]">
                      Feedback: {app.notes}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
