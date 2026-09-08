import React, { useState } from 'react';
import { FolderGit2, PlusCircle, Calendar } from 'lucide-react';
import type { Candidate, Evidence } from '../../types';

interface StudentProjectsProps {
  candidate: Candidate | null;
  onAddProject?: (project: { title: string; description: string; source: string }) => void;
}

export const StudentProjects: React.FC<StudentProjectsProps> = ({
  candidate,
  onAddProject
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('GitHub');

  if (!candidate) {
    return <div className="p-8 text-center text-xs text-slate-500">No student profile selected.</div>;
  }

  const evidence = candidate.evidence || [];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddProject && title) {
      onAddProject({ title, description, source });
      setTitle('');
      setDescription('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Project Evidence</h1>
          <p className="text-xs text-slate-500">Verifiable Project Artifacts Grounding Your Opportunity DNA</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      <div className="space-y-4">
        {evidence.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-2">
            <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto" />
            <p>No project evidence registered yet. Add a project artifact or sync GitHub.</p>
          </div>
        ) : (
          evidence.map((ev: Evidence) => (
            <div key={ev.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {ev.type || 'project'}
                    </span>
                    <span className="text-xs text-slate-400">{ev.source || 'Resume'}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{ev.title}</h3>
                </div>
                {ev.date && (
                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{ev.date}</span>
                  </span>
                )}
              </div>

              {ev.description && (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {ev.description}
                </p>
              )}

              {ev.raw_content && (
                <div className="text-[11px] text-slate-500 font-mono bg-slate-900 text-slate-200 p-3 rounded-xl overflow-x-auto">
                  {ev.raw_content.slice(0, 200)}...
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Project Artifact</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Flower Classification using MobileNetV2"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Summary</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe technical features, tools, and algorithms used..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Source Provenance</label>
                <select
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="GitHub">GitHub Repository</option>
                  <option value="Project">Academic Project</option>
                  <option value="Certification">Hackathon / Certification</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
