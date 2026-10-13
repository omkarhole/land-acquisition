import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, Eye, EyeOff, Shield, BarChart3, Users, Settings, FileSearch } from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('officer@sih.gov.in');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const demoAccounts = [
    { role: 'Project Officer', email: 'officer@sih.gov.in', desc: 'Pune Land Acquisition Office', icon: FileSearch, color: 'from-blue-500 to-cyan-400' },
    { role: 'District Collector', email: 'district@sih.gov.in', desc: 'Varanasi District Collectorate', icon: Building2, color: 'from-violet-500 to-purple-400' },
    { role: 'Ministry Secretary', email: 'director@sih.gov.in', desc: 'Ministry of Rural Development', icon: Shield, color: 'from-amber-500 to-orange-400' },
    { role: 'Administrator', email: 'admin@sih.gov.in', desc: 'Full System Control & Settings', icon: Settings, color: 'from-emerald-500 to-teal-400' },
    { role: 'ML & Policy Analyst', email: 'analyst@sih.gov.in', desc: 'NITI Aayog Infrastructure Cell', icon: BarChart3, color: 'from-rose-500 to-pink-400' },
  ];

  const features = [
    { text: 'XGBoost Delay Risk Classifier', detail: '34-feature predictive model' },
    { text: 'SHAP Explainable AI Attribution', detail: 'Transparent risk factor analysis' },
    { text: 'What-If Scenario Simulation', detail: 'Policy impact forecasting' },
    { text: 'Real-time Alert Monitoring', detail: 'Proactive delay prevention' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (accEmail) => {
    setActiveRole(accEmail);
    setEmail(accEmail);
    setPassword('password123');
    setLoading(true);
    setError('');
    try {
      await login(accEmail, 'password123');
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Quick login failed');
      setActiveRole(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060c1f] selection:bg-blue-600 selection:text-white">

      {/* Animated background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/[0.08] blur-[100px] animate-pulse" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-indigo-500/[0.08] blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-violet-600/[0.04] blur-[120px]" />

      {/* Floating geometric accent lines */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="30%" x2="35%" y2="0" stroke="url(#grad1)" strokeWidth="1" />
        <line x1="65%" y1="100%" x2="100%" y2="60%" stroke="url(#grad1)" strokeWidth="1" />
        <line x1="20%" y1="100%" x2="50%" y2="70%" stroke="url(#grad2)" strokeWidth="0.5" />
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main content */}
      <div className={`relative z-10 flex min-h-screen items-center justify-center px-4 py-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="w-full max-w-6xl">

          {/* Top brand bar */}
          <div className={`mb-8 flex items-center justify-between transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="block text-lg font-bold text-white tracking-tight">BhoomiGuard</span>
                <span className="text-[10px] font-medium text-blue-400/80 tracking-wide uppercase">Smart India Hackathon 2026</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <span className="text-[11px] font-medium text-slate-400">System Online</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

            {/* Left column — Hero + Features */}
            <div className={`lg:col-span-5 flex flex-col justify-center transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>

              <div className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1">
                <Sparkles className="h-3 w-3 text-blue-400" />
                <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider">AI-Powered Platform</span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
                Predictive Analytics for{' '}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Land Acquisition
                </span>{' '}
                Delays
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-400">
                Decision-support platform for the <span className="font-semibold text-slate-300">Ministry of Rural Development</span> — transforming reactive delay handling into proactive, explainable risk mitigation using machine learning.
              </p>

              {/* Feature cards */}
              <div className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 backdrop-blur-sm transition-all hover:border-blue-500/20 hover:bg-blue-500/[0.04]"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{f.text}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{f.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="mt-8 flex items-center gap-6 border-t border-white/[0.06] pt-6">
                <div>
                  <div className="text-2xl font-bold text-white">34</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Risk Features</div>
                </div>
                <div className="h-8 w-px bg-white/[0.08]" />
                <div>
                  <div className="text-2xl font-bold text-white">96%</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Model Accuracy</div>
                </div>
                <div className="h-8 w-px bg-white/[0.08]" />
                <div>
                  <div className="text-2xl font-bold text-white">5</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Risk Categories</div>
                </div>
              </div>
            </div>

            {/* Right column — Login card */}
            <div className={`lg:col-span-7 lg:pl-8 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">

                {/* Card header */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white">Welcome back</h2>
                  <p className="mt-1 text-sm text-slate-400">Sign in to your official portal account</p>
                </div>

                {error && (
                  <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-300 backdrop-blur-sm">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-rose-400" />
                    {error}
                  </div>
                )}

                {/* Login form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">Official Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 hover:border-white/[0.12] focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20"
                        placeholder="name@organization.gov.in"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-11 pr-11 text-sm text-white outline-none transition-all hover:border-white/[0.12] focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative mt-2 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-600/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
                  >
                    {loading && activeRole === null ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Authenticating...
                      </div>
                    ) : (
                      <>
                        Sign In to Portal
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Quick Access</span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>

                {/* Demo role grid */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {demoAccounts.map((acc) => {
                    const IconComp = acc.icon;
                    const isActive = activeRole === acc.email;
                    return (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => handleQuickLogin(acc.email)}
                        disabled={loading}
                        className={`group relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed ${
                          isActive
                            ? 'border-blue-500/40 bg-blue-500/10'
                            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${acc.color} shadow-lg transition-transform group-hover:scale-110`}>
                          {isActive ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          ) : (
                            <IconComp className="h-4.5 w-4.5 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">{acc.role}</div>
                          <div className="mt-0.5 text-[10px] text-slate-500 leading-tight">{acc.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Bottom disclaimer */}
              <div className="mt-4 text-center text-[10px] text-slate-600">
                Ministry of Rural Development • Government of India • SIH26017
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
