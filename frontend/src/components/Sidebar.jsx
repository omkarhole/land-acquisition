import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  FolderGit2,
  AlertTriangle,
  CheckSquare,
  FileText,
  BrainCircuit,
  Compass
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, alertCount = 0 }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Geospatial Risk Map', icon: MapPin },
    { id: 'projects', label: 'Projects Registry', icon: FolderGit2 },
    { id: 'alerts', label: 'Early-Warning Alerts', icon: AlertTriangle, badge: alertCount },
    { id: 'interventions', label: 'Interventions & Action Plan', icon: CheckSquare },
    { id: 'reports', label: 'Executive Reports', icon: FileText },
    { id: 'governance', label: 'ML Model & Governance', icon: BrainCircuit },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 border-r border-slate-800">
      <div>
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          Navigation
        </div>
        <nav className="space-y-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white text-blue-700' : 'bg-rose-500 text-white animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Decision Support Banner */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <p className="text-xs font-bold text-white">Decision Support System</p>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Predictive analytics to empower Land Acquisition Officers & District Magistrates with proactive mitigation.
        </p>
      </div>
    </aside>
  );
};
