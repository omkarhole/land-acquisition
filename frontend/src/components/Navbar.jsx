import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, ChevronDown, Building2, Bell, Menu } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, alertCount = 0, onMenuToggle }) => {
  const { user, switchRole, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roles = [
    { label: 'Administrator', email: 'admin@sih.gov.in', role: 'admin', badge: 'Admin' },
    { label: 'Project Officer (LAO)', email: 'officer@sih.gov.in', role: 'officer', badge: 'Officer' },
    { label: 'District Collector (DM)', email: 'district@sih.gov.in', role: 'district', badge: 'District' },
    { label: 'Ministry Secretary', email: 'director@sih.gov.in', role: 'director', badge: 'MoRD' },
    { label: 'ML & Policy Analyst', email: 'analyst@sih.gov.in', role: 'analyst', badge: 'Analyst' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={onMenuToggle}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-gov-blue to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  BhoomiGuard
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AI Early-Warning
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">

            {/* Quick Alerts Button */}
            <button
              onClick={() => setActiveTab('alerts')}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="View Early Warning Alerts"
            >
              <Bell className="w-5 h-5" />
              {alertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {alertCount}
                </span>
              )}
            </button>

            {/* Live Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-bold text-slate-900 leading-none">
                    {user?.name || 'Authorized Official'}
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    {user?.designation || user?.role || 'Guest'}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fast Role Switcher</p>
                    <p className="text-[11px] text-slate-500">Test different user perspectives in SIH demo</p>
                  </div>

                  <div className="py-1">
                    {roles.map((r) => (
                      <button
                        key={r.email}
                        onClick={async () => {
                          await switchRole(r.email);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-blue-50 transition-colors ${
                          user?.email === r.email ? 'bg-blue-50/80 font-bold text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.label}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {r.badge}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
