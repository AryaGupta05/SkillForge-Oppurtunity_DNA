import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, PlusCircle, UserCheck } from 'lucide-react';
import type { Opportunity, Application, UserResponse, IndustryDashboardResponse } from '../../types';

interface IndustryDashboardProps {
  currentUser: UserResponse | null;
  opportunities: Opportunity[];
  opportunityApplications: Application[];
  dashboardData: IndustryDashboardResponse | null;
  onLoadRankings: (oppId: number) => void;
}

export const IndustryDashboard: React.FC<IndustryDashboardProps> = ({
  currentUser,
  opportunities,
  opportunityApplications,
  dashboardData,
  onLoadRankings
}) => {
  const navigate = useNavigate();

  const totalOpps = dashboardData ? dashboardData.total_opportunities : opportunities.length;
  const totalApps = dashboardData ? dashboardData.total_applications : opportunityApplications.length;
  const shortlistedCount = dashboardData ? dashboardData.shortlisted_count : opportunityApplications.filter(a => a.status === 'shortlisted').length;
  const offeredCount = dashboardData ? dashboardData.offered_count : opportunityApplications.filter(a => a.status === 'offered').length;
  const placedCount = dashboardData ? dashboardData.placed_count : opportunityApplications.filter(a => a.status === 'placed').length;
  const recentApps = dashboardData ? dashboardData.recent_applications : opportunityApplications.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold bg-emerald-800/60 px-2.5 py-0.5 rounded-full border border-emerald-600/30">
              Industry Partner Console
            </span>
          </div>
          <h1 className="text-2xl font-black mt-2 tracking-tight">
            {currentUser?.company || 'Corporate Partner Console'}
          </h1>
          <p className="text-xs text-emerald-200 mt-1">
            Recruiter Account: {currentUser?.full_name || 'Recruiter'} • {currentUser?.email}
          </p>
        </div>

        <button
          onClick={() => navigate('/industry/opportunities/new')}
          className="bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-emerald-700" />
          <span>Post New Opportunity</span>
        </button>
      </div>

      {/* Funnel Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Opportunities</span>
          <div className="text-2xl font-black text-slate-900">{totalOpps}</div>
          <p className="text-[11px] text-slate-500">Corporate postings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Applicants</span>
          <div className="text-2xl font-black text-indigo-600">{totalApps}</div>
          <p className="text-[11px] text-slate-500">Applications received</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Shortlisted</span>
          <div className="text-2xl font-black text-amber-600">{shortlistedCount}</div>
          <p className="text-[11px] text-slate-500">Qualified candidates</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Offers Issued</span>
          <div className="text-2xl font-black text-emerald-600">{offeredCount}</div>
          <p className="text-[11px] text-slate-500">Offered positions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Final Placements</span>
          <div className="text-2xl font-black text-purple-600">{placedCount}</div>
          <p className="text-[11px] text-slate-500">Onboarded hires</p>
        </div>
      </div>

      {/* Active Listings Table / Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <span>My Active Postings & Recruitment Funnel</span>
          </h2>
          <button
            onClick={() => navigate('/industry/opportunities')}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Manage All ({totalOpps})
          </button>
        </div>

        <div className="space-y-3">
          {opportunities.map((opp) => (
            <div key={opp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    opp.type === 'placement' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {opp.type || 'internship'}
                  </span>
                  <span className="text-xs text-slate-500">{opp.location}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{opp.title}</h3>
                <p className="text-xs text-slate-500">{opp.company} • Compensation: Rs. {opp.stipend?.toLocaleString() || 15000}/mo</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    onLoadRankings(opp.id);
                    navigate('/industry/applicants');
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
                >
                  View Applicants & DNA
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Applications Section */}
      {recentApps && recentApps.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Recent Application Activity</span>
            </h2>
            <span className="text-xs text-slate-500">Latest candidate submissions</span>
          </div>

          <div className="space-y-2">
            {recentApps.map((app) => (
              <div key={app.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{app.candidate_name || `Candidate #${app.candidate_id}`}</span>
                  <span className="text-slate-500 font-normal"> applied for </span>
                  <span className="font-semibold text-slate-800">{app.opportunity_title}</span>
                </div>
                <span className={`font-bold px-2 py-0.5 rounded capitalize ${
                  app.status === 'shortlisted' ? 'bg-amber-100 text-amber-800' :
                  app.status === 'offered' ? 'bg-emerald-100 text-emerald-800' :
                  app.status === 'placed' ? 'bg-purple-100 text-purple-800' :
                  app.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
