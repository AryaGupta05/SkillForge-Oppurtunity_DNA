import React from 'react';
import { Award } from 'lucide-react';
import type { Candidate } from '../../types';

interface AcademiaStudentsProps {
  candidates: Candidate[];
  onViewDNA?: (candId: number, name: string) => void;
  onViewCandidateDNA?: (candId: number, name: string) => void;
}

export const AcademiaStudents: React.FC<AcademiaStudentsProps> = ({
  candidates,
  onViewDNA,
  onViewCandidateDNA
}) => {
  const handleView = onViewDNA || onViewCandidateDNA || (() => {});
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Registered Student Directory</h1>
          <p className="text-xs text-slate-500">Student DNA Profiles & Verified Capability Signals</p>
        </div>
        <span className="text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1 rounded-xl border border-amber-200">
          Total Students: {candidates.length}
        </span>
      </div>

      <div className="space-y-3">
        {candidates.map((cand) => (
          <div key={cand.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">{cand.name}</span>
                <span className="text-xs text-slate-400">• Student ID #{cand.id}</span>
              </div>
              <p className="text-xs text-slate-500">
                {cand.institution || 'University'} • {cand.qualification_stream || cand.highest_degree || 'General Stream'}
              </p>
              <div className="flex items-center space-x-3 text-xs pt-1 text-slate-600">
                <span>Skills: <strong className="text-slate-800">{cand.skills?.length || 0}</strong></span>
                <span>• Evidence: <strong className="text-slate-800">{cand.evidence?.length || 0}</strong></span>
              </div>
            </div>

            <button
              onClick={() => handleView(cand.id, cand.name)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 shrink-0"
            >
              <Award className="w-4 h-4" />
              <span>Inspect Skill DNA</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
