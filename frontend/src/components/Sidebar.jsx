import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  MapPin,
  FolderGit2,
  AlertTriangle,
  CheckSquare,
  FileText,
  BrainCircuit,
  Compass,
  X
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, alertCount = 0, isOpen = false, onClose = () => {} }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Geospatial Risk Map', icon: MapPin },
    { id: 'projects', label: 'Projects Registry', icon: FolderGit2 },
    { id: 'alerts', label: 'Early-Warning Alerts', icon: AlertTriangle, badge: alertCount },
    { id: 'interventions', label: 'Interventions & Action Plan', icon: CheckSquare },
    { id: 'reports', label: 'Executive Reports', icon: FileText },
    { id: 'governance', label: 'ML Model & Governance', icon: BrainCircuit },
  ];

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 top-16 z-30 bg-slate-950/50 backdrop-blur-sm md:hidden"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 top-16 z-40 flex w-72 flex-col justify-between border-r border-slate-800 bg-slate-900 p-4 text-slate-300 shadow-2xl transition-transform duration-300 md:sticky md:top-16 md:z-20 md:h-[calc(100vh-4rem)] md:min-h-0 md:w-64 md:self-start md:overflow-y-auto md:translate-x-0 md:shadow-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
      <div>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            Navigation
          </div>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="space-y-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
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
    </>
  );
};
