import React from 'react';
import {
  Activity,
  BarChart3,
  BellRing,
  BrainCircuit,
  CheckSquare,
  FileText,
  FolderKanban,
  Heart,
  LayoutDashboard,
  Map,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const Footer = ({ setActiveTab }) => {
  const navigationLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Risk Map', icon: Map },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'alerts', label: 'Alerts', icon: BellRing },
    { id: 'interventions', label: 'Interventions', icon: CheckSquare },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'governance', label: 'Governance', icon: BrainCircuit },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9">
        <div className="grid gap-8 md:grid-cols-[1.25fr_2fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-900/40">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-white">BhoomiGuard</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-blue-300">Land intelligence</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Predictive insights and proactive action for faster, more transparent land acquisition.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-400">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              Intelligence system online
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
              Navigate
            </div>
            <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Footer navigation">
              {navigationLinks.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-400 transition-all hover:bg-white/10 hover:pl-3 hover:text-white"
                >
                  <Icon className="h-4 w-4 text-slate-500 transition-colors group-hover:text-blue-300" />
                  <span>{label}</span>
                  <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-5 text-xs sm:flex-row">
          <span className="text-slate-500">(c) {new Date().getFullYear()} BhoomiGuard. All rights reserved.</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            Created with <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> by
            <strong className="text-white">Tam Paranox</strong>
          </span>
        </div>
      </div>
    </footer>
  );
};
