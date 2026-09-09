import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { MapPin, Filter, Layers, Navigation, ArrowRight, ShieldAlert } from 'lucide-react';

// Custom colored leaflet markers using SVG DivIcons
function createCustomIcon(riskLevel) {
  const colors = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#f59e0b',
    LOW: '#10b981'
  };
  const color = colors[riskLevel?.toUpperCase()] || '#10b981';

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
}

function FlyToMarker({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 8, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

export const RiskMapPage = ({ onSelectProject }) => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [activeCoords, setActiveCoords] = useState(null);

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const data = await api.getGeoData();
        setPoints(data);
      } catch (err) {
        console.error('Failed to load geo data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGeoData();
  }, []);

  const filteredPoints = points.filter(p => {
    const matchesRisk = selectedRisk === 'ALL' || p.risk_level.toUpperCase() === selectedRisk;
    const matchesSector = selectedSector === 'ALL' || p.project_type === selectedSector;
    return matchesRisk && matchesSector;
  });

  const sectors = [
    'ALL',
    'National Highway Corridor',
    'High-Speed Rail / DFC',
    'Industrial Smart City Corridor',
    'Major Irrigation & Canal',
    'Urban Metro Transit Extension',
    'Rural Road Connectivity (PMGSY)'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-600">Rendering National Geospatial Risk Topology...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      
      {/* Header & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            GIS Map
          </h2>
          <p className="text-xs text-slate-500">
            Interactive district-level geospatial monitoring and delay vulnerability heatmap
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Risk Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 font-semibold px-2 text-[11px] uppercase">Risk:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedRisk(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedRisk === lvl
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Sector Dropdown */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            {sectors.map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Infrastructure Sectors' : s}</option>
            ))}
          </select>

        </div>
      </div>

      {/* Map + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[650px]">
        
        {/* Left Side: Map Container */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          <MapContainer
            center={[21.5, 78.9629]}
            zoom={5}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {activeCoords && <FlyToMarker position={activeCoords} />}

            {filteredPoints.map((point) => (
              <Marker
                key={point.id}
                position={[point.latitude, point.longitude]}
                icon={createCustomIcon(point.risk_level)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 max-w-xs space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                      <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {point.project_code}
                      </span>
                      <RiskBadge level={point.risk_level} size="sm" showIcon={false} />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {point.title}
                    </h4>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <p>📍 {point.district}, {point.state}</p>
                      <p>🏗️ {point.project_type}</p>
                      <p>📌 {point.current_stage}</p>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Delay Probability:</span>
                      <span className="font-extrabold text-slate-900 font-mono">
                        {Math.round(point.probability * 100)}%
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectProject(point.id)}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      Open 360° Dossier <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-lg text-xs space-y-1.5 pointer-events-auto">
            <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">Delay Risk Map Legend</span>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500" /> <span className="text-slate-600">Critical (≥85%)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500" /> <span className="text-slate-600">High (70–84%)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" /> <span className="text-slate-600">Medium (40–69%)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /> <span className="text-slate-600">Low (&lt;40%)</span></div>
          </div>
        </div>

        {/* Right Side: Project Quick Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between overflow-hidden">
          <div className="border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Mapped Projects ({filteredPoints.length})
            </h3>
            <p className="text-[11px] text-slate-400">Click to locate on GIS map</p>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {filteredPoints.map((p) => (
              <div
                key={p.id}
                onClick={() => setActiveCoords([p.latitude, p.longitude])}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition-all text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-slate-700 text-[11px]">{p.project_code}</span>
                  <RiskBadge level={p.risk_level} size="sm" showIcon={false} />
                </div>
                <p className="font-bold text-slate-900 line-clamp-1">{p.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{p.district}, {p.state}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Geographic coordinates sourced from State Revenue GIS Cadastral Layers.
          </div>
        </div>

      </div>

    </div>
  );
};
