import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import type { Candidate, Opportunity, UpskillingRoadmapResponse } from '../../types';

interface StudentRoadmapProps {
  candidate: Candidate | null;
  selectedOpportunity: Opportunity | null;
  roadmap: UpskillingRoadmapResponse | null;
  loading: boolean;
}

export const StudentRoadmap: React.FC<StudentRoadmapProps> = ({
  candidate,
  selectedOpportunity,
  roadmap,
  loading
}) => {
  if (!candidate) {
    return <div className="p-8 text-center text-xs text-slate-500">No student profile selected.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Personalized Career Development Roadmap</h1>
          <p className="text-xs text-slate-500">Curated Learning Milestones to Close Skill Gaps for {selectedOpportunity?.title || 'Target Position'}</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Generating roadmap milestones...
        </div>
      ) : roadmap ? (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Estimated Learning Duration</span>
              <div className="text-2xl font-black text-white">{roadmap.estimated_months_to_ready} Months</div>
              <p className="text-xs text-slate-300">Assuming ~10 hours/week of dedicated part-time upskilling study</p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
              <BookOpen className="w-8 h-8 text-indigo-300" />
            </div>
          </div>

          {/* Gaps Milestone List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Recommended Milestone Courses & Practice Projects</h3>

            {roadmap.gaps.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No skill gaps identified! You meet all required technical proficiency levels for this position.
              </div>
            ) : (
              roadmap.gaps.map((gap, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">Skill Deficit: {gap.skill_name}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {gap.resources.map((res, rIdx) => (
                      <div key={rIdx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 hover:border-indigo-200 transition-all">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900">{res.title}</span>
                          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded capitalize">
                            {res.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{res.provider} • ~{res.estimated_hours}h estimated</p>
                        {res.link_url && (
                          <a
                            href={res.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-600 hover:underline pt-1"
                          >
                            <span>Open Resource</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          No roadmap available.
        </div>
      )}
    </div>
  );
};
