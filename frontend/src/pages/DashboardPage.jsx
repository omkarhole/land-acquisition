import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw,
  Filter,
  Layers,
  Globe2,
  PieChart as PieChartIcon,
  Flame,
  Briefcase
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
  Cell,
  CartesianGrid
} from 'recharts';

export const DashboardPage = ({ onSelectProject, onNavigate }) => {
  const [summary, setSummary] = useState(null);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State filter for the stacked risk chart
  const [selectedState, setSelectedState] = useState('ALL');

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

  // Extract unique states dynamically from projects
  const availableStates = useMemo(() => {
    const statesSet = new Set(projects.map((p) => p.state).filter(Boolean));
    return Array.from(statesSet).sort();
  }, [projects]);

  // Aggregate project risk distribution for Stacked Bar Chart
  const stateRiskStackedData = useMemo(() => {
    if (selectedState === 'ALL') {
      // Group all projects by State
      const stateMap = {};
      projects.forEach((p) => {
        const st = p.state || 'Other';
        if (!stateMap[st]) {
          stateMap[st] = {
            name: st,
            groupKey: st,
            low: 0,
            medium: 0,
            high: 0,
            critical: 0,
            total: 0,
            projectList: []
          };
        }
        const rLevel = (p.latest_prediction?.risk_level || 'LOW').toUpperCase();
        if (rLevel === 'CRITICAL') stateMap[st].critical += 1;
        else if (rLevel === 'HIGH') stateMap[st].high += 1;
        else if (rLevel === 'MEDIUM') stateMap[st].medium += 1;
        else stateMap[st].low += 1;

        stateMap[st].total += 1;
        stateMap[st].projectList.push(p);
      });
      return Object.values(stateMap).sort((a, b) => b.total - a.total);
    } else {
      // Group projects within the selected State by District
      const filtered = projects.filter((p) => p.state === selectedState);
      const distMap = {};
      filtered.forEach((p) => {
        const dist = p.district || 'Unassigned';
        if (!distMap[dist]) {
          distMap[dist] = {
            name: dist,
            groupKey: dist,
            state: selectedState,
            low: 0,
            medium: 0,
            high: 0,
            critical: 0,
            total: 0,
            projectList: []
          };
        }
        const rLevel = (p.latest_prediction?.risk_level || 'LOW').toUpperCase();
        if (rLevel === 'CRITICAL') distMap[dist].critical += 1;
        else if (rLevel === 'HIGH') distMap[dist].high += 1;
        else if (rLevel === 'MEDIUM') distMap[dist].medium += 1;
        else distMap[dist].low += 1;

        distMap[dist].total += 1;
        distMap[dist].projectList.push(p);
      });
      return Object.values(distMap).sort((a, b) => b.total - a.total);
    }
  }, [projects, selectedState]);

  // Summary counts for the selected state filter
  const filterSummary = useMemo(() => {
    const list = selectedState === 'ALL' ? projects : projects.filter((p) => p.state === selectedState);
    let low = 0, medium = 0, high = 0, critical = 0;
    list.forEach((p) => {
      const r = (p.latest_prediction?.risk_level || 'LOW').toUpperCase();
      if (r === 'CRITICAL') critical += 1;
      else if (r === 'HIGH') high += 1;
      else if (r === 'MEDIUM') medium += 1;
      else low += 1;
    });
    return { total: list.length, low, medium, high, critical };
  }, [projects, selectedState]);

  // 1. Sector-wise Project Distribution Data
  const sectorData = useMemo(() => {
    const sectorMap = {};
    const sectorShortNames = {
      'National Highway Corridor': 'Highways',
      'High-Speed Rail / DFC': 'Rail / DFC',
      'Industrial Smart City Corridor': 'Industrial',
      'Major Irrigation & Canal': 'Irrigation',
      'Renewable Energy Solar Park': 'Solar / Green',
      'Urban Metro Transit Extension': 'Metro Transit',
      'Rural Road Connectivity (PMGSY)': 'Rural Roads'
    };

    projects.forEach((p) => {
      const sType = p.project_type || 'Other';
      if (!sectorMap[sType]) {
        sectorMap[sType] = {
          sector: sType,
          shortName: sectorShortNames[sType] || sType.slice(0, 14),
          total: 0,
          totalValueCr: 0,
          totalAreaHa: 0,
          low: 0,
          medium: 0,
          high: 0,
          critical: 0
        };
      }
      sectorMap[sType].total += 1;
      sectorMap[sType].totalValueCr += (p.project_value_cr || 0);
      sectorMap[sType].totalAreaHa += (p.land_area_hectares || 0);

      const r = (p.latest_prediction?.risk_level || 'LOW').toUpperCase();
      if (r === 'CRITICAL') sectorMap[sType].critical += 1;
      else if (r === 'HIGH') sectorMap[sType].high += 1;
      else if (r === 'MEDIUM') sectorMap[sType].medium += 1;
      else sectorMap[sType].low += 1;
    });

    return Object.values(sectorMap)
      .map(item => ({
        ...item,
        totalValueCr: Math.round(item.totalValueCr * 10) / 10,
        totalAreaHa: Math.round(item.totalAreaHa * 10) / 10
      }))
      .sort((a, b) => b.total - a.total);
  }, [projects]);

  // 2. Categorical Most Common Delay Drivers Data
  const delayDriversData = useMemo(() => {
    const totalProjects = Math.max(1, projects.length);
    const drivers = [
      {
        driver: 'Court Stay / Litigation Active',
        shortName: 'Court Litigation / Stay',
        category: 'Legal & Judicial',
        color: '#ef4444',
        count: projects.filter(p => p.court_stay_flag || p.court_litigation_pending).length
      },
      {
        driver: 'Utility Relocation Pending',
        shortName: 'Utility Relocation Lag',
        category: 'Inter-Agency Clearance',
        color: '#f97316',
        count: projects.filter(p => p.utility_shift_pending).length
      },
      {
        driver: 'Forest Clearance NOC Awaited',
        shortName: 'Forest Clearance NOC',
        category: 'Environmental & MoEFCC',
        color: '#8b5cf6',
        count: projects.filter(p => p.forest_clearance_pending).length
      },
      {
        driver: 'Public Objections (Sec 15)',
        shortName: 'Public Objections Filed',
        category: 'SIA & Public Hearing',
        color: '#f59e0b',
        count: projects.filter(p => p.public_objections_filed || (p.objection_count > 0)).length
      },
      {
        driver: 'Ownership Title Disputes',
        shortName: 'Title & Heirship Disputes',
        category: 'Revenue & Land Records',
        color: '#ec4899',
        count: projects.filter(p => p.ownership_title_dispute || (p.ownership_conflict_count > 0)).length
      },
      {
        driver: 'Multi-Village Jurisdiction',
        shortName: 'Multi-Village Jurisdiction',
        category: 'Administrative Complexity',
        color: '#3b82f6',
        count: projects.filter(p => p.multi_village_jurisdiction).length
      },
      {
        driver: 'Railway Crossing NOC',
        shortName: 'Railway Crossing NOC',
        category: 'Inter-Departmental',
        color: '#06b6d4',
        count: projects.filter(p => p.railway_crossing_pending).length
      }
    ];

    return drivers
      .map(d => ({
        ...d,
        percentage: Math.round((d.count / totalProjects) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

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

  // Custom Stacked Bar Tooltip
  const CustomStackedTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0]?.payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
            <span className="font-extrabold text-sm text-white">
              {selectedState === 'ALL' ? `${label} (State)` : `${label}, ${selectedState}`}
            </span>
            <span className="font-mono bg-blue-900/60 text-blue-300 text-[11px] font-bold px-2 py-0.5 rounded">
              {item?.total || 0} Total
            </span>
          </div>

          <div className="space-y-1.5 font-medium">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical Risk (≥85%):
              </span>
              <span className="font-bold text-white">{item?.critical || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> High Risk (70-84%):
              </span>
              <span className="font-bold text-white">{item?.high || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium Risk (40-69%):
              </span>
              <span className="font-bold text-white">{item?.medium || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low Risk (&lt;40%):
              </span>
              <span className="font-bold text-white">{item?.low || 0}</span>
            </div>
          </div>

          {item?.projectList && item.projectList.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
              <p className="font-bold text-slate-300 mb-1">Key Projects:</p>
              <ul className="space-y-0.5">
                {item.projectList.slice(0, 3).map((pj) => (
                  <li key={pj.id} className="truncate">
                    • <span className="font-mono text-slate-200">{pj.project_code}</span>: {pj.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Sector Tooltip
  const CustomSectorTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 min-w-[210px] border border-slate-700">
          <p className="font-extrabold text-blue-300 text-sm">{d.sector}</p>
          <div className="pt-1.5 border-t border-slate-700 space-y-1">
            <p className="flex justify-between text-slate-300">
              <span>Total Projects:</span>
              <strong className="text-white font-mono">{d.total}</strong>
            </p>
            <p className="flex justify-between text-slate-300">
              <span>Total Capital Outlay:</span>
              <strong className="text-emerald-400 font-mono">₹{d.totalValueCr} Cr</strong>
            </p>
            <p className="flex justify-between text-slate-300">
              <span>Land Area Required:</span>
              <strong className="text-amber-300 font-mono">{d.totalAreaHa} Ha</strong>
            </p>
            <p className="flex justify-between text-slate-300">
              <span>High / Critical Risk:</span>
              <strong className="text-rose-400 font-mono">{d.high + d.critical}</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Delay Driver Tooltip
  const CustomDriverTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 min-w-[220px] border border-slate-700">
          <p className="font-extrabold text-sm" style={{ color: d.color }}>{d.driver}</p>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Category: {d.category}
          </span>
          <div className="pt-1.5 border-t border-slate-700 space-y-1">
            <p className="flex justify-between text-slate-300">
              <span>Affected Projects:</span>
              <strong className="text-white font-mono">{d.count} of {projects.length}</strong>
            </p>
            <p className="flex justify-between text-slate-300">
              <span>Portfolio Prevalence:</span>
              <strong className="text-amber-400 font-mono">{d.percentage}%</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

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
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Analytics
            </button>
            <button
              onClick={() => onNavigate('map')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
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

      {/* ── STACKED BAR CHART: Project Risk Distribution by State / District ── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Header & State Filter Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  State-Wise Project Risk Distribution
                  <span className="text-xs font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                    Stacked Analysis
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedState === 'ALL'
                    ? 'Comparing delay risk levels (Low, Medium, High, Critical) aggregated across all Indian States'
                    : `Detailed district-level stacked risk breakdown for ${selectedState}`}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive State Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <label htmlFor="state-filter-select" className="text-xs font-bold text-slate-700 whitespace-nowrap">
                Filter by State:
              </label>
              <select
                id="state-filter-select"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="text-xs font-bold text-blue-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">All States ({availableStates.length})</option>
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {selectedState !== 'ALL' && (
              <button
                onClick={() => setSelectedState('ALL')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Selected Scope Badges Pill Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <Globe2 className="w-4 h-4 text-blue-600" />
            <span>Active Scope: <strong className="text-slate-900">{selectedState === 'ALL' ? 'All States (National View)' : selectedState}</strong></span>
            <span className="text-slate-400">•</span>
            <span>{filterSummary.total} Total Projects</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Low: {filterSummary.low}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Medium: {filterSummary.medium}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              High: {filterSummary.high}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Critical: {filterSummary.critical}
            </span>
          </div>
        </div>

        {/* The Stacked Bar Chart */}
        <div className="h-80 w-full pt-2">
          {stateRiskStackedData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No project records found for the selected state.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stateRiskStackedData}
                margin={{ top: 15, right: 15, left: -15, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip content={<CustomStackedTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }}
                  iconType="circle"
                />
                {/* Stacked Risk Bars */}
                <Bar
                  dataKey="low"
                  name="Low Risk (<40%)"
                  stackId="riskStack"
                  fill="#10b981"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="medium"
                  name="Medium Risk (40-69%)"
                  stackId="riskStack"
                  fill="#f59e0b"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="high"
                  name="High Risk (70-84%)"
                  stackId="riskStack"
                  fill="#f97316"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="critical"
                  name="Critical Risk (≥85%)"
                  stackId="riskStack"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── NEW ROW: Sector-Wise Projects & Categorical Delay Drivers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Sector-Wise Project Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Sector-Wise Project Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Breakdown of land acquisition cases across infrastructure sectors
              </p>
            </div>
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
              {sectorData.length} Sectors
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sectorData}
                margin={{ top: 15, right: 10, left: -20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip content={<CustomSectorTooltip />} />
                <Bar
                  dataKey="total"
                  name="Total Projects"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Top Sector</span>
              <span className="font-bold text-slate-900 truncate block">
                {sectorData[0]?.shortName || 'N/A'}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Total Outlay</span>
              <span className="font-bold text-emerald-700 block">
                ₹{summary?.total_compensation_cr || 0} Cr
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Total Area</span>
              <span className="font-bold text-blue-700 block">
                {summary?.total_land_area_ha || 0} Ha
              </span>
            </div>
          </div>
        </div>

        {/* Chart 2: Categorical Most Common Delay Drivers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                Most Common Categorical Delay Drivers
              </h3>
              <p className="text-xs text-slate-500">
                Prevalence of legal, statutory & administrative friction across projects
              </p>
            </div>
            <span className="text-[11px] font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
              Risk Attribution
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={delayDriversData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                  width={130}
                />
                <Tooltip content={<CustomDriverTooltip />} />
                <Bar
                  dataKey="count"
                  name="Affected Projects"
                  radius={[0, 6, 6, 0]}
                >
                  {delayDriversData.map((entry, index) => (
                    <Cell key={`driver-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Top Bottleneck:</span>
            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
              {delayDriversData[0]?.driver} ({delayDriversData[0]?.percentage}% of projects)
            </span>
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid: Stage Bottlenecks & Donut */}
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
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

                <button className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white hover:bg-blue-600 rounded-lg shrink-0 transition-colors cursor-pointer">
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
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
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
                  className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-white border border-slate-200 hover:bg-blue-50 rounded-lg shrink-0 shadow-sm cursor-pointer"
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
