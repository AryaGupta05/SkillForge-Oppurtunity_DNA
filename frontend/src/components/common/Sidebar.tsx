import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Award, 
  FolderGit2, 
  Briefcase, 
  Send, 
  Target, 
  BookOpen, 
  Settings,
  Building2,
  PlusCircle,
  Users,
  TrendingUp,
  BarChart3,
  CheckSquare,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  portal: 'student' | 'industry' | 'academia';
}

export const Sidebar: React.FC<SidebarProps> = ({ portal }) => {
  const studentNav = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'My Profile', icon: User },
    { to: '/student/skills', label: 'Skill Passport', icon: Award },
    { to: '/student/projects', label: 'My Projects', icon: FolderGit2 },
    { to: '/student/opportunities', label: 'Opportunities', icon: Briefcase },
    { to: '/student/applications', label: 'Applications', icon: Send },
    { to: '/student/readiness', label: 'Readiness', icon: Target },
    { to: '/student/roadmap', label: 'Roadmap', icon: BookOpen },
    { to: '/student/settings', label: 'Settings', icon: Settings },
  ];

  const industryNav = [
    { to: '/industry/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/industry/company', label: 'Company Profile', icon: Building2 },
    { to: '/industry/opportunities', label: 'My Opportunities', icon: Briefcase },
    { to: '/industry/opportunities/new', label: 'Post Opportunity', icon: PlusCircle },
    { to: '/industry/applicants', label: 'Applicants', icon: Users },
    { to: '/industry/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/industry/settings', label: 'Settings', icon: Settings },
  ];

  const academiaNav = [
    { to: '/academia/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/academia/institution', label: 'Institution Profile', icon: Building2 },
    { to: '/academia/students', label: 'Students', icon: GraduationCap },
    { to: '/academia/skill-supply', label: 'Student Skill Supply', icon: Award },
    { to: '/academia/industry-demand', label: 'Industry Demand', icon: Briefcase },
    { to: '/academia/skill-gaps', label: 'Skill Gap Analysis', icon: TrendingUp },
    { to: '/academia/outcomes', label: 'Internships & Placements', icon: CheckSquare },
    { to: '/academia/settings', label: 'Settings', icon: Settings },
  ];

  const navItems = 
    portal === 'student' ? studentNav :
    portal === 'industry' ? industryNav :
    academiaNav;

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0">
      <div className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
