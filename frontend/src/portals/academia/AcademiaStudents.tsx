import React, { useState } from 'react';
import { Award, Search, Filter, GraduationCap, AlertCircle } from 'lucide-react';
import type { Candidate, UserResponse } from '../../types';

interface AcademiaStudentsProps {
  currentUser?: UserResponse | null;
  candidates: Candidate[];
  onViewDNA?: (candId: number, name: string) => void;
  onViewCandidateDNA?: (candId: number, name: string) => void;
}

export const AcademiaStudents: React.FC<AcademiaStudentsProps> = ({
  currentUser,
  candidates,
  onViewDNA,
  onViewCandidateDNA
}) => {
  const handleView = onViewDNA || onViewCandidateDNA || (() => {});
  const instName = currentUser?.institution || 'Institution Scope';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStream, setSelectedStream] = useState<string>('all');

  // Extract unique streams/degrees from candidates list
  const availableStreams = Array.from(
    new Set(
      candidates
        .map(c => c.qualification_stream || c.highest_degree)
        .filter((s): s is string => Boolean(s))
    )
  );

  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = 
      cand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cand.qualification_stream || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cand.highest_degree || '').toLowerCase().includes(searchTerm.toLowerCase());

    const candStream = cand.qualification_stream || cand.highest_degree || '';
    const matchesStream = selectedStream === 'all' || candStream === selectedStream;

    return matchesSearch && matchesStream;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-amber-700" />
            <span>Institutional Student Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified Candidates for <strong className="text-slate-800">{instName}</strong>
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-bold bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200">
            {candidates.length} Registered Students
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, email, stream, degree..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
          />
        </div>

        {availableStreams.length > 0 && (
          <div className="relative shrink-0 sm:w-56">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white font-medium text-slate-700 appearance-none cursor-pointer"
            >
              <option value="all">All Academic Streams ({candidates.length})</option>
              {availableStreams.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Student Cards List */}
      {filteredCandidates.length === 0 ? (
        <div className="p-12 text-center text-xs bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="font-bold text-slate-700">No students match your query</p>
          <p className="text-slate-500">Try adjusting search criteria or selecting 'All Academic Streams'.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCandidates.map((cand) => (
            <div key={cand.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:border-amber-200 transition-all">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">{cand.name}</span>
                  <span className="text-xs font-semibold text-slate-400">• Student ID #{cand.id}</span>
                </div>
                <p className="text-xs text-slate-500">
                  <strong className="text-slate-700">{cand.institution || instName}</strong> • {cand.qualification_stream || cand.highest_degree || 'General Stream'}
                </p>
                <div className="flex items-center space-x-3 text-xs pt-1 text-slate-600">
                  <span>Skills: <strong className="text-indigo-700">{cand.skills?.length || 0}</strong></span>
                  <span>• Evidence Items: <strong className="text-emerald-700">{cand.evidence?.length || 0}</strong></span>
                  {cand.location && <span>• Location: <strong className="text-slate-800">{cand.location}</strong></span>}
                </div>
              </div>

              <button
                onClick={() => handleView(cand.id, cand.name)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 shrink-0"
              >
                <Award className="w-4 h-4" />
                <span>Inspect Skill DNA</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
