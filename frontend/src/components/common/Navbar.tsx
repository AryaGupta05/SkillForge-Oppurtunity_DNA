import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Globe, LogOut, User } from 'lucide-react';
import type { UserResponse } from '../../types';

interface NavbarProps {
  currentUser: UserResponse | null;
  activePortal: 'student' | 'industry' | 'academia';
  lang: 'en' | 'hi';
  onToggleLang: () => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activePortal,
  lang,
  onToggleLang,
  onLogout,
  onOpenAuth,
}) => {
  const navigate = useNavigate();

  const portalBadge = 
    activePortal === 'student' ? { label: 'Student Portal', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' } :
    activePortal === 'industry' ? { label: 'Industry Partner Portal', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' } :
    { label: 'Academia Portal', color: 'bg-amber-100 text-amber-800 border-amber-200' };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand & Portal Indicator */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">SkillForge</h1>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${portalBadge.color}`}>
                  {portalBadge.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">SIH PS #26044 — Opportunity DNA Platform</p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-700"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {/* Account Info / Login Button */}
            {currentUser ? (
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">{currentUser.full_name}</div>
                    <div className="text-[10px] text-slate-500 capitalize flex items-center space-x-1">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                        currentUser.role === 'student' ? 'bg-indigo-500' : currentUser.role === 'industry' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                      <span>{currentUser.role}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
