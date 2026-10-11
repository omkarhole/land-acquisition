import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import {
  FolderGit2,
  AlertTriangle,
  Clock,
  Building2,
  ShieldAlert,
  BarChart3,
  MapPin,
  RefreshCw,
  Globe2,
  Flame,
  ChevronRight,
  IndianRupee
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
  const [projects, setProjects] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeChartTab, setActiveChartTab] = useState('regional');
  const [selectedState, setSelectedState] = useState('ALL');

  const fetchData = async () => {
    try {
      const [sumData, bnData, projData, alertData] = await Promise.all([
        api.getDashboardSummary(),
        api.getStageBottlenecks(),
        api.getProjects(),
        api.getAlerts('ACTIVE')
      ]);
      setSummary(sumData);
      setBottlenecks(bnData || []);
      setProjects(projData || []);
      setAlerts(alertData || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
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

  const availableStates = useMemo(() => {
    const statesSet = new Set(projects.map((p) => p.state).filter(Boolean));
    return Array.from(statesSet).sort();
  }, [projects]);

  // Stacked chart data
  const stateRiskStackedData = useMemo(() => {
    if (selectedState === 'ALL') {
      const stateMap = {};
      projects.forEach((p) => {
        const st = p.state || 'Other';
        if (!stateMap[st]) {
          stateMap[st] = { name: st, low: 0, medium: 0, high: 0, critical: 0, total: 0 };
        }
        const r = (p.latest_prediction?.risk_level || 'LOW').toUpperCase();
        if (r === 'CRITICAL') stateMap[st].critical += 1;
        else if (r === 'HIGH') stateMap[st].high += 1;
        else if (r === 'MEDIUM') stateMap[st].medium += 1;
        else stateMap[st].low += 1;
        stateMap[st].total += 1;
      });
      return Object.values(stateMap).sort((a, b) => b.total - a.total);
    } else {
      const filtered = projects.filter((p) => p.state === selectedState);
      const distMap = {};
      filtered.forEach((p) => {
        const dist = p.district || 'Unassigned';
        if (!distMap[dist]) {
          distMap[dist] = { name: dist, low: 0, medium: 0, high: 0, critical: 0, total: 0 };
        }
        const r = (p.latest_prediction?.risk_level || 'LOW').toUpperCase();
        if (r === 'CRITICAL') distMap[dist].critical += 1;
        else if (r === 'HIGH') distMap[dist].high += 1;
        else if (r === 'MEDIUM') distMap[dist].medium += 1;
        else distMap[dist].low += 1;
        distMap[dist].total += 1;
      });
      return Object.values(distMap).sort((a, b) => b.total - a.total);
    }
  }, [projects, selectedState]);

  // Bottleneck calculations
  const formattedBottlenecks = useMemo(() => {
    return bottlenecks.map((item) => ({
      ...item,
      isExceeded: item.avg_days > item.benchmark_days
    }));
  }, [bottlenecks]);

  // Sector distribution
  const sectorData = useMemo(() => {
    const sectorMap = {};
    projects.forEach((p) => {
      const sType = p.project_type || 'Other';
      if (!sectorMap[sType]) sectorMap[sType] = { sector: sType, total: 0 };
      sectorMap[sType].total += 1;
    });
    return Object.values(sectorMap).sort((a, b) => b.total - a.total);
  }, [projects]);

  // Delay drivers
  const delayDrivers = useMemo(() => {
    const total = Math.max(1, projects.length);
    const list = [
      { name: 'Litigation / Court Stay', count: projects.filter(p => p.court_stay_flag || p.court_litigation_pending).length, color: '#ef4444' },
      { name: 'Utility Relocation Lag', count: projects.filter(p => p.utility_shift_pending).length, color: '#f97316' },
      { name: 'Forest NOC Clearance', count: projects.filter(p => p.forest_clearance_pending).length, color: '#8b5cf6' },
      { name: 'Public Objections (Sec 15)', count: projects.filter(p => p.public_objections_filed || (p.objection_count > 0)).length, color: '#f59e0b' },
      { name: 'Title Disputes', count: projects.filter(p => p.ownership_title_dispute || (p.ownership_conflict_count > 0)).length, color: '#ec4899' },
    ];
    return list.map(d => ({ ...d, pct: Math.round((d.count / total) * 100) })).sort((a, b) => b.count - a.count);
  }, [projects]);

  // Donut data
  const riskPieData = [
    { name: 'Low (<40%)', value: summary?.low_risk_count || 0, color: '#10b981' },
    { name: 'Medium (40-69%)', value: summary?.medium_risk_count || 0, color: '#3b82f6' },
    { name: 'High (70-84%)', value: summary?.high_risk_count || 0, color: '#f59e0b' },
    { name: 'Critical (≥85%)', value: summary?.critical_risk_count || 0, color: '#ef4444' }
  ];

  const priorityProjects = useMemo(() => {
    return projects
      .filter(p => p.latest_prediction?.risk_level === 'CRITICAL' || p.latest_prediction?.risk_level === 'HIGH')
      .slice(0, 4);
  }, [projects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
      
      {/* 1. Simple Header */}
      <div className="flex flex-col gap-5 pt-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow mb-2 flex items-center gap-2 text-blue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Ministry intelligence workspace
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Land acquisition overview</h1>
          <p className="mt-1 text-sm text-slate-500">A live view of delay exposure, statutory bottlenecks, and intervention priorities.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="focus-ring flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => onNavigate('map')}
            className="focus-ring flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <MapPin className="w-3.5 h-3.5" />
            Map View
          </button>
        </div>
      </div>

      {/* 2. Four Clean Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="surface-card group p-4 transition-all sm:p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Corridors</span>
          <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{summary?.total_projects || 0}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{summary?.total_land_area_ha || 0} Ha Area</span>
        </div>

        <div className="surface-card group border-rose-100 p-4 transition-all sm:p-5">
          <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider block">Elevated Risk</span>
          <div className="mt-1 text-2xl font-extrabold tracking-tight text-rose-600">
            {(summary?.high_risk_count || 0) + (summary?.critical_risk_count || 0)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{summary?.critical_risk_count || 0} Critical (≥85%)</span>
        </div>

        <div className="surface-card group p-4 transition-all sm:p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Avg Delay</span>
          <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">+{summary?.avg_estimated_delay_days || 0}d</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Estimated days slippage</span>
        </div>

        <div className="surface-card group p-4 transition-all sm:p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Outlay</span>
          <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">₹{summary?.total_compensation_cr || 0} Cr</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Compensation allocated</span>
        </div>
      </div>

      {/* 3. Main Chart Area with Clean Underline Tabs */}
      <div className="surface-card space-y-6 p-4 sm:p-6">
        
        {/* Clean Underline Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-1">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveChartTab('regional')}
              className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeChartTab === 'regional'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe2 className="w-4 h-4" />
              Regional Risk
            </button>

            <button
              onClick={() => setActiveChartTab('bottlenecks')}
              className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeChartTab === 'bottlenecks'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Stage Bottlenecks
            </button>

            <button
              onClick={() => setActiveChartTab('sectors')}
              className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeChartTab === 'sectors'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Flame className="w-4 h-4" />
              Sectors & Causes
            </button>
          </div>

          {/* Clean State Filter */}
          {activeChartTab === 'regional' && (
            <div className="flex items-center gap-2 pb-2">
              <span className="text-xs text-slate-400 font-medium">State:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">All States</option>
                {availableStates.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Regional Risk */}
        {activeChartTab === 'regional' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            <div className="lg:col-span-8">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stateRiskStackedData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-15} textAnchor="end" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                    <Bar dataKey="low" name="Low" stackId="a" fill="#10b981" />
                    <Bar dataKey="medium" name="Medium" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="high" name="High" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="critical" name="Critical" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Simple Donut */}
            <div className="lg:col-span-4 p-4 rounded-xl bg-slate-50/60 border border-slate-100 flex flex-col items-center">
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value">
                      {riskPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-slate-800">{summary?.total_projects || 0}</span>
                  <span className="text-[10px] text-slate-400 uppercase">Cases</span>
                </div>
              </div>

              <div className="w-full space-y-1 mt-2 text-xs">
                {riskPieData.map((r, i) => (
                  <div key={i} className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                      {r.name}
                    </span>
                    <span className="font-semibold text-slate-800">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bottlenecks */}
        {activeChartTab === 'bottlenecks' && (
          <div className="pt-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedBottlenecks} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} unit="d" />
                  <YAxis type="category" dataKey="stage_name" tick={{ fontSize: 11, fill: '#334155' }} width={160} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="avg_days" name="Actual Days" radius={[0, 4, 4, 0]}>
                    {formattedBottlenecks.map((entry, index) => (
                      <Cell key={`bn-${index}`} fill={entry.isExceeded ? '#f43f5e' : '#3b82f6'} />
                    ))}
                  </Bar>
                  <Bar dataKey="benchmark_days" name="Benchmark Days" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Sectors & Causes */}
        {activeChartTab === 'sectors' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-2">Projects by Infrastructure Sector</span>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="sector" tick={{ fontSize: 10, fill: '#64748b' }} angle={-15} textAnchor="end" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                    />
                    <Bar dataKey="total" name="Total Projects" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-3">Prevalent Delay Drivers</span>
              <div className="space-y-3">
                {delayDrivers.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 font-medium">{item.name}</span>
                      <span className="text-slate-500">{item.count} projects ({item.pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. Bottom Lists: Urgent Cases & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Priority Projects */}
        <div className="surface-card space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              High Delay Risk Corridors
            </h3>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {priorityProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-100 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-blue-600">{p.project_code}</span>
                    <RiskBadge level={p.latest_prediction?.risk_level} probability={p.latest_prediction?.probability} size="sm" />
                  </div>
                  <p className="text-xs font-semibold text-slate-900 mt-1 line-clamp-1">{p.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{p.district}, {p.state}</p>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="surface-card space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Alerts
            </h3>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Alerts Hub
            </button>
          </div>

          <div className="space-y-2">
            {alerts.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-xl border border-amber-100 bg-amber-50/30 flex items-start justify-between gap-3"
              >
                <div>
                  <span className="text-[9px] font-bold uppercase bg-rose-500 text-white px-1.5 py-0.5 rounded">
                    {a.severity}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-700 ml-2">{a.project_code}</span>
                  <p className="text-xs text-slate-600 mt-1">{a.message}</p>
                </div>

                <button
                  onClick={() => onSelectProject(a.project_id)}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shrink-0"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};