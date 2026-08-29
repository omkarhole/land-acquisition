import React from 'react';
import { ArrowUpRight, ArrowDownRight, Lightbulb, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

export const ExplainabilityCard = ({ prediction, projectCode }) => {
  if (!prediction) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500">
        <Lightbulb className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-50" />
        <p className="text-sm font-medium">No active prediction recorded yet.</p>
        <p className="text-xs text-slate-400 mt-1">Click "Run AI Prediction" to evaluate project delay risk.</p>
      </div>
    );
  }

  const factors = prediction.top_factors || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold tracking-wide uppercase">
              Explainable AI Risk Attribution (XAI)
            </h3>
          </div>
          <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            Model: {prediction.model_version || 'XGBoost-v1.0'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-700/60 pt-4">
          <div>
            <span className="text-xs text-slate-400">Delay Probability</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {Math.round(prediction.probability * 100)}%
              </span>
              <RiskBadge level={prediction.risk_level} showIcon={false} size="sm" />
            </div>
          </div>

          {prediction.estimated_delay_days > 0 && (
            <div className="text-right">
              <span className="text-xs text-slate-400">Estimated Schedule Delay</span>
              <p className="text-xl font-bold text-amber-400">
                +{prediction.estimated_delay_days} Days
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Factors List */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Top Contributing Process Factors
          </h4>
          <span className="text-[11px] text-slate-400">Ranked by SHAP feature weight</span>
        </div>

        {factors.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">All process parameters are currently within normal baseline ranges.</p>
        ) : (
          <div className="space-y-3.5">
            {factors.map((factor, idx) => {
              const isUp = factor.direction === 'up';
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isUp
                      ? 'bg-rose-50/50 border-rose-100 hover:border-rose-200'
                      : 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isUp ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {factor.feature_label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {factor.value_display && (
                        <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                          {factor.value_display}
                        </span>
                      )}
                      <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${
                        isUp ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                      }`}>
                        {isUp ? (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                            ↑ Risk
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                            ↓ Mitigates
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {factor.impact_text && (
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed pl-7">
                      {factor.impact_text}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
