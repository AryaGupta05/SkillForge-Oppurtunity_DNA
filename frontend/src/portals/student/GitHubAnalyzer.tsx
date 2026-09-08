import React, { useState } from 'react';
import {
  GitBranch,
  Search,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Code2,
  Zap,
  Star,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../../services/api';
import { normalizeApiError } from '../../services/api';
import type { GitHubAnalysisResponse, GitHubAnalyzedSkill } from '../../types';

interface GitHubAnalyzerProps {
  candidateId: number;
  onAnalysisComplete?: () => void;
}

// Client-side URL validation — must match GitHub repo pattern
const GITHUB_REPO_RE = /^https?:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;

function validateGitHubUrl(url: string): string | null {
  if (!url.trim()) return 'Please enter a GitHub repository URL.';
  if (!url.startsWith('https://github.com/') && !url.startsWith('http://github.com/')) {
    return 'Only public GitHub repository URLs are supported (e.g. https://github.com/owner/repository).';
  }
  if (!GITHUB_REPO_RE.test(url.trim())) {
    return 'Invalid GitHub repository URL. Expected: https://github.com/<owner>/<repository>';
  }
  return null;
}

const skillTypeBadge: Record<string, string> = {
  explicit: 'bg-indigo-100 text-indigo-800',
  inferred: 'bg-amber-100 text-amber-800',
  adjacent: 'bg-slate-200 text-slate-700',
};

const proficiencyColor: Record<string, string> = {
  Expert: 'text-emerald-700',
  Intermediate: 'text-indigo-600',
  Beginner: 'text-amber-600',
};

interface SkillCardProps {
  skill: GitHubAnalyzedSkill;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
  const [expanded, setExpanded] = useState(false);
  const confidencePct = Math.round(skill.confidence * 100);

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-900 text-xs">{skill.name}</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
              skillTypeBadge[skill.skill_type] || skillTypeBadge.adjacent
            }`}
          >
            {skill.skill_type}
          </span>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-slate-400 hover:text-slate-600 shrink-0"
          aria-label="Toggle explanation"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <p className="text-[11px] text-slate-500">{skill.category}</p>

      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
        <span className={`font-medium ${proficiencyColor[skill.proficiency] || 'text-slate-700'}`}>
          {skill.proficiency}
        </span>
        <span className="text-emerald-700 font-bold">{confidencePct}% conf.</span>
        <span className="text-slate-500">{skill.evidence_count} file(s)</span>
      </div>

      {expanded && skill.explanation && (
        <p className="text-[11px] text-slate-600 bg-white border border-slate-100 rounded-lg p-2 leading-relaxed">
          {skill.explanation}
        </p>
      )}
    </div>
  );
};

export const GitHubAnalyzer: React.FC<GitHubAnalyzerProps> = ({
  candidateId,
  onAnalysisComplete,
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GitHubAnalysisResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoUrl(e.target.value);
    if (urlError) setUrlError(null);
    if (apiError) setApiError(null);
  };

  const handleAnalyze = async () => {
    setApiError(null);
    setResult(null);

    const validationError = validateGitHubUrl(repoUrl);
    if (validationError) {
      setUrlError(validationError);
      return;
    }
    setUrlError(null);

    setLoading(true);
    try {
      const data = await api.analyzeGitHubRepo(candidateId, repoUrl.trim());
      setResult(data);
      if (onAnalysisComplete) onAnalysisComplete();
    } catch (err: any) {
      setApiError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setApiError(null);
    setRepoUrl('');
    setUrlError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleAnalyze();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
        <GitBranch className="w-5 h-5 text-slate-700" />
        <div>
          <h2 className="text-sm font-bold text-slate-900">Analyze a GitHub Repository</h2>
          <p className="text-[11px] text-slate-500">
            Extract evidence and skills from any public repository you've built
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* URL Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            Public GitHub Repository URL
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="url"
                value={repoUrl}
                onChange={handleUrlChange}
                onKeyDown={handleKeyDown}
                placeholder="https://github.com/username/repository"
                disabled={loading}
                className={`w-full px-4 py-2.5 text-xs border rounded-xl pr-10 focus:outline-none focus:ring-2 transition-all
                  ${urlError
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-400'
                  }
                  ${loading ? 'opacity-60 cursor-not-allowed' : ''}
                `}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading || !repoUrl.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing…</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Analyze Repository</span>
                </>
              )}
            </button>
          </div>

          {urlError && (
            <p className="text-[11px] text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {urlError}
            </p>
          )}

          <p className="text-[11px] text-slate-400">
            Only public repositories are supported. Files are fetched via the GitHub API — no cloning occurs.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
            <div>
              <p className="text-xs font-bold text-indigo-800">Analyzing repository…</p>
              <p className="text-[11px] text-indigo-600">
                Fetching files, extracting evidence, and discovering skills with AI.
                This may take 15–30 seconds.
              </p>
            </div>
          </div>
        )}

        {/* API Error */}
        {apiError && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-xs font-bold text-red-800">Analysis Failed</p>
            </div>
            <p className="text-[11px] text-red-700 leading-relaxed">{apiError}</p>
            <button
              onClick={handleClear}
              className="text-[11px] font-bold text-red-600 hover:text-red-800 underline"
            >
              Try a different repository
            </button>
          </div>
        )}

        {/* Success Results */}
        {result && !loading && (
          <div className="space-y-5">
            {/* Repo Summary */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-900">{result.repository_name}</p>
                    {result.repository_description && (
                      <p className="text-[11px] text-emerald-700">{result.repository_description}</p>
                    )}
                  </div>
                </div>
                <a
                  href={result.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-800 shrink-0"
                  title="Open on GitHub"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {result.primary_language && (
                  <div className="bg-white rounded-lg p-2.5 border border-emerald-100 text-center">
                    <Code2 className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500">Language</p>
                    <p className="text-xs font-bold text-slate-800">{result.primary_language}</p>
                  </div>
                )}
                <div className="bg-white rounded-lg p-2.5 border border-emerald-100 text-center">
                  <FileText className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500">Files Analyzed</p>
                  <p className="text-xs font-bold text-slate-800">{result.files_analyzed}</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-emerald-100 text-center">
                  <Star className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500">Evidence Created</p>
                  <p className="text-xs font-bold text-slate-800">{result.evidence_created}</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-emerald-100 text-center">
                  <Zap className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500">Skills Found</p>
                  <p className="text-xs font-bold text-slate-800">{result.skills_discovered.length}</p>
                </div>
              </div>

              {result.dna_updated && (
                <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Opportunity DNA profile updated with GitHub evidence
                </p>
              )}
            </div>

            {/* Discovered Skills */}
            {result.skills_discovered.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  Discovered Skills ({result.skills_discovered.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.skills_discovered.map((skill, i) => (
                    <SkillCard key={`${skill.name}-${i}`} skill={skill} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-800">No skills discovered</p>
                <p className="text-[11px] text-amber-700 mt-1">
                  The AI could not identify demonstrable skills from this repository's content.
                  Try a repository with more source code or documentation.
                </p>
              </div>
            )}

            {/* Analyze Another */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={handleClear}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1.5"
              >
                <GitBranch className="w-3.5 h-3.5" />
                Analyze another repository
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
