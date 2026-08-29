import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import {
  FileText,
  Printer,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const ReportsPage = ({ selectedProjectId, onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [currentId, setCurrentId] = useState(selectedProjectId || 1);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const projs = await api.getProjects();
        setProjects(projs);
        if (!selectedProjectId && projs.length > 0) {
          setCurrentId(projs[0].id);
        }
      } catch (err) {
        console.error('Failed to load project list:', err);
      }
    };
    fetchList();
  }, [selectedProjectId]);

  useEffect(() => {
    if (currentId) {
      const fetchReport = async () => {
        setLoading(true);
        try {
          const data = await api.getProjectReport(currentId);
          setReport(data);
        } catch (err) {
          console.error('Failed to load report:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchReport();
    }
  }, [currentId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Control Bar (Hidden on Print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Executive Land Acquisition Risk Dossier</h2>
            <p className="text-xs text-slate-500">Official decision-support brief for District Collectors & Ministry Secretaries</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={currentId}
            onChange={(e) => setCurrentId(Number(e.target.value))}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_code} - {p.title.slice(0, 35)}...
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print / Export Official PDF
          </button>
        </div>
      </div>

      {/* Printable Report Dossier Container */}
      <div id="printable-report" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-4xl mx-auto">
        
        {loading || !report ? (
          <div className="py-20 text-center text-xs font-bold text-slate-500">Generating Dossier...</div>
        ) : (
          <div className="space-y-6">
            
            {/* Government Official Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-900 tracking-wider uppercase">
                  {report.ministry}
                </p>
                <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  Early-Warning Land Acquisition Status & Risk Dossier
                </h1>
                <p className="text-[11px] text-slate-500 mt-1">
                  National Decision-Support Framework (LARR Act 2013 Compliance) • {report.system}
                </p>
              </div>

              <div className="text-right text-[11px] font-mono text-slate-500">
                <p>Date: {report.generated_at}</p>
                <p className="font-bold text-slate-900 mt-0.5">Dossier ID: {report.project.code}</p>
              </div>
            </div>

            {/* Project Master Details */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Project Title</span>
                <span className="font-extrabold text-slate-900 text-sm block mt-0.5">{report.project.title}</span>
                <span className="text-slate-600 mt-1 block">Location: {report.project.district}, {report.project.state}</span>
                <span className="text-slate-600 block">Sector: {report.project.sector}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Priority Level:</span>
                  <span className="font-bold text-slate-900">{report.project.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Land Area:</span>
                  <span className="font-bold text-slate-900">{report.project.land_area_ha} Hectares</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Affected Landowners:</span>
                  <span className="font-bold text-slate-900">{report.project.affected_owners} Families</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Compensation Offered:</span>
                  <span className="font-bold text-slate-900">₹{report.project.compensation_offered_cr} Cr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Compensation Disbursed:</span>
                  <span className="font-bold text-emerald-700">₹{report.project.compensation_paid_cr} Cr</span>
                </div>
              </div>
            </div>

            {/* Risk Assessment Box */}
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Predictive Delay Risk Assessment
                </h3>
                <RiskBadge level={report.risk_assessment.risk_level} probability={report.risk_assessment.probability} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mt-2 border-t border-amber-200/60 pt-2">
                <div>
                  <span className="text-slate-500">Delay Probability:</span>
                  <span className="font-bold text-slate-900 ml-1.5 font-mono">
                    {Math.round(report.risk_assessment.probability * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Estimated Schedule Delay:</span>
                  <span className="font-bold text-rose-700 ml-1.5">
                    +{report.risk_assessment.estimated_delay_days} Days
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">Key Delay Contributors:</span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {report.risk_assessment.top_risk_factors.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="font-bold">{f.direction === 'up' ? '▲' : '▼'}</span>
                      <span><strong>{f.label}:</strong> {f.impact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Stages Breakdown Table */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                LARR 2013 Stage Milestone Progress
              </h3>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="px-3 py-2 border-b border-r">Stage Order</th>
                    <th className="px-3 py-2 border-b border-r">Stage Name</th>
                    <th className="px-3 py-2 border-b border-r">Status</th>
                    <th className="px-3 py-2 border-b">Duration (Days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.stages.map((s) => (
                    <tr key={s.order}>
                      <td className="px-3 py-2 border-r font-mono">{s.order}</td>
                      <td className="px-3 py-2 border-r font-semibold">{s.name}</td>
                      <td className="px-3 py-2 border-r font-bold">{s.status}</td>
                      <td className="px-3 py-2">{s.days_in_stage} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature & Compliance Footer */}
            <div className="border-t-2 border-slate-900 pt-6 mt-8 grid grid-cols-2 gap-8 text-xs text-slate-600">
              <div>
                <p className="font-bold text-slate-900">Prepared by:</p>
                <p className="mt-4 border-b border-slate-300 w-48"></p>
                <p className="mt-1">Land Acquisition Officer (LAO)</p>
              </div>

              <div className="text-right">
                <p className="font-bold text-slate-900">Reviewed & Recommended by:</p>
                <p className="mt-4 border-b border-slate-300 w-48 ml-auto"></p>
                <p className="mt-1">District Magistrate & Collector</p>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
