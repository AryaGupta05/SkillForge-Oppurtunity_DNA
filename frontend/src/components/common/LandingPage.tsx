import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Award, 
  Briefcase, 
  Building2, 
  ArrowRight, 
  Target, 
  TrendingUp, 
  FileText, 
  Zap
} from 'lucide-react';
import type { UserResponse } from '../../types';

interface LandingPageProps {
  currentUser: UserResponse | null;
  onOpenAuth: (role?: 'student' | 'industry' | 'academia') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onOpenAuth
}) => {
  const navigate = useNavigate();

  const handleCTA = (role: 'student' | 'industry' | 'academia') => {
    if (currentUser) {
      if (currentUser.role === role) {
        navigate(`/${role}/dashboard`);
      } else {
        // If logged in under different role, navigate to their dashboard
        navigate(`/${currentUser.role}/dashboard`);
      }
    } else {
      onOpenAuth(role);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header / Brand Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">SkillForge</h1>
                <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                  Opportunity DNA
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200 hidden sm:inline-block">
                  SIH PS #26044
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Academia-Industry Collaboration & Skill Mapping Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {currentUser ? (
              <button
                onClick={() => navigate(`/${currentUser.role}/dashboard`)}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                <span>Go to My Portal ({currentUser.role.toUpperCase()})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth()}
                  className="text-xs font-bold px-3.5 py-2 text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('student')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/30 to-slate-50 border-b border-slate-200 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold px-3.5 py-1.5 rounded-full mb-6 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>SIH26044 — Real Multi-Portal Skill Mapping SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.1]">
            SkillForge — <span className="text-indigo-600">Opportunity DNA</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            Evidence-backed skill intelligence connecting students, industry, and academia. Grounded in practical project artifacts, mathematical match scoring, and zero-bias recruitment.
          </p>

          {/* 3 Main Role CTAs */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <button
              onClick={() => handleCTA('student')}
              className="group p-6 bg-white hover:bg-indigo-600 hover:text-white border-2 border-slate-200 hover:border-indigo-600 rounded-2xl text-left transition-all shadow-sm hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-indigo-100 group-hover:bg-white/20 text-indigo-600 group-hover:text-white rounded-xl w-fit mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-white">I'm a Student</h3>
                <p className="text-xs text-slate-500 group-hover:text-indigo-100 mt-1">
                  Build your traceable Skill Passport, discover gaps, simulate readiness & apply to corporate internships.
                </p>
              </div>
              <div className="mt-6 flex items-center space-x-2 text-xs font-bold text-indigo-600 group-hover:text-white">
                <span>Enter Student Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => handleCTA('industry')}
              className="group p-6 bg-white hover:bg-emerald-600 hover:text-white border-2 border-slate-200 hover:border-emerald-600 rounded-2xl text-left transition-all shadow-sm hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-emerald-100 group-hover:bg-white/20 text-emerald-600 group-hover:text-white rounded-xl w-fit mb-4">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-white">I'm an Employer</h3>
                <p className="text-xs text-slate-500 group-hover:text-emerald-100 mt-1">
                  Post internships & placements, evaluate evidence-grounded candidate DNA & shortlist top matches.
                </p>
              </div>
              <div className="mt-6 flex items-center space-x-2 text-xs font-bold text-emerald-600 group-hover:text-white">
                <span>Enter Industry Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => handleCTA('academia')}
              className="group p-6 bg-white hover:bg-amber-600 hover:text-white border-2 border-slate-200 hover:border-amber-600 rounded-2xl text-left transition-all shadow-sm hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-amber-100 group-hover:bg-white/20 text-amber-600 group-hover:text-white rounded-xl w-fit mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-white">I'm an Institution</h3>
                <p className="text-xs text-slate-500 group-hover:text-amber-100 mt-1">
                  Analyze student skill supply vs. market demand, prioritize curriculum deficit gaps & track placement outcomes.
                </p>
              </div>
              <div className="mt-6 flex items-center space-x-2 text-xs font-bold text-amber-600 group-hover:text-white">
                <span>Enter Academia Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Product Pillar Sections */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Core Product Pillars</h2>
            <p className="text-sm text-slate-500 mt-2">
              Transforming unverified resumes into a transparent, mathematically rigorous career ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl w-fit">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Evidence-Backed Skill Mapping</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Extracts technical capabilities directly from PDF resumes, GitHub repositories, and practical project artifacts with full evidence provenance and confidence scores.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl w-fit">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Opportunity DNA & Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Computes objective candidate-opportunity match scores evaluating skill depth, breadth, and evidence multipliers without demographic or institutional pedigree bias.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl w-fit">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Academia–Industry Intelligence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provides universities with real-time aggregate visibility comparing student skill supply against market demand to eliminate critical curriculum deficit gaps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">SkillForge — Opportunity DNA</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">SIH PS #26044</span>
          </div>

          <div className="text-center sm:text-right text-slate-500">
            <p>Portal for Academia - Industry Collaboration for Skill Mapping, Internships and Placement</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
