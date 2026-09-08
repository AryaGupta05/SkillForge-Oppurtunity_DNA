import React from 'react';
import { X } from 'lucide-react';
import type { Application } from '../../types';

interface ApplicationDetailModalProps {
  application: Application;
  onClose: () => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
              {application.opportunity_type || 'internship'}
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              {application.opportunity_title || `Opportunity #${application.opportunity_id}`}
            </h3>
            <p className="text-xs text-slate-500">{application.opportunity_company}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-2">
            <span className="font-bold text-slate-800 block">Application Timeline & Status Progression:</span>
            
            {/* Timeline Stepper */}
            <div className="space-y-3 pl-2 border-l-2 border-slate-200 py-1">
              <div className="relative flex items-center space-x-2">
                <div className={`w-3.5 h-3.5 rounded-full -ml-[9px] border-2 bg-white ${
                  ['applied', 'shortlisted', 'offered', 'placed'].includes(application.status)
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-slate-300'
                }`} />
                <span className="font-semibold text-slate-800">1. Applied</span>
                <span className="text-[10px] text-slate-400">({new Date(application.applied_at).toLocaleDateString()})</span>
              </div>

              <div className="relative flex items-center space-x-2">
                <div className={`w-3.5 h-3.5 rounded-full -ml-[9px] border-2 bg-white ${
                  ['shortlisted', 'offered', 'placed'].includes(application.status)
                    ? 'border-amber-500 bg-amber-500'
                    : 'border-slate-300'
                }`} />
                <span className="font-semibold text-slate-800">2. Shortlisted</span>
              </div>

              <div className="relative flex items-center space-x-2">
                <div className={`w-3.5 h-3.5 rounded-full -ml-[9px] border-2 bg-white ${
                  ['offered', 'placed'].includes(application.status)
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-slate-300'
                }`} />
                <span className="font-semibold text-slate-800">3. Offered</span>
              </div>

              <div className="relative flex items-center space-x-2">
                <div className={`w-3.5 h-3.5 rounded-full -ml-[9px] border-2 bg-white ${
                  application.status === 'placed'
                    ? 'border-purple-600 bg-purple-600'
                    : application.status === 'rejected'
                    ? 'border-rose-500 bg-rose-500'
                    : 'border-slate-300'
                }`} />
                <span className="font-semibold text-slate-800">
                  {application.status === 'rejected' ? 'Not Selected' : '4. Placed'}
                </span>
              </div>
            </div>
          </div>

          {application.notes && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="font-semibold text-slate-700 block text-[10px] uppercase">Recruiter Feedback:</span>
              <p className="text-slate-600">{application.notes}</p>
            </div>
          )}
        </div>

        <div className="pt-2 text-right">
          <button 
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-4 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
