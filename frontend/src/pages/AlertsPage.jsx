import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Clock,
  ArrowRight,
  Filter,
  Check,
  Building2
} from 'lucide-react';

export const AlertsPage = ({ onSelectProject }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [severityFilter, setSeverityFilter] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts(statusFilter || undefined);
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter]);

  const handleAcknowledge = async (id) => {
    try {
      await api.acknowledgeAlert(id);
      fetchAlerts();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.resolveAlert(id);
      fetchAlerts();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    return !severityFilter || a.severity === severityFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Early-Warning Alert Triage Center
            </h1>
            <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filteredAlerts.length} Alerts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated threshold triggers when delay risk exceeds 70% or stage milestones are bottlenecked
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-slate-500">Loading alerts...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-bold text-slate-800">No {statusFilter.toLowerCase()} alerts found.</p>
            <p className="text-xs text-slate-400 mt-1">All monitored projects are within healthy operational thresholds.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            return (
              <div
                key={alert.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCritical
                    ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
                    : 'border-amber-200 bg-amber-50/20 hover:border-amber-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isCritical ? 'bg-rose-600 text-white animate-pulse' : 'bg-orange-500 text-white'
                    }`}>
                      {alert.severity} Risk Trigger
                    </span>
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {alert.project_code}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {alert.created_at?.slice(0, 19).replace('T', ' ')} UTC
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {alert.project_title}
                  </h3>

                  <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                    {alert.message}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => onSelectProject(alert.project_id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1"
                  >
                    Inspect Project <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-lg transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}

                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
