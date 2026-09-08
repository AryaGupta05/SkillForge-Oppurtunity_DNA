import React, { useState } from 'react';
import { Lock, X, AlertCircle, GraduationCap, Building2, School } from 'lucide-react';
import { api, normalizeApiError } from '../../services/api';
import type { UserResponse } from '../../types';

interface AuthModalProps {
  initialRole?: 'student' | 'industry' | 'academia';
  onClose: () => void;
  onSuccess: (user: UserResponse) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialRole,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'student' | 'industry' | 'academia'>(initialRole || 'student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Student Form State
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentCollegeId, setStudentCollegeId] = useState('');
  const [studentInstitution, setStudentInstitution] = useState('');
  const [studentDegree, setStudentDegree] = useState('');
  const [studentGradYear, setStudentGradYear] = useState('');

  // Industry Form State
  const [indContactName, setIndContactName] = useState('');
  const [indEmail, setIndEmail] = useState('');
  const [indPassword, setIndPassword] = useState('');
  const [indCompanyName, setIndCompanyName] = useState('');
  const [indWebsite, setIndWebsite] = useState('');
  const [indSector, setIndSector] = useState('');
  const [indOrgType, setIndOrgType] = useState('Private Corporate');
  const [indDesignation, setIndDesignation] = useState('');

  // Academia Form State
  const [acadAdminName, setAcadAdminName] = useState('');
  const [acadEmail, setAcadEmail] = useState('');
  const [acadPassword, setAcadPassword] = useState('');
  const [acadInstName, setAcadInstName] = useState('');
  const [acadInstType, setAcadInstType] = useState('University / Autonomous Institute');
  const [acadWebsite, setAcadWebsite] = useState('');
  const [acadDomain, setAcadDomain] = useState('');
  const [acadDesignation, setAcadDesignation] = useState('');
  const [acadIdentifier, setAcadIdentifier] = useState('');

  // OTP Verification State
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const startResendTimer = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email: loginEmail, password: loginPassword });
      if (res.user.account_status === 'pending_email_verification') {
        setPendingEmail(loginEmail);
        setIsOtpStep(true);
      } else {
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.registerStudent({
        full_name: studentName,
        email: studentEmail,
        password: studentPassword,
        college_id_or_enrollment_number: studentCollegeId,
        institution: studentInstitution || undefined,
        degree: studentDegree || undefined,
        graduation_year: studentGradYear || undefined,
      });
      setPendingEmail(studentEmail);
      setIsOtpStep(true);
    } catch (err: any) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterIndustry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.registerIndustry({
        full_name: indContactName,
        email: indEmail,
        password: indPassword,
        company_name: indCompanyName,
        website: indWebsite || undefined,
        industry_sector: indSector || undefined,
        organization_type: indOrgType || undefined,
        designation: indDesignation || undefined,
      });
      setPendingEmail(indEmail);
      setIsOtpStep(true);
    } catch (err: any) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAcademia = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.registerAcademia({
        full_name: acadAdminName,
        email: acadEmail,
        password: acadPassword,
        institution_name: acadInstName,
        institution_type: acadInstType || undefined,
        website: acadWebsite || undefined,
        official_domain: acadDomain || undefined,
        designation: acadDesignation || undefined,
        institution_identifier: acadIdentifier || undefined,
      });
      setPendingEmail(acadEmail);
      setIsOtpStep(true);
    } catch (err: any) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyEmail({ email: pendingEmail, otp: otpCode });
      onSuccess(res.user);
    } catch (err: any) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError(null);
    setResendMessage(null);
    try {
      const res = await api.resendVerification({ email: pendingEmail });
      setResendMessage(res.message || 'New verification OTP code sent.');
      startResendTimer();
    } catch (err: any) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-100 text-indigo-700 p-1.5 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'login' ? 'Unified Sign In' : 'Role-Specific Registration'}
              </h3>
              <p className="text-xs text-slate-500">SkillForge — Opportunity DNA Auth</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {resendMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center space-x-2">
            <span>{resendMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {isOtpStep ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-sky-900 text-[11px] leading-relaxed">
              <strong>Email Verification Required:</strong> Enter the 6-digit security OTP sent to <strong>{pendingEmail}</strong>.
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">6-Digit Security Code (OTP)</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full px-3 py-2 text-center tracking-widest text-lg font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Verifying OTP...' : 'Verify Email & Access Account'}
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
              <button
                type="button"
                onClick={() => { setIsOtpStep(false); setError(null); }}
                className="hover:underline text-slate-600"
              >
                ← Back to Sign In
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                className="font-bold text-sky-600 hover:underline disabled:opacity-40"
              >
                {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        ) : mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-indigo-900 text-[11px] leading-relaxed">
              <strong>Unified Login:</strong> Sign in with your registered email and password. The system will automatically direct you to your role's portal (Student, Industry, or Academia).
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. user@example.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="text-center pt-1 text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className="text-indigo-600 font-bold hover:underline"
              >
                Create a role-specific account
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Registration Role Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => { setActiveTab('student'); setError(null); }}
                className={`py-2 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center space-x-1 transition-all ${
                  activeTab === 'student'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('industry'); setError(null); }}
                className={`py-2 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center space-x-1 transition-all ${
                  activeTab === 'industry'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Industry</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('academia'); setError(null); }}
                className={`py-2 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center space-x-1 transition-all ${
                  activeTab === 'academia'
                    ? 'bg-white text-amber-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>Academia</span>
              </button>
            </div>

            {/* TAB 1: STUDENT REGISTRATION */}
            {activeTab === 'student' && (
              <form onSubmit={handleRegisterStudent} className="space-y-3">
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-2 text-[11px] text-indigo-900">
                  Verify your email to activate your Student account and access Skill Passports and application workflows.
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Email Address *</label>
                  <input
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">College ID / Enrollment Number *</label>
                  <input
                    type="text"
                    required
                    value={studentCollegeId}
                    onChange={(e) => setStudentCollegeId(e.target.value)}
                    placeholder="e.g. 2024-CS-10892"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">College / Institution</label>
                    <input
                      type="text"
                      value={studentInstitution}
                      onChange={(e) => setStudentInstitution(e.target.value)}
                      placeholder="e.g. DIET Delhi"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Degree / Stream</label>
                    <input
                      type="text"
                      value={studentDegree}
                      onChange={(e) => setStudentDegree(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Graduation Year</label>
                  <input
                    type="text"
                    value={studentGradYear}
                    onChange={(e) => setStudentGradYear(e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 mt-2"
                >
                  {loading ? 'Creating Student Account...' : 'Register as Student'}
                </button>
              </form>
            )}

            {/* TAB 2: INDUSTRY REGISTRATION */}
            {activeTab === 'industry' && (
              <form onSubmit={handleRegisterIndustry} className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[11px] text-amber-900">
                  <strong>Notice:</strong> Industry partner accounts require administrative verification. Once registered, your account will be in <em>pending verification</em> status.
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Person Full Name *</label>
                  <input
                    type="text"
                    required
                    value={indContactName}
                    onChange={(e) => setIndContactName(e.target.value)}
                    placeholder="e.g. Rajesh Verma"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Company Email *</label>
                  <input
                    type="email"
                    required
                    value={indEmail}
                    onChange={(e) => setIndEmail(e.target.value)}
                    placeholder="recruiter@company.com"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={indPassword}
                    onChange={(e) => setIndPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={indCompanyName}
                      onChange={(e) => setIndCompanyName(e.target.value)}
                      placeholder="e.g. TechCorp Innovations"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Industry Sector</label>
                    <input
                      type="text"
                      value={indSector}
                      onChange={(e) => setIndSector(e.target.value)}
                      placeholder="e.g. IT, Finance, Retail"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company Website</label>
                    <input
                      type="url"
                      value={indWebsite}
                      onChange={(e) => setIndWebsite(e.target.value)}
                      placeholder="https://company.com"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Designation</label>
                    <input
                      type="text"
                      value={indDesignation}
                      onChange={(e) => setIndDesignation(e.target.value)}
                      placeholder="e.g. Head of Talent Acquisition"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Organization Type</label>
                  <select
                    value={indOrgType}
                    onChange={(e) => setIndOrgType(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Private Corporate">Private Corporate</option>
                    <option value="Public Sector Enterprise (PSU)">Public Sector Enterprise (PSU)</option>
                    <option value="Government Department">Government Department</option>
                    <option value="MSME / Startup">MSME / Startup</option>
                    <option value="Non-Profit / NGO">Non-Profit / NGO</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 mt-2"
                >
                  {loading ? 'Submitting Registration...' : 'Register Industry Organization'}
                </button>
              </form>
            )}

            {/* TAB 3: ACADEMIA REGISTRATION */}
            {activeTab === 'academia' && (
              <form onSubmit={handleRegisterAcademia} className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[11px] text-amber-900">
                  <strong>Notice:</strong> Academic institution accounts require institutional verification before accessing dashboard metrics.
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Authorized Official Name *</label>
                  <input
                    type="text"
                    required
                    value={acadAdminName}
                    onChange={(e) => setAcadAdminName(e.target.value)}
                    placeholder="e.g. Dr. K. S. Raman"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Institutional Email *</label>
                  <input
                    type="email"
                    required
                    value={acadEmail}
                    onChange={(e) => setAcadEmail(e.target.value)}
                    placeholder="admin@university.edu.in"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={acadPassword}
                    onChange={(e) => setAcadPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Institution Name *</label>
                  <input
                    type="text"
                    required
                    value={acadInstName}
                    onChange={(e) => setAcadInstName(e.target.value)}
                    placeholder="e.g. IIT Delhi"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Institution Type</label>
                    <select
                      value={acadInstType}
                      onChange={(e) => setAcadInstType(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="University / Autonomous Institute">University / Autonomous Institute</option>
                      <option value="Engineering College (AICTE)">Engineering College (AICTE)</option>
                      <option value="Polytechnic / ITI">Polytechnic / ITI</option>
                      <option value="Degree College">Degree College</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Website URL</label>
                    <input
                      type="url"
                      value={acadWebsite}
                      onChange={(e) => setAcadWebsite(e.target.value)}
                      placeholder="https://university.edu"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Official Domain</label>
                    <input
                      type="text"
                      value={acadDomain}
                      onChange={(e) => setAcadDomain(e.target.value)}
                      placeholder="e.g. iitd.ac.in"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Identifier (AISHE / NIRF)</label>
                    <input
                      type="text"
                      value={acadIdentifier}
                      onChange={(e) => setAcadIdentifier(e.target.value)}
                      placeholder="e.g. U-0123"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Designation</label>
                  <input
                    type="text"
                    value={acadDesignation}
                    onChange={(e) => setAcadDesignation(e.target.value)}
                    placeholder="e.g. Dean of Academics"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 mt-2"
                >
                  {loading ? 'Submitting Registration...' : 'Register Academic Institution'}
                </button>
              </form>
            )}

            <div className="text-center pt-2 text-slate-500 border-t border-slate-100">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="text-indigo-600 font-bold hover:underline"
              >
                Sign In here
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

