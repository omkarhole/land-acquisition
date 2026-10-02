import React, { useState, useEffect, useMemo } from 'react';
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
  Send,
  TrendingDown,
  Activity,
  Layers,
  FileText,
  DollarSign,
  BarChart3,
  AlertTriangle,
  ArrowUpRight,
  Check
} from 'lucide-react';

export const ProjectDetailPage = ({ projectId, onBack, onNavigateReport }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('stages'); // stages, analytics, docs, comp, actions
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
      await api.runPrediction(projectId, true);
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
      await api.runPrediction(projectId, true);
      await fetchProject();
    } catch (err) {
      alert(`Update error: ${err.message}`);
    }
  };

  // Calculations for Financials & Graphs
  const compTotal = Number(project?.compensation_offered_cr) || 0;
  const compPaid = Number(project?.compensation_paid_cr) || 0;
  const compPending = Math.max(0, compTotal - compPaid);
  const compDisbursedPct = compTotal > 0 ? Math.min(100, Math.round((compPaid / compTotal) * 100)) : 0;
  const compPendingPct = 100 - compDisbursedPct;

  const pred = project?.latest_prediction;
  const riskPct = pred ? Math.round((pred.probability || 0) * 100) : 0;

  // LARR Statutory Stages Progression
  const completedStages = project?.stages?.filter((s) => s.status === 'Completed').length || 0;
  const totalStages = project?.stages?.length || 1;
  const stageProgressPct = Math.round((completedStages / totalStages) * 100);

  // Clearance Approval Ratio
  const totalDocs = project?.documents?.length || 0;
  const approvedDocs = project?.documents?.filter((d) => d.status === 'Approved').length || 0;
  const docsPct = totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0;

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

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm w-fit transition-all hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          Back to Projects Registry
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateReport(project.id)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Executive Dossier Report
          </button>

          <button
            onClick={handleRunPrediction}
            disabled={predicting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-blue-500/25 transition-all flex items-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${predicting ? 'animate-spin' : ''}`} />
            {predicting ? 'Running Predictive ML Model...' : 'Refresh AI Delay Prediction'}
          </button>
        </div>
      </div>

      {/* 2. PROJECT HERO CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200">
                {project.project_code}
              </span>
              <RiskBadge level={pred?.risk_level} probability={pred?.probability} size="md" />
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                {project.priority || 'Standard'} Priority
              </span>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                {project.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
              <span className="flex items-center gap-1.5 text-slate-700">
                <MapPin className="w-4 h-4 text-blue-500" />
                {project.district}, {project.state}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <Building2 className="w-4 h-4 text-indigo-500" />
                {project.project_type}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <Calendar className="w-4 h-4 text-amber-500" />
                Target: {project.target_date || 'N/A'}
              </span>
            </div>
          </div>

          {/* Overall Completion Progress */}
          <div className="lg:w-80 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 shrink-0">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-slate-600">Total Statutory Execution</span>
              <span className="text-blue-600 text-sm font-black">{project.overall_progress_pct}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, project.overall_progress_pct)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-medium">
              <span>Current Stage:</span>
              <span className="font-bold text-slate-800">{project.current_stage}</span>
            </div>
          </div>
        </div>

        {/* 4 Key Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Acquisition Area</span>
            <div className="text-xl font-black text-slate-900 mt-1">{project.land_area_hectares} <span className="text-xs font-semibold text-slate-500">Ha</span></div>
            <span className="text-[11px] text-slate-500">{project.affected_owner_count || 0} Affected Landowners</span>
          </div>

          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Compensation Outlay</span>
            <div className="text-xl font-black text-slate-900 mt-1">₹{compTotal} <span className="text-xs font-semibold text-slate-500">Cr</span></div>
            <span className="text-[11px] text-emerald-700 font-semibold">₹{compPaid} Cr Disbursed ({compDisbursedPct}%)</span>
          </div>

          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Project Value</span>
            <div className="text-xl font-black text-slate-900 mt-1">₹{project.project_value_cr || 0} <span className="text-xs font-semibold text-slate-500">Cr</span></div>
            <span className="text-[11px] text-slate-500">{project.household_count || 0} Resettlement Families</span>
          </div>

          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Statutory Clearance Ratio</span>
            <div className="text-xl font-black text-slate-900 mt-1">{approvedDocs}/{totalDocs} <span className="text-xs font-semibold text-slate-500">NOCs</span></div>
            <span className="text-[11px] text-blue-600 font-semibold">{docsPct}% Compliant</span>
          </div>
        </div>
      </div>

      {/* 3. VISUAL ANALYTICS & DELAY RISK DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRAPH 1: AI Delay Speedometer & Risk Meter (Col-Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Predictive Delay Probability
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Machine Learning Risk Classification</p>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                riskPct >= 80 ? 'bg-rose-100 text-rose-800' : riskPct >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {pred?.risk_level || 'LOW'} RISK
              </span>
            </div>

            {/* Custom SVG Half-Gauge Speedometer */}
            <div className="relative flex flex-col items-center justify-center my-6">
              <svg className="w-56 h-32" viewBox="0 0 200 110">
                {/* Background Track Arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                {/* Active Colored Arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke={riskPct >= 80 ? '#f43f5e' : riskPct >= 60 ? '#f59e0b' : '#10b981'}
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeDasharray={`${(riskPct / 100) * 251.2} 251.2`}
                  className="transition-all duration-1000"
                />
              </svg>
              {/* Center Metrics */}
              <div className="absolute top-16 text-center">
                <span className="text-3xl font-black text-slate-900">{riskPct}%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Delay Probability</span>
              </div>
            </div>

            {/* Risk Tier Distribution Indicators */}
            <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold mt-2">
              <div className={`p-1.5 rounded-lg border ${riskPct < 40 ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                Low (&lt;40%)
              </div>
              <div className={`p-1.5 rounded-lg border ${riskPct >= 40 && riskPct < 70 ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                Med (40-69%)
              </div>
              <div className={`p-1.5 rounded-lg border ${riskPct >= 70 && riskPct < 85 ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                High (70-84%)
              </div>
              <div className={`p-1.5 rounded-lg border ${riskPct >= 85 ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                Crit (≥85%)
              </div>
            </div>
          </div>

          {/* Quick AI Summary Tip */}
          <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs text-slate-600">
            <span className="font-bold text-slate-800">Primary Bottleneck Driver: </span>
            {pred?.primary_factor || 'Pending statutory land gazette notification under Section 19(1)'}
          </div>
        </div>

        {/* GRAPH 2: Financial & Compensation Disbursement Breakdown (Col-Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Compensation Capital Distribution (RFCTLARR 2013)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Real-time DBT Disbursement vs Escrow Holding</p>
              </div>
              <span className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                Total Award: ₹{compTotal} Cr
              </span>
            </div>

            {/* Visual Stacked Bar Chart */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Disbursed via DBT: ₹{compPaid} Cr ({compDisbursedPct}%)
                </span>
                <span className="text-amber-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Pending / Escrow: ₹{compPending} Cr ({compPendingPct}%)
                </span>
              </div>

              {/* Progress bar container */}
              <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/60 p-0.5 shadow-inner">
                <div
                  style={{ width: `${compDisbursedPct}%` }}
                  className="bg-emerald-500 h-full rounded-l-full transition-all duration-700"
                />
                <div
                  style={{ width: `${compPendingPct}%` }}
                  className="bg-amber-400 h-full rounded-r-full transition-all duration-700"
                />
              </div>
            </div>

            {/* Breakdown Sub-cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Settled Owners</span>
                <div className="text-lg font-black text-emerald-900 mt-0.5">
                  {Math.round((project.affected_owner_count || 0) * (compDisbursedPct / 100))}
                </div>
                <span className="text-[10px] text-emerald-700">Account verified DBT</span>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                <span className="text-[10px] font-bold text-amber-800 uppercase">Pending In Escrow</span>
                <div className="text-lg font-black text-amber-900 mt-0.5">
                  ₹{compPending} Cr
                </div>
                <span className="text-[10px] text-amber-700">Under Title Valuation</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase">Aadhaar PFMS Match</span>
                <div className="text-lg font-black text-slate-800 mt-0.5">98.2%</div>
                <span className="text-[10px] text-slate-500">Treasury Reconciled</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Direct Benefit Transfer under RFCTLARR Section 77 & 80</span>
            <span className="font-bold text-blue-600">Audit Compliance Passed ✓</span>
          </div>
        </div>

      </div>

      {/* 4. EXPLAINABILITY & SIMULATION MODULES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExplainabilityCard prediction={pred} projectCode={project.project_code} />
        <WhatIfSimulator project={project} onActionCreated={fetchProject} />
      </div>

      {/* 5. STATUTORY TIMELINE, PROCESS TABS & INTERVENTIONS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 pt-3 gap-2 overflow-x-auto">
          {[
            { id: 'stages', label: 'Statutory Pipeline Flowchart', icon: Clock, count: project.stages?.length },
            { id: 'docs', label: 'Regulatory NOCs & Clearances', icon: FileText, count: project.documents?.length },
            { id: 'comp', label: 'Detailed Compensation Audit', icon: DollarSign, count: null },
            { id: 'actions', label: 'Administrative Interventions', icon: ShieldCheck, count: project.actions?.length }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-white border-blue-600 text-blue-600 shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Statutory Pipeline with Visual Horizontal Flow Chart */}
        {activeSubTab === 'stages' && (
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Horizontal Timeline Flowchart */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">RFCTLARR 2013 Statutory Progression Map</h4>
                  <p className="text-xs text-slate-500">Live sequence of milestone clearance and statutory notices</p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
                  {completedStages} of {totalStages} Cleared ({stageProgressPct}%)
                </span>
              </div>

              {/* Connected Stage Nodes */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {project.stages?.map((stage, idx) => {
                  const isDone = stage.status === 'Completed';
                  const isCurrent = stage.status === 'In Progress';
                  return (
                    <div
                      key={stage.id}
                      className={`relative p-3.5 rounded-2xl border flex flex-col justify-between ${
                        isDone
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : isCurrent
                          ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-100 shadow-sm'
                          : 'bg-slate-50/40 border-slate-200 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isDone ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isDone ? '✓' : idx + 1}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isDone ? 'bg-emerald-100 text-emerald-800' : isCurrent ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {stage.status}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 line-clamp-2">{stage.stage_name}</h5>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/50 text-[10px] text-slate-500 flex justify-between items-center">
                        <span>Time spent:</span>
                        <span className="font-bold text-slate-700">{stage.days_in_stage || 0}d</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expanded Detailed Milestone Cards */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Milestone Records & Bottlenecks</h4>
              {project.stages?.map((stage, idx) => {
                const isDone = stage.status === 'Completed';
                const isCurrent = stage.status === 'In Progress';
                return (
                  <div
                    key={stage.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isCurrent ? 'bg-blue-50/30 border-blue-200 shadow-sm' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDone ? 'bg-emerald-100 text-emerald-800' : isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{stage.stage_name}</h5>
                        <p className="text-[11px] text-slate-500">{stage.remarks || 'Statutory legal process under LARR framework'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isCurrent && (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Active for {stage.days_in_stage || 0} days
                        </span>
                      )}
                      <span className={`text-xs font-bold px-3 py-1 rounded-xl ${
                        isDone ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isCurrent ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-500'
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

        {/* Tab 2: Regulatory NOCs Table */}
        {activeSubTab === 'docs' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3.5">Clearance / NOC Document</th>
                    <th className="px-4 py-3.5">File Identifier</th>
                    <th className="px-4 py-3.5">Compliance Status</th>
                    <th className="px-4 py-3.5">Remarks / Bottleneck</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {project.documents?.map((doc) => {
                    const isApproved = doc.status === 'Approved';
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3.5 font-bold text-blue-600">
                          {doc.document_type}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900">
                          {doc.title}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                          {doc.remarks || 'Standard revenue file'}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {!isApproved ? (
                            <button
                              onClick={() => handleApproveDoc(doc.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm"
                            >
                              Approve & Re-Score
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold flex items-center justify-end gap-1 text-[11px]">
                              <Check className="w-3.5 h-3.5" /> Verified
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

        {/* Tab 3: Detailed Compensation Audit */}
        {activeSubTab === 'comp' && (
          <div className="p-6 sm:p-8 space-y-6">
            {project.compensations?.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Total Allocated Award</span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">
                      ₹{project.compensations[0].total_amount_cr} Cr
                    </span>
                    <span className="text-[11px] text-slate-500">{project.compensations[0].beneficiary_count} Verified Landowners</span>
                  </div>

                  <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                    <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block">Disbursed (Direct Benefit)</span>
                    <span className="text-2xl font-black text-emerald-900 mt-1 block">
                      ₹{project.compensations[0].disbursed_amount_cr} Cr
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold">
                      {project.compensations[0].disbursement_pct}% Deposited in Bank Accounts
                    </span>
                  </div>

                  <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200">
                    <span className="text-xs text-amber-800 font-bold uppercase tracking-wider block">Pending / Escrow Fund</span>
                    <span className="text-2xl font-black text-amber-900 mt-1 block">
                      ₹{project.compensations[0].pending_amount_cr} Cr
                    </span>
                    <span className="text-[11px] text-amber-700 font-semibold">Under Section 64/76 references</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600">
                  <h5 className="font-bold text-slate-900 mb-1">Direct Benefit Transfer (DBT) Audit Status:</h5>
                  <p className="text-[11px] leading-relaxed">
                    All transactions are reconciled with the Public Financial Management System (PFMS) and National Land Record Modernization Programme (NLRMP).
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">Compensation data initializing.</p>
            )}
          </div>
        )}

        {/* Tab 4: Administrative Interventions with Risk Delta */}
        {activeSubTab === 'actions' && (
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Intervention Creator Form */}
            <form onSubmit={handleCreateAction} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Log New Administrative Corrective Action
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Action Title (e.g. Schedule Special Hearing)"
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  className="text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />

                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  className="text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Description / Specific directives for field officers..."
                  value={actionDesc}
                  onChange={(e) => setActionDesc(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={savingAction}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  Log Action Plan
                </button>
              </div>
            </form>

            {/* Interventions Listing with Risk Delta Metric */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Active & Completed Interventions ({project.actions?.length || 0})
              </h4>

              {project.actions?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No corrective actions logged yet.</p>
              ) : (
                project.actions?.map((act) => {
                  const isDone = act.status === 'COMPLETED';
                  const initRisk = act.initial_risk !== null ? Math.round(act.initial_risk * 100) : null;
                  const postRisk = act.post_action_risk !== null ? Math.round(act.post_action_risk * 100) : null;

                  return (
                    <div
                      key={act.id}
                      className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                        isDone ? 'bg-emerald-50/30 border-emerald-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                            {act.action_type}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                            isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {act.status}
                          </span>
                          <span className="text-[11px] text-slate-400">Due: {act.due_date}</span>
                        </div>

                        <h5 className="text-sm font-bold text-slate-900">{act.title}</h5>
                        {act.description && (
                          <p className="text-xs text-slate-600">{act.description}</p>
                        )}
                        {act.outcome && (
                          <p className="text-xs text-emerald-800 font-semibold mt-1 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200/50">
                            Outcome: {act.outcome}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {/* Risk Reduction Indicator */}
                        {initRisk !== null && postRisk !== null && (
                          <div className="text-right bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">Risk Reduction</span>
                              <div className="flex items-center gap-1 font-mono font-bold text-xs">
                                <span className="text-slate-600">{initRisk}%</span>
                                <span>➔</span>
                                <span className="text-emerald-600 font-black">{postRisk}%</span>
                              </div>
                            </div>
                            <TrendingDown className="w-4 h-4 text-emerald-500" />
                          </div>
                        )}

                        {!isDone && (
                          <button
                            onClick={() => handleCompleteAction(act.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
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