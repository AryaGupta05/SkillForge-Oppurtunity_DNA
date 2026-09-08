import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Users } from 'lucide-react';
import type { Opportunity } from '../../types';

interface IndustryOpportunitiesProps {
  opportunities: Opportunity[];
  onLoadRankings: (oppId: number) => void;
}

export const IndustryOpportunities: React.FC<IndustryOpportunitiesProps> = ({
  opportunities,
  onLoadRankings
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Corporate Opportunities Management</h1>
          <p className="text-xs text-slate-500">Active Internship & Permanent Placement Listings</p>
        </div>
        <button
          onClick={() => navigate('/industry/opportunities/new')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Opportunity</span>
        </button>
      </div>

      <div className="space-y-4">
        {opportunities.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No opportunities posted yet. Click "Post Opportunity" above to create one!
          </div>
        ) : (
          opportunities.map((opp) => (
            <div key={opp.id} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${
                      opp.type === 'placement' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {opp.type || 'internship'}
                    </span>
                    <span className="text-xs text-slate-500">{opp.sector}</span>
                    {opp.duration_months && <span className="text-xs text-slate-400">• {opp.duration_months} Months</span>}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{opp.title}</h2>
                  <p className="text-xs text-slate-600">{opp.company} • {opp.location}</p>
                </div>

                <button
                  onClick={() => {
                    onLoadRankings(opp.id);
                    navigate('/industry/applicants');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-2 shrink-0"
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>View Applicants</span>
                </button>
              </div>

              {opp.description && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {opp.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-xs pt-2 text-slate-600">
                <span className="font-semibold text-slate-800">
                  Compensation: Rs. {opp.stipend?.toLocaleString() || 15000} / month
                </span>
                {opp.allowed_streams && (
                  <span className="text-slate-500">
                    Streams: <strong className="text-slate-700">{opp.allowed_streams}</strong>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
