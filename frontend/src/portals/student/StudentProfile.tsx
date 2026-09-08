import React from 'react';
import { FileText, Upload, Sparkles, CheckCircle2, ShieldCheck, MapPin, Building, GraduationCap, DollarSign, RefreshCw } from 'lucide-react';
import type { Candidate } from '../../types';

interface StudentProfileProps {
  candidate: Candidate | null;
  candidates: Candidate[];
  onSelectCandidate: (id: number) => void;
  uploadFile: File | null;
  onSetUploadFile: (file: File | null) => void;
  onResumeUpload: () => Promise<void>;
  onDiscoverSkills: () => Promise<void>;
  loading: boolean;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  candidate,
  candidates,
  onSelectCandidate,
  uploadFile,
  onSetUploadFile,
  onResumeUpload,
  onDiscoverSkills,
  loading
}) => {
  if (!candidate) {
    return <div className="p-8 text-center text-xs text-slate-500">No active student profile selected.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Profile & Overview</h1>
          <p className="text-xs text-slate-500">Candidate Information, PMIS Eligibility Credentials & Resume Processing</p>
        </div>

        {/* Candidate Profile Switcher */}
        {candidates.length > 1 && (
          <select
            value={candidate.id}
            onChange={(e) => onSelectCandidate(Number(e.target.value))}
            className="bg-white border border-slate-300 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.qualification_stream || c.highest_degree})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Main Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
            {candidate.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{candidate.name}</h2>
            <p className="text-xs text-slate-500">{candidate.email}</p>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200 mt-1 inline-block">
              {candidate.qualification_stream || candidate.highest_degree || 'B.Tech AI/ML'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-2 text-slate-700">
            <Building className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Institution</span>
              <span className="font-semibold">{candidate.institution || 'Delhi Technological University'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-700">
            <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Stream / Degree</span>
              <span className="font-semibold">{candidate.qualification_stream || candidate.highest_degree || 'Computer Engineering'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-700">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Location</span>
              <span className="font-semibold">{candidate.location || candidate.preferred_location || 'New Delhi'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-700">
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Family Income</span>
              <span className="font-semibold">Rs. {candidate.family_income?.toLocaleString() || '4,50,000'}/year</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Govt Employee Family</span>
              <span className="font-semibold">{candidate.is_family_govt_employee ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Elite College Pedigree Flag</span>
              <span className="font-semibold">{candidate.institution_is_elite ? 'Elite (Tier 1)' : 'State / Non-Elite'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Processing & Discovery Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Upload Resume (PDF Processing)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Upload your latest resume PDF to automatically extract evidence-backed capability skills using Gemini AI.
          </p>

          <div className="space-y-3">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => onSetUploadFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />

            <button
              onClick={onResumeUpload}
              disabled={loading || !uploadFile}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>Process PDF Resume</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Capability Discovery Engine</span>
          </h3>
          <p className="text-xs text-slate-500">
            Run Opportunity DNA's deterministic capability discovery to map skills, confidence, and project evidence provenance.
          </p>

          <button
            onClick={onDiscoverSkills}
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Discover Skills (AI Analysis)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
