import React from 'react';
import { 
  X, 
  MapPin, 
  DollarSign, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  Award, 
  BookOpen, 
  Send,
  Zap
} from 'lucide-react';
import type { Opportunity, Application, Candidate } from '../../types';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  candidate: Candidate | null;
  matchInfo: any | null;
  application: Application | null;
  onClose: () => void;
  onApply: (oppId: number) => Promise<void>;
  applyingOppId: number | null;
  onOpenReadiness?: (opp: Opportunity) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  candidate,
  matchInfo,
  application,
  onClose,
  onApply,
  applyingOppId,
  onOpenReadiness,
}) => {
  if (!opportunity) return null;

  const score = matchInfo ? Math.round(matchInfo.match_score * (matchInfo.match_score <= 1.0 ? 100 : 1)) : 0;
  const isApplying = applyingOppId === opportunity.id;

  // Derive matched and missing skills from candidate skills
  const requiredSkills = opportunity.required_skills || [];
  const candidateSkillNames = new Set(
    (candidate?.skills || []).map(s => s.skill.name.toLowerCase())
  );

  const matchedSkillList = requiredSkills.filter(s =>
    s.skill && candidateSkillNames.has(s.skill.name.toLowerCase())
  );
  const missingSkillList = requiredSkills.filter(s =>
    s.skill && !candidateSkillNames.has(s.skill.name.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-150 my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              opportunity.type === 'placement' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
            }`}>
              {opportunity.type || 'internship'}
            </span>
            <span className="text-xs text-slate-300 font-medium">{opportunity.sector}</span>
            {opportunity.duration_months && (
              <span className="text-xs text-slate-400">• {opportunity.duration_months} Months</span>
            )}
          </div>

          <h2 className="text-xl font-black tracking-tight">{opportunity.title}</h2>
          <p className="text-sm font-semibold text-indigo-200 mt-0.5">{opportunity.company}</p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Match Score & Quick Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-indigo-950">{score}%</div>
                <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Opportunity DNA Fit</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-slate-200 text-slate-700 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 truncate">{opportunity.location || 'Pan-India'}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  Rs. {opportunity.stipend?.toLocaleString() || '15,000'}/mo
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stipend / Package</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {opportunity.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Position Description</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                {opportunity.description}
              </p>
            </div>
          )}

          {/* Eligible Streams */}
          {opportunity.allowed_streams && (
            <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-3.5 flex items-center gap-2 text-xs text-amber-900">
              <Award className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Eligible Streams: <strong>{opportunity.allowed_streams}</strong></span>
            </div>
          )}

          {/* Skill Analysis breakdown: Matched vs Missing */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Skill Requirement Analysis ({requiredSkills.length} Total Required)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Matched Skills */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200/70 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Matched Skills ({matchedSkillList.length})
                  </span>
                </div>
                {matchedSkillList.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No direct skill matches found.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {matchedSkillList.map((s, idx) => (
                      <span key={idx} className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
                        {s.skill?.name || 'Skill'}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing / Gap Skills */}
              <div className="p-4 bg-amber-50/50 border border-amber-200/70 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Skill Deficits ({missingSkillList.length})
                  </span>
                </div>
                {missingSkillList.length === 0 ? (
                  <p className="text-[11px] text-emerald-700 font-medium pt-1">✓ Complete skill coverage!</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {missingSkillList.map((s, idx) => (
                      <span key={idx} className="text-[11px] font-semibold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg">
                        {s.skill?.name || 'Skill'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="bg-slate-50 border-t border-slate-100 p-5 flex flex-wrap items-center justify-between gap-3">
          {onOpenReadiness && (
            <button
              onClick={() => {
                onClose();
                onOpenReadiness(opportunity);
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-indigo-50 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Open Readiness Simulator</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all"
            >
              Close
            </button>

            {application ? (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs px-4 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{application.status.toUpperCase()}</span>
              </div>
            ) : (
              <button
                onClick={async () => {
                  await onApply(opportunity.id);
                }}
                disabled={isApplying}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isApplying ? 'Submitting Application...' : 'Apply Now'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
