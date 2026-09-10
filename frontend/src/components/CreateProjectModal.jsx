import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { api } from '../services/api';

/* Defined OUTSIDE the parent component so its identity is stable across re-renders.
   Defining it inside would cause React to unmount/remount on every keystroke,
   destroying input focus. */
const PALETTES = {
  slate:   { bg: 'bg-slate-50',   border: 'border-slate-200',   title: 'text-slate-800'   },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    title: 'text-blue-900'    },
  rose:    { bg: 'bg-rose-50',    border: 'border-rose-200',    title: 'text-rose-900'    },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'text-emerald-900' },
};

const SectionCard = ({ title, color = 'slate', children }) => {
  const p = PALETTES[color] || PALETTES.slate;
  return (
    <div className={`${p.bg} ${p.border} border p-3.5 rounded-xl`}>
      <p className={`text-xs font-bold ${p.title} mb-3`}>{title}</p>
      {children}
    </div>
  );
};

export const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    project_code: `LA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    title: '',
    state: 'Maharashtra',
    district: 'Pune',
    latitude: 18.5204,
    longitude: 73.8567,
    project_type: 'National Highway Corridor',
    priority: 'High',
    land_area_hectares: 85.0,
    affected_owner_count: 320,
    household_count: 240,
    project_value_cr: 180.0,
    compensation_offered_cr: 75.0,
    start_date: new Date().toISOString().split('T')[0],
    target_date: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    current_stage: 'Stage 1: Preliminary Survey & SIA',
    objection_count: 0,
    court_stay_flag: false,
    utility_shift_pending: false,
    forest_clearance_pending: false,
    railway_crossing_pending: false,
    // Land classification & jurisdiction
    land_category: 'Private Agricultural',
    notification_stage: 'Pre-Notification',
    multi_village_jurisdiction: false,
    // Legal & dispute flags
    ownership_title_dispute: false,
    court_litigation_pending: false,
    public_objections_filed: false,
    // Acquisition progress metrics
    days_elapsed_since_notification: 0,
    land_notified_pct: 0,
    award_declared_pct: 0,
    compensation_disbursed_pct: 0,
    physical_possession_pct: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const states = [
    'Maharashtra', 'Uttar Pradesh', 'Gujarat', 'Karnataka',
    'Tamil Nadu', 'Odisha', 'Madhya Pradesh', 'Rajasthan'
  ];

  const districtsByState = {
    Maharashtra: ['Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'],
    'Uttar Pradesh': ['Lucknow', 'Varanasi', 'Noida', 'Agra', 'Prayagraj'],
    Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bharuch'],
    Karnataka: ['Bengaluru Rural', 'Mysuru', 'Belagavi', 'Dharwad', 'Mangaluru'],
    'Tamil Nadu': ['Kanchipuram', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
    Odisha: ['Khurda', 'Sundargarh', 'Jajpur', 'Angul', 'Sambalpur'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
    Rajasthan: ['Jaipur', 'Jodhpur', 'Kota', 'Alwar', 'Udaipur']
  };

  const projectTypes = [
    'National Highway Corridor',
    'High-Speed Rail / DFC',
    'Industrial Smart City Corridor',
    'Major Irrigation & Canal',
    'Renewable Energy Solar Park',
    'Urban Metro Transit Extension',
    'Rural Road Connectivity (PMGSY)'
  ];

  const landCategories = [
    'Private Agricultural',
    'Private Non-Agricultural',
    'Government Wasteland',
    'Forest Land',
    'Urban Land',
    'Tribal / Adivasi Land',
    'Common Land (Gairan / Panchayat)',
  ];

  const notificationStages = [
    'Pre-Notification',
    'Section 11 – Preliminary Notification',
    'Section 15 – Objections Hearing',
    'Section 19 – Final Declaration',
    'Award Passed',
    'Possession Taken',
  ];

  const handleStateChange = (e) => {
    const newState = e.target.value;
    const defaultDist = districtsByState[newState]?.[0] || '';
    setFormData({ ...formData, state: newState, district: defaultDist });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a project title');
      return;
    }
    setSubmitting(true);
    setError('');

    const payload = {
      ...formData,
      land_area_hectares: Number(formData.land_area_hectares) || 0,
      affected_owner_count: parseInt(formData.affected_owner_count, 10) || 0,
      household_count: parseInt(formData.household_count, 10) || 0,
      project_value_cr: Number(formData.project_value_cr) || 0,
      compensation_offered_cr: Number(formData.compensation_offered_cr) || 0,
      days_elapsed_since_notification: parseInt(formData.days_elapsed_since_notification, 10) || 0,
      land_notified_pct: Number(formData.land_notified_pct) || 0,
      award_declared_pct: Number(formData.award_declared_pct) || 0,
      compensation_disbursed_pct: Number(formData.compensation_disbursed_pct) || 0,
      physical_possession_pct: Number(formData.physical_possession_pct) || 0,
    };

    try {
      const created = await api.createProject(payload);
      onProjectCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── reusable style helpers ── */
  const inputCls = 'w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none';
  const selectCls = 'w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none';
  const labelCls = 'block text-xs font-bold text-slate-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">

        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold">Register Land Acquisition Project</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold border-b border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* ── 1. Project Identity ── */}
          <SectionCard title="Project Identity" color="slate">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Project Code</label>
                <input
                  type="text"
                  value={formData.project_code}
                  onChange={(e) => setFormData({ ...formData, project_code: e.target.value })}
                  className={`${inputCls} font-mono bg-slate-100 font-bold`}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Project Title / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Pune-Nashik Greenfield Expressway"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>
            </div>
          </SectionCard>

          {/* ── 2. Location & Sector ── */}
          <SectionCard title="Location & Infrastructure Sector" color="slate">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>State</label>
                <select value={formData.state} onChange={handleStateChange} className={selectCls}>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>District</label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className={selectCls}
                >
                  {(districtsByState[formData.state] || []).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Infrastructure Sector</label>
                <select
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                  className={selectCls}
                >
                  {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </SectionCard>

          {/* ── 3. Project Details ── */}
          <SectionCard title="Project Details" color="slate">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Project Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className={selectCls}
                >
                  <option value="Normal">Normal Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Critical">Critical National Project</option>
                  <option value="Cabinet Fast-Track">PM GatiShakti Fast-Track</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Land Area (Hectares)</label>
                <input
                  type="number" step="0.1" min="0"
                  value={formData.land_area_hectares}
                  onChange={(e) => setFormData({ ...formData, land_area_hectares: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Household Count</label>
                <input
                  type="number" min="0"
                  value={formData.household_count}
                  onChange={(e) => setFormData({ ...formData, household_count: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
          </SectionCard>

          {/* ── 4. Budget & Compensation ── */}
          <SectionCard title="Budget & Compensation" color="slate">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Project Total Value (₹ Cr)</label>
                <input
                  type="number" step="0.1" min="0"
                  value={formData.project_value_cr}
                  onChange={(e) => setFormData({ ...formData, project_value_cr: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Estimated Compensation Award (₹ Cr)</label>
                <input
                  type="number" step="0.1" min="0"
                  value={formData.compensation_offered_cr}
                  onChange={(e) => setFormData({ ...formData, compensation_offered_cr: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
          </SectionCard>

          {/* ── 5. Timeline & Stage ── */}
          <SectionCard title="Timeline & Current Stage" color="slate">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Target Completion Date</label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Current LARR Stage</label>
                <select
                  value={formData.current_stage}
                  onChange={(e) => setFormData({ ...formData, current_stage: e.target.value })}
                  className={selectCls}
                >
                  <option>Stage 1: Preliminary Survey & SIA</option>
                  <option>Stage 2: Section 11 Notification</option>
                  <option>Stage 3: Section 15 Hearing & Objections</option>
                  <option>Stage 4: Section 19 Declaration</option>
                  <option>Stage 5: Valuation & Compensation Award</option>
                  <option>Stage 6: Land Possession & Handover</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* ── 6. Land Classification & Jurisdiction ── */}
          <SectionCard title="Land Classification & Jurisdiction" color="blue">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Land Category</label>
                <select
                  value={formData.land_category}
                  onChange={(e) => setFormData({ ...formData, land_category: e.target.value })}
                  className={selectCls}
                >
                  {landCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Notification Stage</label>
                <select
                  value={formData.notification_stage}
                  onChange={(e) => setFormData({ ...formData, notification_stage: e.target.value })}
                  className={selectCls}
                >
                  {notificationStages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Affected Landowners Count</label>
                <input
                  type="number" min="0"
                  value={formData.affected_owner_count}
                  onChange={(e) => setFormData({ ...formData, affected_owner_count: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="flex items-center h-full pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.multi_village_jurisdiction}
                    onChange={(e) => setFormData({ ...formData, multi_village_jurisdiction: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  Multi-Village Jurisdiction?
                </label>
              </div>
            </div>
          </SectionCard>

          {/* ── 7. Legal & Dispute Flags ── */}
          <SectionCard title="Legal & Dispute Flags" color="rose">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ownership_title_dispute}
                  onChange={(e) => setFormData({ ...formData, ownership_title_dispute: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="font-medium text-slate-700">Ownership Title Dispute?</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.court_litigation_pending}
                  onChange={(e) => setFormData({ ...formData, court_litigation_pending: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="font-medium text-rose-700">Court Litigation Pending?</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.public_objections_filed}
                  onChange={(e) => setFormData({ ...formData, public_objections_filed: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="font-medium text-amber-700">Public Objections Filed?</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.court_stay_flag}
                  onChange={(e) => setFormData({ ...formData, court_stay_flag: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="font-medium text-rose-700">Court Stay Active?</span>
              </label>
            </div>
          </SectionCard>

          {/* ── 8. Acquisition Progress Metrics ── */}
          <SectionCard title="Acquisition Progress Metrics" color="emerald">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Days Elapsed Since Notification</label>
                <input
                  type="number" min="0"
                  value={formData.days_elapsed_since_notification}
                  onChange={(e) => setFormData({ ...formData, days_elapsed_since_notification: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Land Notified (% Area)</label>
                <input
                  type="number" min="0" max="100" step="0.1"
                  value={formData.land_notified_pct}
                  onChange={(e) => setFormData({ ...formData, land_notified_pct: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Award Declared (% Area)</label>
                <input
                  type="number" min="0" max="100" step="0.1"
                  value={formData.award_declared_pct}
                  onChange={(e) => setFormData({ ...formData, award_declared_pct: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Compensation Disbursed (% Amount)</label>
                <input
                  type="number" min="0" max="100" step="0.1"
                  value={formData.compensation_disbursed_pct}
                  onChange={(e) => setFormData({ ...formData, compensation_disbursed_pct: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Physical Possession (% Land)</label>
                <input
                  type="number" min="0" max="100" step="0.1"
                  value={formData.physical_possession_pct}
                  onChange={(e) => setFormData({ ...formData, physical_possession_pct: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
          </SectionCard>

          {/* ── Submit ── */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              {submitting ? 'Creating & Running ML Model...' : 'Save & Predict Delay Risk'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
