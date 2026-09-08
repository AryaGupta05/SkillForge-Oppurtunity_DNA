import React, { useState, useEffect } from 'react';
import { Award, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import type { Candidate, OpportunityDNAProfileResponse } from '../../types';

interface StudentPassportProps {
  candidate: Candidate | null;
  onDiscoverSkills?: () => void;
  loading?: boolean;
}

export const StudentPassport: React.FC<StudentPassportProps> = ({
  candidate,
  onDiscoverSkills,
  loading: parentLoading
}) => {
  const [dnaProfile, setDnaProfile] = useState<OpportunityDNAProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (candidate) {
      setLoading(true);
      api.getDNAProfile(candidate.id)
        .then(res => setDnaProfile(res))
        .catch(() => setDnaProfile(null))
        .finally(() => setLoading(false));
    }
  }, [candidate]);

  if (!candidate) {
    return <div className="p-8 text-center text-xs text-slate-500">No student profile selected.</div>;
  }

  const skills = candidate.skills || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Skill Passport</h1>
          <p className="text-xs text-slate-500">Traceable, Evidence-Backed Capability DNA Profile</p>
        </div>

        {onDiscoverSkills && (
          <button
            onClick={onDiscoverSkills}
            disabled={parentLoading || loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-2 disabled:opacity-50"
          >
            {parentLoading || loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Discover Skills (AI)</span>
          </button>
        )}
      </div>

      {/* DNA Signals Summary */}
      {dnaProfile && dnaProfile.signals && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Skill Depth</span>
            <div className="text-2xl font-black text-indigo-600">
              {Math.round((dnaProfile.signals.depth || 0) * 100)}%
            </div>
            <p className="text-[11px] text-slate-500">Proficiency & experience strength</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Skill Breadth</span>
            <div className="text-2xl font-black text-indigo-600">
              {Math.round((dnaProfile.signals.breadth || 0) * 100)}%
            </div>
            <p className="text-[11px] text-slate-500">Domain versatility & range</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Evidence Multiplier</span>
            <div className="text-2xl font-black text-emerald-600">
              {(dnaProfile.signals.evidence_strength || 1.0).toFixed(2)}x
            </div>
            <p className="text-[11px] text-slate-500">Grounded in project artifacts</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Learning Progression</span>
            <div className="text-sm font-bold text-slate-800 capitalize truncate">
              {dnaProfile.signals.learning_progression?.status?.replace('_', ' ') || 'Sufficient Evidence'}
            </div>
            <p className="text-[11px] text-slate-500">Trajectory over date history</p>
          </div>
        </div>
      )}

      {/* Discovered Skill Chips */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Discovered Capabilities ({skills.length})</span>
          </h2>
          <span className="text-xs text-slate-500">Verified capability skills extracted from resume & projects</span>
        </div>

        {skills.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
            No capability skills discovered yet. Upload a resume or run the AI discovery engine.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((cs) => {
              const confidencePct = Math.round((cs.confidence || 0.85) * 100);
              return (
                <div
                  key={cs.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      {cs.skill.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                      cs.skill_type === 'explicit' ? 'bg-indigo-100 text-indigo-800' :
                      cs.skill_type === 'inferred' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {cs.skill_type || 'explicit'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1">{cs.skill.category || 'Technical Skill'}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-600 font-medium">Proficiency: <strong className="text-slate-800">{cs.proficiency || 'Intermediate'}</strong></span>
                    <span className="text-emerald-700 font-bold">Conf: {confidencePct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
