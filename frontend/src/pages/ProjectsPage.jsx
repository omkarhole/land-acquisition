import React, { useState, useEffect } from 'react';
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
  Layers
} from 'lucide-react';

export const ProjectsPage = ({ onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
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
      setProjects(data);
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

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">
              National Land Acquisition Registry
            </h1>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {projects.length} Active Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stage tracking, statutory milestone compliance, and predictive delay risk scoring
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Register Land Acquisition Case
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, code or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Risk Level Filter */}
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-medium"
        >
          <option value="">All Risk Classifications</option>
          <option value="CRITICAL">Critical Risk (≥85%)</option>
          <option value="HIGH">High Risk (70-84%)</option>
          <option value="MEDIUM">Medium Risk (40-69%)</option>
          <option value="LOW">Low Risk (&lt;40%)</option>
        </select>

        {/* State Filter */}
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-medium"
        >
          <option value="">All Indian States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Sector Filter */}
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-medium"
        >
          <option value="">All Infrastructure Sectors</option>
          {sectors.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-xs font-semibold">
            Loading project records...
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <FolderGit2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-bold">No matching projects found.</p>
            <p className="text-xs text-slate-400 mt-1">Try relaxing your search or filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Project Code & Priority</th>
                  <th className="px-4 py-3.5">Project Title & Location</th>
                  <th className="px-4 py-3.5">Sector</th>
                  <th className="px-4 py-3.5">Current LARR Stage</th>
                  <th className="px-4 py-3.5">Land Area / Award</th>
                  <th className="px-4 py-3.5">Progress</th>
                  <th className="px-4 py-3.5">Delay Risk Score</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {projects.map((p) => {
                  const pred = p.latest_prediction;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                      onClick={() => onSelectProject(p.id)}
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-blue-600 text-xs">{p.project_code}</div>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.priority === 'Critical' || p.priority === 'Cabinet Fast-Track'
                            ? 'bg-rose-100 text-rose-700'
                            : p.priority === 'High'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.priority}
                        </span>
                      </td>

                      <td className="px-4 py-4 max-w-xs">
                        <p className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {p.district}, {p.state}
                        </p>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-slate-600">{p.project_type}</span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded text-[11px]">
                          {p.current_stage}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{p.land_area_hectares} Ha</div>
                        <div className="text-[11px] text-slate-500">₹{p.compensation_offered_cr} Cr</div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="w-24">
                          <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                            <span>{p.overall_progress_pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${Math.min(100, p.overall_progress_pct)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {pred ? (
                          <RiskBadge level={pred.risk_level} probability={pred.probability} size="sm" />
                        ) : (
                          <span className="text-slate-400 text-xs">Unpredicted</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(p.id);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-sm"
                        >
                          360° Dossier <ChevronRight className="w-3.5 h-3.5" />
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

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

    </div>
  );
};
