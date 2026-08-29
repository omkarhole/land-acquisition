import React, { useState } from 'react';
import { X, Plus, Building2, MapPin, Calendar, IndianRupee } from 'lucide-react';
import { api } from '../services/api';

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
    objection_count: 2,
    court_stay_flag: false,
    utility_shift_pending: true,
    forest_clearance_pending: false,
    railway_crossing_pending: false
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

  const handleStateChange = (e) => {
    const newState = e.target.value;
    const defaultDist = districtsByState[newState]?.[0] || '';
    setFormData({
      ...formData,
      state: newState,
      district: defaultDist
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a project title');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const created = await api.createProject(formData);
      onProjectCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
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
          
          {/* Row 1: Code & Title */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Code</label>
              <input
                type="text"
                value={formData.project_code}
                onChange={(e) => setFormData({ ...formData, project_code: e.target.value })}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-bold"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Title / Name</label>
              <input
                type="text"
                placeholder="e.g. Pune-Nashik Greenfield Expressway"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Row 2: State, District, Sector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <select
                value={formData.state}
                onChange={handleStateChange}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {(districtsByState[formData.state] || []).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Infrastructure Sector</label>
              <select
                value={formData.project_type}
                onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: Priority, Land Area, Owners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Normal">Normal Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical National Project</option>
                <option value="Cabinet Fast-Track">PM GatiShakti Fast-Track</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Land Area (Hectares)</label>
              <input
                type="number"
                step="0.1"
                value={formData.land_area_hectares}
                onChange={(e) => setFormData({ ...formData, land_area_hectares: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Affected Landowners</label>
              <input
                type="number"
                value={formData.affected_owner_count}
                onChange={(e) => setFormData({ ...formData, affected_owner_count: parseInt(e.target.value) || 0 })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Row 4: Budget & Compensation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Total Value (₹ Cr)</label>
              <input
                type="number"
                step="0.1"
                value={formData.project_value_cr}
                onChange={(e) => setFormData({ ...formData, project_value_cr: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Compensation Award (₹ Cr)</label>
              <input
                type="number"
                step="0.1"
                value={formData.compensation_offered_cr}
                onChange={(e) => setFormData({ ...formData, compensation_offered_cr: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Row 5: Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Completion Date</label>
              <input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Row 6: Risk Checklist */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-800 mb-2">Initial Risk Factors Checklist</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.utility_shift_pending}
                  onChange={(e) => setFormData({ ...formData, utility_shift_pending: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Utility Relocation Pending</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.forest_clearance_pending}
                  onChange={(e) => setFormData({ ...formData, forest_clearance_pending: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Forest Clearance NOC Awaited</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.court_stay_flag}
                  onChange={(e) => setFormData({ ...formData, court_stay_flag: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-rose-700 font-medium">Court Stay / Litigation Active</span>
              </label>
            </div>
          </div>

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
