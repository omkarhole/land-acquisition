import React, { useState } from 'react';
import { Sliders, Play, RotateCcw, TrendingDown, TrendingUp, Sparkles, Check } from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from './RiskBadge';

export const WhatIfSimulator = ({ project, onActionCreated }) => {
  const compPaid = project?.compensation_paid_cr || 0;
  const compTotal = project?.compensation_offered_cr || 1;
  const initialCompRatio = Math.round((compPaid / Math.max(0.1, compTotal)) * 100);

  const [compRatio, setCompRatio] = useState(initialCompRatio);
  const [pendingDocs, setPendingDocs] = useState(
    project?.documents ? project.documents.filter(d => d.status !== 'Approved').length : 3
  );
  const [objections, setObjections] = useState(project?.objection_count || 0);
  const [courtStay, setCourtStay] = useState(project?.court_stay_flag || false);
  const [stageAge, setStageAge] = useState(30);

  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const result = await api.simulateScenario(project.id, {
        compensation_paid_ratio: compRatio / 100.0,
        pending_document_count: parseInt(pendingDocs),
        objection_count: parseInt(objections),
        court_stay_flag: Boolean(courtStay),
        stage_age_days: parseInt(stageAge)
      });
      setSimulationResult(result);
    } catch (err) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCompRatio(initialCompRatio);
    setPendingDocs(project?.documents ? project.documents.filter(d => d.status !== 'Approved').length : 3);
    setObjections(project?.objection_count || 0);
    setCourtStay(project?.court_stay_flag || false);
    setStageAge(30);
    setSimulationResult(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Interactive "What-If" Policy Simulator
            </h3>
            <p className="text-xs text-slate-500">
              Simulate the impact of administrative interventions on delay probability
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      {/* Simulator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Controls Column */}
        <div className="space-y-4">
          
          {/* Slider 1: Compensation Disbursement */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Target Compensation Disbursed:</span>
              <span className="font-bold text-blue-600">{compRatio}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={compRatio}
              onChange={(e) => setCompRatio(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0% (High Discontent)</span>
              <span>100% (Fully Settled)</span>
            </div>
          </div>

          {/* Slider 2: Pending Regulatory Documents */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Pending Documents / Approvals:</span>
              <span className="font-bold text-indigo-600">{pendingDocs} Files</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={pendingDocs}
              onChange={(e) => setPendingDocs(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 Files (All NOCs Cleared)</span>
              <span>10 Files (Heavy Backlog)</span>
            </div>
          </div>

          {/* Slider 3: Landowner Objections */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Unresolved Public Objections:</span>
              <span className="font-bold text-amber-600">{objections} Objections</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={objections}
              onChange={(e) => setObjections(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          {/* Toggle: Court Injunction */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-800">Judicial Stay / Court Injunction</p>
              <p className="text-[11px] text-slate-500">Legal challenge pending before High Court</p>
            </div>
            <button
              type="button"
              onClick={() => setCourtStay(!courtStay)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                courtStay ? 'bg-rose-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  courtStay ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Run Scenario Simulation
              </>
            )}
          </button>
        </div>

        {/* Results Column */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between">
          {!simulationResult ? (
            <div className="text-center my-auto py-8">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-bold text-slate-700">Ready to Simulate</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                Adjust the levers on the left and click "Run Scenario Simulation" to compute the predicted delta.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Simulation Outcome
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  simulationResult.risk_direction === 'reduced'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {simulationResult.risk_direction === 'reduced' ? (
                    <>
                      <TrendingDown className="w-3.5 h-3.5" />
                      Risk Reduced by {Math.abs(Math.round(simulationResult.probability_delta * 100))}%
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-3.5 h-3.5" />
                      Risk Increased by {Math.round(simulationResult.probability_delta * 100)}%
                    </>
                  )}
                </span>
              </div>

              {/* Comparison Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-semibold block">Baseline Risk</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {Math.round(simulationResult.original_probability * 100)}%
                  </div>
                  <div className="mt-1">
                    <RiskBadge level={simulationResult.original_risk_level} size="sm" showIcon={false} />
                  </div>
                </div>

                <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-200">
                  <span className="text-[11px] text-indigo-600 font-semibold block">Simulated Risk</span>
                  <div className="text-2xl font-extrabold text-indigo-900 mt-1">
                    {Math.round(simulationResult.simulated_probability * 100)}%
                  </div>
                  <div className="mt-1">
                    <RiskBadge level={simulationResult.simulated_risk_level} size="sm" showIcon={false} />
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Key Takeaway for Project Officer:
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Executing this intervention bundle (settling compensation to {compRatio}% & reducing unapproved documents) lowers delay probability from <span className="font-bold">{Math.round(simulationResult.original_probability * 100)}%</span> down to <span className="font-bold text-emerald-700">{Math.round(simulationResult.simulated_probability * 100)}%</span>.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
