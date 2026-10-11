import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Shield, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('officer@sih.gov.in');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { role: 'Project Officer (LAO)', email: 'officer@sih.gov.in', desc: 'Pune Land Acquisition Office', icon: '📋' },
    { role: 'District Collector (DM)', email: 'district@sih.gov.in', desc: 'Varanasi District Collectorate', icon: '🏛️' },
    { role: 'Ministry Joint Secretary', email: 'director@sih.gov.in', desc: 'Ministry of Rural Development', icon: '🇮🇳' },
    { role: 'System Administrator', email: 'admin@sih.gov.in', desc: 'Full System Control & Settings', icon: '🛡️' },
    { role: 'Policy & ML Analyst', email: 'analyst@sih.gov.in', desc: 'NITI Aayog Infrastructure Cell', icon: '📊' },
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
    setEmail(accEmail);
    setPassword('password123');
    setLoading(true);
    setError('');
    try {
      await login(accEmail, 'password123');
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#081225] p-4 selection:bg-blue-600 selection:text-white sm:p-8">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl shadow-black/30 md:grid-cols-[0.95fr_1.05fr]">
        
        {/* Left Side: Brand Banner */}
        <div className="flex flex-col justify-between bg-gradient-to-br from-[#162d5c] via-[#10234b] to-[#0b1429] p-8 text-white sm:p-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white block">
                  BhoomiGuard
                </span>
                <span className="text-[11px] text-blue-300 font-medium">
                  Smart India Hackathon 2026
                </span>
              </div>
            </div>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">
              <Sparkles className="h-3.5 w-3.5" />
              Predict · Explain · Act
            </div>
            <h2 className="text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">
              Predictive Analytics System for Early Detection of Land Acquisition Delays
            </h2>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              An intelligent decision-support platform designed for the <strong>Ministry of Rural Development</strong> to transform reactive delay handling into proactive, explainable risk mitigation.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Calibrated XGBoost Delay Risk Classifier</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>SHAP-based Directional Feature Attribution</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>What-If Scenario Intervention Simulation</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login & Demo Accounts */}
        <div className="flex flex-col justify-between bg-[#f8fafc] p-8 sm:p-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">Secure access</p>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">Official portal login</h3>
            <p className="text-xs text-slate-500 mt-0.5">Enter credentials or choose a pre-configured role below</p>

            {error && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-3 text-xs shadow-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-3 text-xs shadow-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-xs font-bold text-white shadow-lg shadow-slate-900/15 transition-all hover:bg-blue-700 hover:shadow-blue-700/20"
              >
                {loading ? 'Authenticating...' : 'Sign In to Decision Support System'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Demo Role Cards */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              1-Click Demo Evaluation Roles
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email)}
                  className="w-full p-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{acc.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">{acc.role}</div>
                      <div className="text-[10px] text-slate-400">{acc.desc}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Login →
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
