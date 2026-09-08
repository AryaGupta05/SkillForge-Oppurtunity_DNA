import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import type { UserResponse } from '../../types';

interface IndustryLayoutProps {
  currentUser: UserResponse | null;
  lang: 'en' | 'hi';
  onToggleLang: () => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const IndustryLayout: React.FC<IndustryLayoutProps> = ({
  currentUser,
  lang,
  onToggleLang,
  onLogout,
  onOpenAuth,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar
        currentUser={currentUser}
        activePortal="industry"
        lang={lang}
        onToggleLang={onToggleLang}
        onLogout={onLogout}
        onOpenAuth={onOpenAuth}
      />
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar portal="industry" />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
