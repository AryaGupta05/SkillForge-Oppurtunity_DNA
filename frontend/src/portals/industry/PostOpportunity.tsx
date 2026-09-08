import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import type { Skill } from '../../types';

interface PostOpportunityProps {
  skillsCatalog: Skill[];
  onCreateSuccess: () => void;
}

export const PostOpportunity: React.FC<PostOpportunityProps> = ({
  skillsCatalog,
  onCreateSuccess
}) => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState<'internship' | 'placement'>('internship');
  const [duration, setDuration] = useState<number>(6);
  const [stipend, setStipend] = useState<number>(15000);
  const [location, setLocation] = useState('');
  const [sector, setSector] = useState('IT & Software');
  const [streams, setStreams] = useState('B.Tech, MCA, Data Science');
  const [description, setDescription] = useState('');

  const [selectedSkillId, setSelectedSkillId] = useState<number | ''>('');
  const [reqSkills, setReqSkills] = useState<{ skill_id: number; skill_name: string; importance: number; required_level: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddSkill = () => {
    if (!selectedSkillId) return;
    const sk = skillsCatalog.find(s => s.id === Number(selectedSkillId));
    if (sk && !reqSkills.some(s => s.skill_id === sk.id)) {
      setReqSkills([...reqSkills, { skill_id: sk.id, skill_name: sk.name, importance: 1.0, required_level: 'Intermediate' }]);
      setSelectedSkillId('');
    }
  };

  const handleRemoveSkill = (skillId: number) => {
    setReqSkills(reqSkills.filter(s => s.skill_id !== skillId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company) return;

    setLoading(true);
    try {
      await api.createOpportunity({
        title,
        company,
        type,
        duration_months: Number(duration),
        stipend: Number(stipend),
        location,
        sector,
        allowed_streams: streams,
        description,
        required_skills: reqSkills.map(s => ({
          skill_id: s.skill_id,
          importance: s.importance,
          required_level: s.required_level
        }))
      });
      onCreateSuccess();
      navigate('/industry/opportunities');
    } catch (err: any) {
      alert(err.message || 'Failed to create opportunity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
        <button
          onClick={() => navigate('/industry/opportunities')}
          className="p-2 text-slate-500 hover:text-slate-900 bg-white border rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Post Corporate Position</h1>
          <p className="text-xs text-slate-500">Create Internship or Permanent Placement Posting</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Position Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. AI/ML Engineering Intern"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Company / Organization *</label>
            <input
              type="text"
              required
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="e.g. Bharat AI Innovations Ltd"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Opportunity Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-xl font-bold text-slate-800"
            >
              <option value="internship">Corporate Internship (PMIS)</option>
              <option value="placement">Permanent Placement (Full-Time)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Duration (Months)</label>
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Monthly Stipend / Compensation (Rs.)</label>
            <input
              type="number"
              value={stipend}
              onChange={e => setStipend(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. New Delhi"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Industry Sector</label>
            <input
              type="text"
              value={sector}
              onChange={e => setSector(e.target.value)}
              placeholder="e.g. IT & Software"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Eligible Qualification Streams</label>
          <input
            type="text"
            value={streams}
            onChange={e => setStreams(e.target.value)}
            placeholder="e.g. Computer Science, B.Tech, MCA"
            className="w-full px-3 py-2 border rounded-xl"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Position Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe role responsibilities and key deliverables..."
            className="w-full px-3 py-2 border rounded-xl"
          />
        </div>

        {/* Required Skills Selection */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <label className="font-bold text-slate-800 block">Required Capability Skills</label>

          <div className="flex space-x-2">
            <select
              value={selectedSkillId}
              onChange={e => setSelectedSkillId(Number(e.target.value))}
              className="flex-1 px-3 py-2 border rounded-xl"
            >
              <option value="">-- Select Skill from Catalog --</option>
              {skillsCatalog.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl"
            >
              Add Skill
            </button>
          </div>

          <div className="space-y-2">
            {reqSkills.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-xl">
                <span className="font-bold text-slate-800">{s.skill_name}</span>
                <div className="flex items-center space-x-3">
                  <select
                    value={s.required_level}
                    onChange={e => {
                      const updated = [...reqSkills];
                      updated[idx].required_level = e.target.value;
                      setReqSkills(updated);
                    }}
                    className="px-2 py-1 border rounded-lg text-xs"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s.skill_id)}
                    className="text-rose-600 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/industry/opportunities')}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Opportunity'}
          </button>
        </div>
      </form>
    </div>
  );
};
