import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { api, normalizeApiError } from '../../services/api';
import type { Skill, Opportunity } from '../../types';

interface EditOpportunityProps {
  skillsCatalog: Skill[];
  opportunities: Opportunity[];
  onUpdateSuccess: () => Promise<void>;
}

export const EditOpportunity: React.FC<EditOpportunityProps> = ({
  skillsCatalog,
  opportunities,
  onUpdateSuccess
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const oppId = Number(id);

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState<'internship' | 'placement' | 'project'>('internship');
  const [duration, setDuration] = useState<number>(6);
  const [stipend, setStipend] = useState<number>(15000);
  const [location, setLocation] = useState('');
  const [sector, setSector] = useState('');
  const [streams, setStreams] = useState('');
  const [description, setDescription] = useState('');

  const [selectedSkillId, setSelectedSkillId] = useState<number | ''>('');
  const [reqSkills, setReqSkills] = useState<{ skill_id: number; skill_name: string; importance: number; required_level: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzingJob, setAnalyzingJob] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const opp = opportunities.find(o => o.id === oppId);
    if (opp) {
      setOpportunity(opp);
      setTitle(opp.title || '');
      setCompany(opp.company || '');
      setType(opp.type || 'internship');
      setDuration(opp.duration_months || 6);
      setStipend(opp.stipend || 0);
      setLocation(opp.location || '');
      setSector(opp.sector || '');
      setStreams(opp.allowed_streams || '');
      setDescription(opp.description || '');

      if (opp.required_skills) {
        setReqSkills(opp.required_skills.map(rs => ({
          skill_id: rs.skill_id,
          skill_name: rs.skill?.name || `Skill #${rs.skill_id}`,
          importance: rs.importance || 1.0,
          required_level: rs.required_level || 'Intermediate'
        })));
      }
    }
  }, [oppId, opportunities]);

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

  const handleAnalyzeJobDescription = async () => {
    if (!description || !description.trim()) {
      setErrorMsg("Please enter a position description to analyze required skills.");
      return;
    }

    setAnalyzingJob(true);
    setErrorMsg(null);
    try {
      const extractedReqs = await api.analyzeOpportunity(oppId);
      if (extractedReqs && extractedReqs.length > 0) {
        setReqSkills(extractedReqs.map(rs => ({
          skill_id: rs.skill_id,
          skill_name: rs.skill?.name || `Skill #${rs.skill_id}`,
          importance: rs.importance || 1.0,
          required_level: rs.required_level || 'Intermediate'
        })));
      }
    } catch (err: any) {
      setErrorMsg(normalizeApiError(err));
    } finally {
      setAnalyzingJob(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || !company.trim()) {
      setErrorMsg("Position Title and Company Name are required.");
      return;
    }

    if (duration < 1) {
      setErrorMsg("Duration must be at least 1 month.");
      return;
    }

    setLoading(true);
    try {
      await api.updateOpportunity(oppId, {
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
      await onUpdateSuccess();
      navigate('/industry/opportunities');
    } catch (err: any) {
      setErrorMsg(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!opportunity) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
        Opportunity not found or access unauthorized.
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-slate-900">Edit Opportunity #{oppId}</h1>
          <p className="text-xs text-slate-500">Update Posting Details & Capability Requirements</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Position Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
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
              <option value="project">Project Work</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Duration (Months)</label>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Monthly Compensation (Rs.)</label>
            <input
              type="number"
              min={0}
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
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Industry Sector</label>
            <input
              type="text"
              value={sector}
              onChange={e => setSector(e.target.value)}
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
            className="w-full px-3 py-2 border rounded-xl"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-bold text-slate-700">Position Description</label>
            <button
              type="button"
              onClick={handleAnalyzeJobDescription}
              disabled={analyzingJob}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{analyzingJob ? 'Extracting AI Skills...' : 'Extract AI Skills from Description'}</span>
            </button>
          </div>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
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
                    className="text-rose-600 font-bold hover:underline text-xs"
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
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
