import React, { useState } from "react";
import {
  Landmark, ShieldCheck, LockKeyhole, Mail, ArrowRight,
  ChevronRight, Sparkles, LoaderCircle, Eye, EyeOff
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";
import ashokaStambh from "./assest/ashoka-stambh-gold.png";

export const LoginPage = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("officer@sih.gov.in");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
  const demoAccounts = [
    { role: "Project Officer (LAO)", email: "officer@sih.gov.in", desc: "Pune Land Acquisition Office", short: "LAO" },
    { role: "District Collector (DM)", email: "district@sih.gov.in", desc: "Varanasi District Collectorate", short: "DM" },
    { role: "Ministry Joint Secretary", email: "director@sih.gov.in", desc: "Ministry of Rural Development", short: "JS" },
    { role: "System Administrator", email: "admin@sih.gov.in", desc: "Full System Control & Settings", short: "SYS" },
    { role: "Policy & ML Analyst", email: "analyst@sih.gov.in", desc: "NITI Aayog Infrastructure Cell", short: "ML" },
  ];

  const authenticate = async (userEmail, userPassword = password) => {
    setLoading(true);
    setError("");
    try {
      await login(userEmail, userPassword);
      onLoginSuccess?.();
    } catch (err) {
      setError(err?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    return authenticate(email, password);
  };

  const handleQuickLogin = (accountEmail) => {
    setEmail(accountEmail);
    setPassword("password123");
    return authenticate(accountEmail, "password123");
  };

  return (
    <main className="bg-login">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow bg-glow-one" aria-hidden="true" />
      <div className="bg-glow bg-glow-two" aria-hidden="true" />
      <img src={ashokaStambh} alt="" className="ashoka-background" aria-hidden="true" />

      <div className="login-shell">
        <header className="site-header">
          <a className="brand" href="#" aria-label="BhoomiGuard home" onClick={(e) => e.preventDefault()}>
            <span className="brand-mark">
              <Landmark size={25} strokeWidth={1.6} />
            </span>
            <span className="brand-copy">
              <strong>BHOOMIGUARD</strong>
              <small>LAND GOVERNANCE INTELLIGENCE</small>
            </span>
          </a>
          <div className="header-status"><i /> Smart India Hackathon 2026</div>
        </header>

        <section className="login-layout">
          <div className="hero-panel">
            <div className="eyebrow"><ShieldCheck size={17} /> PUBLIC INFRASTRUCTURE INTELLIGENCE</div>
            <h1>BhoomiGaurd<br /></h1>
            <p className="hero-description">
              An intelligent decision-support system for identifying land acquisition risks early,
              understanding their causes, and enabling proactive intervention.
            </p>

          </div>

          <section className="login-card" aria-label="Official portal login">
            <div className="card-heading">
              <div className="lock-tile"><LockKeyhole size={27} /></div>
              <div>
                <span className="welcome-label">WELCOME BACK</span>
                <h2>Sign in to your portal</h2>
                <p>Access your land acquisition intelligence workspace.</p>
              </div>
            </div>

            {error && <div className="login-error" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <label htmlFor="bg-email">Official email</label>
              <div className="input-wrap">
                <Mail size={19} />
                <input id="bg-email" type="email" autoComplete="username" value={email}
                  onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <label htmlFor="bg-password">Password</label>
              <div className="input-wrap">
                <LockKeyhole size={19} />
                <input id="bg-password" type={showPassword ? "text" : "password"}
                  autoComplete="current-password" value={password}
                  onChange={(e) => setPassword(e.target.value)} required />
                <button className="password-toggle" type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button className="submit-button" type="submit" disabled={loading}>
                {loading ? <><LoaderCircle className="spin" size={19} /> Authenticating...</> :
                  <>Access workspace <ArrowRight size={22} /></>}
              </button>
            </form>

            <div className="divider-label"><span /> DEMO ACCESS <span /></div>
            <div className="demo-intro"><Sparkles size={17} /> Choose a role to continue</div>

            <div className="demo-list">
              {demoAccounts.map((account) => (
                <button key={account.email} type="button" className="demo-row"
                  disabled={loading} onClick={() => handleQuickLogin(account.email)}>
                  <span className="role-chip">{account.short}</span>
                  <span className="role-copy"><strong>{account.role}</strong><small>{account.desc}</small></span>
                  <ChevronRight className="row-arrow" size={19} />
                </button>
              ))}
            </div>

            <div className="secure-note secure-note-placeholder" aria-hidden="true" />
          </section>
        </section>

        <footer className="site-footer">
          <span>&copy; 2026 BhoomiGuard &middot; Smart India Hackathon</span>
          <span>BUILT FOR TRANSPARENT LAND GOVERNANCE</span>
        </footer>
      </div>
    </main>
  );
};

export default LoginPage;
