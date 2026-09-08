import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../../services/api';
import type { OpportunityDNAProfileResponse } from '../../types';

interface CandidateDNAModalProps {
  candidateId?: number;
  candidateName: string;
  dna?: OpportunityDNAProfileResponse | null;
  onClose: () => void;
}

export const CandidateDNAModal: React.FC<CandidateDNAModalProps> = ({
  candidateId,
  candidateName,
  dna: preloadedDna,
  onClose
}) => {
  const [dna, setDna] = useState<OpportunityDNAProfileResponse | null>(preloadedDna || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!preloadedDna && candidateId) {
      setLoading(true);
      api.getDNAProfile(candidateId)
        .then(res => setDna(res))
        .catch(() => setDna(null))
        .finally(() => setLoading(false));
    } else if (preloadedDna) {
      setDna(preloadedDna);
    }
  }, [candidateId, preloadedDna]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Candidate Skill DNA: {candidateName}
            </h3>
            <p className="text-xs text-slate-500">Verified Capability Signals & Evidence Provenance</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading DNA profile...
          </div>
        ) : dna ? (
          <div className="space-y-5">
            {/* DNA Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Depth</span>
                <div className="text-lg font-black text-indigo-600">
                  {Math.round((dna.signals.depth || 0) * 100)}%
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Breadth</span>
                <div className="text-lg font-black text-indigo-600">
                  {Math.round((dna.signals.breadth || 0) * 100)}%
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Multiplier</span>
                <div className="text-lg font-black text-emerald-600">
                  {(dna.signals.evidence_strength || 1.0).toFixed(2)}x
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Skills</span>
                <div className="text-lg font-black text-slate-900">
                  {dna.skills.length}
                </div>
              </div>
            </div>

            {/* Skill Chips */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Discovered Skills</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {dna.skills.map((cs) => (
                  <div key={cs.id} className="p-3 bg-slate-50 border rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{cs.skill.name}</span>
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded capitalize">
                        {cs.skill_type || 'explicit'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Proficiency: {cs.proficiency || 'Intermediate'}</span>
                      <span className="text-emerald-700 font-bold">Conf: {Math.round((cs.confidence || 0.85) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No DNA profile available.
          </div>
        )}

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
