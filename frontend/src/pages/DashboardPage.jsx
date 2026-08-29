import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import {
  FolderGit2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Building2,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  MapPin,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const DashboardPage = ({ onSelectProject, onNavigate }) => {
  const [summary, setSummary] = useState(null);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [sumData, bnData, distData, projData, alertData] = await Promise.all([
        api.getDashboardSummary(),
        api.getStageBottlenecks(),
        api.getDistrictAnalytics(),
        api.getProjects(),
        api.getAlerts('ACTIVE')
      ]);
      setSummary(sumData);
      setBottlenecks(bnData);
      setDistricts(distData);
      setProjects(projData);
      setAlerts(alertData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-600">Aggregating National Land Acquisition Analytics...</p>
        </div>
      </div>
    );
  }

  // Risk Distribution Data for Pie Chart
  const riskPieData = [
    { name: 'Low Risk (<40%)', value: summary?.low_risk_count || 0, color: '#10b981' },
    { name: 'Medium Risk (40-69%)', value: summary?.medium_risk_count || 0, color: '#f59e0b' },
    { name: 'High Risk (70-84%)', value: summary?.high_risk_count || 0, color: '#f97316' },
    { name: 'Critical Risk (≥85%)', value: summary?.critical_risk_count || 0, color: '#ef4444' }
  ];

  // High Risk Projects subset
  const highRiskProjects = projects
    .filter(p => p.latest_prediction?.risk_level === 'HIGH' || p.latest_prediction?.risk_level === 'CRITICAL')
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-10">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gov-dark via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Real-Time Predictive Early-Warning Feed
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Land Acquisition Delay Analytics & Monitoring Console
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Decision-support analytics powered by calibrated machine learning models to detect stage bottlenecks, predict timeline slippage, and recommend targeted administrative interventions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Analytics
            </button>
            <button
              onClick={() => onNavigate('map')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
              Geospatial Risk Map
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Card 1: Total Projects */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Projects</span>
            <FolderGit2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{summary?.total_projects}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across 8 Indian States</div>
        </div>

        {/* Card 2: Critical & High Risk */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm hover:shadow-md transition-all ring-1 ring-rose-300">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Elevated Risk</span>
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            {(summary?.high_risk_count || 0) + (summary?.critical_risk_count || 0)}
          </div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">
            {summary?.critical_risk_count} Critical • {summary?.high_risk_count} High
          </div>
        </div>

        {/* Card 3: Avg Delay Probability */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Delay Risk</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {Math.round((summary?.avg_delay_probability || 0) * 100)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Calibrated ML Output</div>
        </div>

        {/* Card 4: Avg Estimated Delay */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Delay Days</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            +{summary?.avg_estimated_delay_days}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Estimated Days Slippage</div>
        </div>

        {/* Card 5: Active Alerts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{summary?.active_alerts_count}</div>
          <div className="text-[11px] text-slate-500 mt-1">Requiring Officer Action</div>
        </div>

        {/* Card 6: Total Land Monitored */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Land Area</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {summary?.total_land_area_ha} <span className="text-xs font-normal text-slate-500">Ha</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">₹{summary?.total_compensation_cr} Cr Compensation</div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Stage Bottleneck Analysis */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                LARR 2013 Statutory Stage Duration vs Benchmark
              </h3>
              <p className="text-xs text-slate-500">
                Average actual days spent in each acquisition stage vs statutory timelines
              </p>
            </div>
            <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-full border border-amber-200">
              Bottleneck Detection
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottlenecks} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="stage_name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs">
                          <p className="font-bold">{d.stage_name}</p>
                          <p className="text-amber-400 mt-1">Average Duration: {d.avg_days} days</p>
                          <p className="text-slate-400">Benchmark: {d.benchmark_days} days</p>
                          {d.delay_exceeded_days > 0 && (
                            <p className="text-rose-400 font-semibold mt-1">
                              ⚠️ Exceeds Benchmark by +{d.delay_exceeded_days} days
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                <Bar dataKey="avg_days" name="Average Actual Days" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="benchmark_days" name="Statutory LARR Benchmark" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Category Distribution Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              National Project Risk Classification
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown by calibrated delay probability bands
            </p>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900">{summary?.total_projects}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Projects</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {riskPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value} Projects</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Two-Column Lower Grid: High-Risk Projects & Early Warning Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* High Risk Projects Requiring Attention */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Critical & High-Risk Projects
              </h3>
              <p className="text-xs text-slate-500">
                Identified by early-warning system for immediate administrative intervention
              </p>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {highRiskProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {p.project_code}
                    </span>
                    <RiskBadge level={p.latest_prediction?.risk_level} probability={p.latest_prediction?.probability} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                    {p.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {p.district}, {p.state} • {p.current_stage}
                  </p>
                </div>

                <button className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white hover:bg-blue-600 rounded-lg shrink-0 transition-colors">
                  Inspect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Early-Warning Alerts Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Live Early-Warning Alerts
              </h3>
              <p className="text-xs text-slate-500">
                Automated threshold breach and bottleneck notifications
              </p>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View Hub <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase bg-rose-600 text-white px-2 py-0.5 rounded">
                      {a.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {a.project_code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {a.message}
                  </p>
                </div>

                <button
                  onClick={() => onSelectProject(a.project_id)}
                  className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-white border border-slate-200 hover:bg-blue-50 rounded-lg shrink-0 shadow-sm"
                >
                  Action
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
