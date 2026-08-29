import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  CheckSquare,
  TrendingDown,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Calendar
} from 'lucide-react';

export const InterventionsPage = ({ onSelectProject }) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchActions = async () => {
    setLoading(true);
    try {
      const data = await api.getActions();
      setActions(data);
    } catch (err) {
      console.error('Failed to load actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleComplete = async (actionId) => {
    try {
      await api.updateAction(actionId, {
        status: 'COMPLETED',
        outcome: 'Administrative intervention completed; title clearance bottleneck settled.'
      });
      fetchActions();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const filtered = statusFilter
    ? actions.filter(a => a.status === statusFilter)
    : actions;

  const completedCount = actions.filter(a => a.status === 'COMPLETED').length;
  const openCount = actions.filter(a => a.status !== 'COMPLETED').length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              Corrective Action & Intervention Lifecycle Hub
            </h1>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {actions.length} Plans Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end policy execution loop: Predict → Explain → Alert → Act → Measure Impact
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          {['', 'OPEN', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === '' ? 'All Actions' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Interventions</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{actions.length}</div>
          <span className="text-[11px] text-slate-500">Across all land acquisition divisions</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Pending / In Progress</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{openCount}</div>
          <span className="text-[11px] text-amber-700">Awaiting field clearance</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Successfully Closed</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{completedCount}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">With demonstrated delay risk reduction</span>
        </div>
      </div>

      {/* Interventions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-slate-500">Loading interventions...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-bold">No interventions found in this view.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Action Type & Title</th>
                  <th className="px-4 py-3.5">Assigned Officer</th>
                  <th className="px-4 py-3.5">Target Due Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Risk Impact Delta</th>
                  <th className="px-4 py-3.5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((act) => {
                  const isDone = act.status === 'COMPLETED';
                  return (
                    <tr key={act.id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-4 max-w-sm">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono">
                          {act.action_type}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs mt-1">{act.title}</h4>
                        {act.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{act.description}</p>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                          {act.assigned_to}
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {act.due_date}
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {act.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {act.initial_risk !== null && act.post_action_risk !== null ? (
                          <div className="font-mono text-xs font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block">
                            {Math.round(act.initial_risk * 100)}% → <span className="text-emerald-600">{Math.round(act.post_action_risk * 100)}%</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Pending Outcome</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectProject(act.project_id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                          >
                            Project 360°
                          </button>

                          {!isDone && (
                            <button
                              onClick={() => handleComplete(act.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                            >
                              Complete & Re-Score
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
