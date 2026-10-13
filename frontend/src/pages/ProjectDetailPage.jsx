import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { ExplainabilityCard } from '../components/ExplainabilityCard';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  Building2,
  MapPin,
  IndianRupee,
  Users,
  Clock,
  CheckCircle2,
  FileCheck,
  AlertOctagon,
  Plus,
  Printer,
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';

export const ProjectDetailPage = ({ projectId, onBack, onNavigateReport }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('stages'); // stages, docs, comp, actions
  const [predicting, setPredicting] = useState(false);

  // Intervention form state
  const [actionTitle, setActionTitle] = useState('');
  const [actionType, setActionType] = useState('Special Redressal Camp');
  const [assignedTo, setAssignedTo] = useState('Land Acquisition Officer (LAO)');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [actionDesc, setActionDesc] = useState('');
  const [savingAction, setSavingAction] = useState(false);

  const fetchProject = async () => {
    try {
      const data = await api.getProjectDetail(projectId);
      setProject(data);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleRunPrediction = async () => {
    setPredicting(true);
    try {
      await api.runPrediction(projectId, true);
      await fetchProject();
    } catch (err) {
      alert(`Prediction failed: ${err.message}`);
    } finally {
      setPredicting(false);
    }
  };

  const handleApproveDoc = async (docId) => {
    try {
      await api.approveDocument(projectId, docId);
      await api.runPrediction(projectId, true); // Recalculate
      await fetchProject();
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleCreateAction = async (e) => {
    e.preventDefault();
    if (!actionTitle.trim()) return;
    setSavingAction(true);
    try {
      await api.createAction(projectId, {
        action_type: actionType,
        title: actionTitle,
        description: actionDesc,
        assigned_to: assignedTo,
        due_date: dueDate
      });
      setActionTitle('');
      setActionDesc('');
      await fetchProject();
    } catch (err) {
      alert(`Action error: ${err.message}`);
    } finally {
      setSavingAction(false);
    }
  };

  const handleCompleteAction = async (actionId) => {
    try {
      await api.updateAction(actionId, {
        status: 'COMPLETED',
        outcome: 'Administrative intervention completed successfully; bottleneck cleared.'
      });
      await api.runPrediction(projectId, true); // Recalculate post-action risk
      await fetchProject();
    } catch (err) {
      alert(`Update error: ${err.message}`);
    }
  };

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-600">Retrieving Project 360° Dossier...</p>
        </div>
      </div>
    );
  }

  const pred = project.latest_prediction;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm w-fit transition-all hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects Registry
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateReport(project.id)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Executive Dossier Report
          </button>

          <button
            onClick={handleRunPrediction}
            disabled={predicting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Sparkles className={`w-3.5 h-3.5 ${predicting ? 'animate-spin' : ''}`} />
            {predicting ? 'Evaluating ML Model...' : 'Run / Refresh AI Prediction'}
          </button>
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="font-mono font-bold text-sm bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100">
                {project.project_code}
              </span>
              <RiskBadge level={pred?.risk_level} probability={pred?.probability} size="md" />
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                {project.priority} Priority
              </span>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                {project.status}
              </span>
            </div>

            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {project.title}
            </h1>

            <p className="text-xs text-slate-500 flex items-center gap-2 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{project.district}, {project.state}</span>
              <span>•</span>
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{project.project_type}</span>
            </p>
          </div>

          {/* Quick Progress Bar */}
          <div className="lg:w-72 bg-slate-50 p-4 rounded-xl border border-slate-100 shrink-0">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Overall Progress</span>
              <span className="text-blue-600">{project.overall_progress_pct}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, project.overall_progress_pct)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              Current Stage: <span className="font-bold text-slate-800">{project.current_stage}</span>
            </p>
          </div>

        </div>

        {/* 4 Info Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Land Area</span>
            <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{project.land_area_hectares} Ha</span>
            <span className="text-[11px] text-slate-500">{project.affected_owner_count} Affected Owners</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Compensation</span>
            <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">₹{project.compensation_offered_cr} Cr</span>
            <span className="text-[11px] text-slate-500">₹{project.compensation_paid_cr} Cr Disbursed</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Project Budget</span>
            <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">₹{project.project_value_cr} Cr</span>
            <span className="text-[11px] text-slate-500">{project.household_count} Resettlement Families</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target Completion</span>
            <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{project.target_date}</span>
            <span className="text-[11px] text-slate-500">Started: {project.start_date}</span>
          </div>
        </div>

      </div>

      {/* Grid: Explainable AI Card + What-If Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExplainabilityCard prediction={pred} projectCode={project.project_code} />
        <WhatIfSimulator project={project} onActionCreated={fetchProject} />
      </div>

      {/* Main Process Tracking Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-50/60 px-4 pt-2 gap-2 overflow-x-auto">
          {[
            { id: 'stages', label: 'LARR 2013 Stages Timeline', count: project.stages?.length },
            { id: 'docs', label: 'Statutory Documents & NOCs', count: project.documents?.length },
            { id: 'comp', label: 'Compensation Disbursement', count: null },
            { id: 'actions', label: 'Corrective Action Plan', count: project.actions?.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-white border-blue-600 text-blue-600 shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeSubTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Stages Timeline */}
        {activeSubTab === 'stages' && (
          <div className="p-6">
            <div className="space-y-4">
              {project.stages?.map((stage, idx) => {
                const isDone = stage.status === 'Completed';
                const isCurrent = stage.status === 'In Progress';
                return (
                  <div
                    key={stage.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isCurrent
                        ? 'bg-blue-50/40 border-blue-300 ring-2 ring-blue-100'
                        : isDone
                        ? 'bg-slate-50/50 border-slate-200'
                        : 'bg-white border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isDone ? '✓' : idx + 1}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{stage.stage_name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{stage.remarks || 'Statutory stage step'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium">
                      {isCurrent && (
                        <div className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-[11px] font-bold">
                          ⏱️ {stage.days_in_stage} days spent in this stage
                        </div>
                      )}

                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCurrent
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {stage.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Regulatory Documents Dossier */}
        {activeSubTab === 'docs' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Document / Clearance Type</th>
                    <th className="px-4 py-3">Title / Description</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Remarks</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.documents?.map((doc) => {
                    const isApproved = doc.status === 'Approved';
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-mono font-bold text-blue-600 text-[11px]">
                          {doc.document_type}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {doc.title}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : doc.status === 'Under Review'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {doc.remarks || 'Standard revenue compliance file'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!isApproved ? (
                            <button
                              onClick={() => handleApproveDoc(doc.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-sm transition-all"
                            >
                              Approve & Re-Score
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold flex items-center justify-end gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Compensation Disbursement */}
        {activeSubTab === 'comp' && (
          <div className="p-6">
            {project.compensations?.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold block">Total Award Allocated</span>
                    <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                      ₹{project.compensations[0].total_amount_cr} Cr
                    </span>
                    <span className="text-[11px] text-slate-500">{project.compensations[0].beneficiary_count} Awardees</span>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-xs text-emerald-700 font-bold block">Total Disbursed (Direct Benefit)</span>
                    <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">
                      ₹{project.compensations[0].disbursed_amount_cr} Cr
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      {project.compensations[0].disbursement_pct}% Disbursed via PFMS/DBT
                    </span>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-xs text-amber-700 font-bold block">Pending Settlement</span>
                    <span className="text-2xl font-extrabold text-amber-900 mt-1 block">
                      ₹{project.compensations[0].pending_amount_cr} Cr
                    </span>
                    <span className="text-[11px] text-amber-700 font-semibold">Escrow / Under Joint Measurement</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <p className="font-bold text-slate-900 mb-1">Direct Benefit Transfer (DBT) Audit Status:</p>
                  <p className="text-[11px]">
                    All disbursement statements are reconciled with State Revenue Land Records and Treasury portals under RFCTLARR 2013 norms.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">Compensation module initializing.</p>
            )}
          </div>
        )}

        {/* Tab 4: Corrective Action Plan */}
        {activeSubTab === 'actions' && (
          <div className="p-6 space-y-6">
            
            {/* Action Log Form */}
            <form onSubmit={handleCreateAction} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Log New Administrative Corrective Action
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Action Title (e.g. Schedule Special Hearing)"
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  required
                />

                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Special Redressal Camp">Special Redressal Camp</option>
                  <option value="Expedited Valuation">Expedited Valuation</option>
                  <option value="Forest NOC Escalation">Forest NOC Escalation</option>
                  <option value="Utility Relocation Drive">Utility Relocation Drive</option>
                  <option value="Legal Stay Vacation Appeal">Legal Stay Vacation Appeal</option>
                </select>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  required
                />
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Description / Specific directives for field officers..."
                  value={actionDesc}
                  onChange={(e) => setActionDesc(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
                <button
                  type="submit"
                  disabled={savingAction}
                  className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  Log Action Plan
                </button>
              </div>
            </form>

            {/* Actions List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Active & Completed Interventions ({project.actions?.length || 0})
              </h4>

              {project.actions?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No corrective actions logged yet.</p>
              ) : (
                project.actions?.map((act) => {
                  const isDone = act.status === 'COMPLETED';
                  return (
                    <div
                      key={act.id}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                        isDone ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                            {act.action_type}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isDone ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {act.status}
                          </span>
                          <span className="text-[11px] text-slate-400">Due: {act.due_date}</span>
                        </div>

                        <h5 className="text-xs font-bold text-slate-900 mt-1">{act.title}</h5>
                        {act.description && (
                          <p className="text-[11px] text-slate-600 mt-0.5">{act.description}</p>
                        )}
                        {act.outcome && (
                          <p className="text-[11px] text-emerald-800 font-semibold mt-1 bg-white p-1.5 rounded border border-emerald-100">
                            Outcome: {act.outcome}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {act.initial_risk !== null && act.post_action_risk !== null && (
                          <div className="text-right text-xs bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-semibold">Risk Delta</span>
                            <span className="font-extrabold text-slate-800 font-mono">
                              {Math.round(act.initial_risk * 100)}% → <span className="text-emerald-600">{Math.round(act.post_action_risk * 100)}%</span>
                            </span>
                          </div>
                        )}

                        {!isDone && (
                          <button
                            onClick={() => handleCompleteAction(act.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                          >
                            Mark Completed & Re-Score
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
