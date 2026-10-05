import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { CreateProjectModal } from '../components/CreateProjectModal';
import {
  FolderGit2,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  ChevronRight,
  Building2,
  Calendar,
  IndianRupee,
  Layers,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  BarChart3,
  TrendingUp
} from 'lucide-react';

export const ProjectsPage = ({ onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects({
        search: search || undefined,
        risk_level: riskFilter || undefined,
        state: stateFilter || undefined,
        project_type: sectorFilter || undefined
      });
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, riskFilter, stateFilter, sectorFilter]);

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
    onSelectProject(newProject.id);
  };

  const states = ['Maharashtra', 'Uttar Pradesh', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Odisha', 'Madhya Pradesh', 'Rajasthan'];
  const sectors = [
    'National Highway Corridor',
    'High-Speed Rail / DFC',
    'Industrial Smart City Corridor',
    'Major Irrigation & Canal',
    'Urban Metro Transit Extension',
    'Rural Road Connectivity (PMGSY)'
  ];

  // --- Executive Stats & Easy-to-read Metrics ---
  const stats = useMemo(() => {
    let crit = 0;
    let high = 0;
    let med = 0;
    let low = 0;
    let totalHa = 0;
    let totalCr = 0;

    projects.forEach((p) => {
      totalHa += Number(p.land_area_hectares) || 0;
      totalCr += Number(p.compensation_offered_cr) || 0;
      const r = p.latest_prediction?.risk_level?.toUpperCase();
      if (r === 'CRITICAL') crit++;
      else if (r === 'HIGH') high++;
      else if (r === 'MEDIUM') med++;
      else low++;
    });

    return {
      total: projects.length,
      crit,
      high,
      med,
      low,
      totalHa: Math.round(totalHa).toLocaleString('en-IN'),
      totalCr: Math.round(totalCr).toLocaleString('en-IN')
    };
  }, [projects]);

  // Sorting
  const sortedProjects = useMemo(() => {
    let list = [...projects];
    if (sortBy === 'progress-desc') {
      list.sort((a, b) => (b.overall_progress_pct || 0) - (a.overall_progress_pct || 0));
    } else if (sortBy === 'area-desc') {
      list.sort((a, b) => (Number(b.land_area_hectares) || 0) - (Number(a.land_area_hectares) || 0));
    } else if (sortBy === 'budget-desc') {
      list.sort((a, b) => (Number(b.compensation_offered_cr) || 0) - (Number(a.compensation_offered_cr) || 0));
    }
    return list;
  }, [projects, sortBy]);

  const hasFilters = Boolean(search || riskFilter || stateFilter || sectorFilter);

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* 1. Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              National Land Acquisition Registry
            </h1>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
              {projects.length} Active Corridors
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
            Central repository for monitoring statutory RFCTLARR milestones, direct benefit compensation disbursements, and predictive delay risk scoring.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Register Land Acquisition Case
        </button>
      </div>

      {/* 2. Organized KPI Scoreboard & Risk Visualizer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Corridors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Corridors</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 8 Indian States</div>
        </div>

        {/* Card 2: Total Land Area */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Land Under Acquisition</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {stats.totalHa} <span className="text-xs font-bold text-slate-500">Hectares</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Notified Section 4(1) & 19(1)</div>
        </div>

        {/* Card 3: Compensation Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Committed Awards</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            ₹{stats.totalCr} <span className="text-xs font-bold text-slate-500">Crores</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Direct Benefit Transfer Outlay</div>
        </div>

        {/* Card 4: Critical Delay Alerts with Mini Visual Meter */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Bottleneck Cases</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{stats.crit}</span>
            <span className="text-xs font-bold text-slate-500">Critical Projects (≥85% delay risk)</span>
          </div>
          {/* Visual Mini Risk Segment Bar */}
          <div className="mt-2.5 flex h-2 w-full rounded-full overflow-hidden bg-slate-100 gap-0.5">
            <div style={{ width: `${(stats.crit / (stats.total || 1)) * 100}%` }} className="bg-rose-500" title="Critical" />
            <div style={{ width: `${(stats.high / (stats.total || 1)) * 100}%` }} className="bg-amber-500" title="High" />
            <div style={{ width: `${(stats.med / (stats.total || 1)) * 100}%` }} className="bg-blue-500" title="Medium" />
            <div style={{ width: `${(stats.low / (stats.total || 1)) * 100}%` }} className="bg-emerald-500" title="Low" />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
            <span className="text-rose-600">Crit: {stats.crit}</span>
            <span className="text-amber-600">High: {stats.high}</span>
            <span className="text-blue-600">Med: {stats.med}</span>
            <span className="text-emerald-600">Low: {stats.low}</span>
          </div>
        </div>

      </div>

      {/* 3. Visual 1-Click Risk Filter Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 px-3 uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          Risk Quick Filter:
        </span>

        <button
          onClick={() => setRiskFilter('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            riskFilter === '' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Corridors ({stats.total})
        </button>

        <button
          onClick={() => setRiskFilter('CRITICAL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            riskFilter === 'CRITICAL' ? 'bg-rose-600 text-white shadow-sm' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          Critical Risk ({stats.crit})
        </button>

        <button
          onClick={() => setRiskFilter('HIGH')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            riskFilter === 'HIGH' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          High Risk ({stats.high})
        </button>

        <button
          onClick={() => setRiskFilter('MEDIUM')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            riskFilter === 'MEDIUM' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Medium Risk ({stats.med})
        </button>

        <button
          onClick={() => setRiskFilter('LOW')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            riskFilter === 'LOW' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Low Risk ({stats.low})
        </button>
      </div>

      {/* 4. Search & Multi-Dropdown Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* Search Input */}
        <div className="relative md:col-span-5">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by project name, code, state, or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* State Filter */}
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="md:col-span-3 text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Indian States</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Sector Filter */}
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="md:col-span-2 text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sectors</option>
          {sectors.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Sorting Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="md:col-span-2 text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="default">Sort: Default</option>
          <option value="progress-desc">Progress (High → Low)</option>
          <option value="area-desc">Land Area (Largest)</option>
          <option value="budget-desc">Outlay (Highest)</option>
        </select>
      </div>

      {/* 5. Clean, Structured Projects Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-600">Retrieving land acquisition registry records...</p>
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="py-24 text-center px-4">
            <FolderGit2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">No matching projects found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, state, or risk filter criteria.
            </p>
            {hasFilters && (
              <button
                onClick={() => {
                  setSearch('');
                  setRiskFilter('');
                  setStateFilter('');
                  setSectorFilter('');
                }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-4">Corridor Code & Priority</th>
                  <th className="px-5 py-4">Corridor Title & Location</th>
                  <th className="px-4 py-4">Sector</th>
                  <th className="px-4 py-4">Statutory Stage</th>
                  <th className="px-4 py-4">Land Area & Outlay</th>
                  <th className="px-4 py-4">Milestone Progress</th>
                  <th className="px-4 py-4">Delay Risk</th>
                  <th className="px-5 py-4 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {sortedProjects.map((p) => {
                  const pred = p.latest_prediction;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                      onClick={() => onSelectProject(p.id)}
                    >
                      {/* Code & Priority */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded">
                          {p.project_code}
                        </span>
                        <div className="mt-1">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                            p.priority === 'Critical' || p.priority === 'Cabinet Fast-Track'
                              ? 'bg-rose-100 text-rose-700'
                              : p.priority === 'High'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {p.priority || 'Standard'}
                          </span>
                        </div>
                      </td>

                      {/* Title & Location */}
                      <td className="px-5 py-4 max-w-xs">
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {p.district}, {p.state}
                        </p>
                      </td>

                      {/* Sector */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-slate-600 font-semibold">{p.project_type}</span>
                      </td>

                      {/* Statutory Stage */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-lg text-[11px]">
                          {p.current_stage}
                        </span>
                      </td>

                      {/* Land Area & Cost */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{p.land_area_hectares} Ha</div>
                        <div className="text-[11px] font-semibold text-emerald-700">₹{p.compensation_offered_cr} Cr</div>
                      </td>

                      {/* Progress Bar */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="w-28">
                          <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                            <span>{p.overall_progress_pct}%</span>
                            <span className="text-slate-400">Done</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className={`h-full rounded-full transition-all ${
                                p.overall_progress_pct >= 80 ? 'bg-emerald-500' : p.overall_progress_pct >= 40 ? 'bg-blue-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, p.overall_progress_pct)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Delay Risk Score */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {pred ? (
                          <RiskBadge level={pred.risk_level} probability={pred.probability} size="sm" />
                        ) : (
                          <span className="text-slate-400 text-xs">Unpredicted</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(p.id);
                          }}
                          className="px-3.5 py-1.5 bg-slate-900 group-hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                        >
                          View Dossier <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

    </div>
  );
};