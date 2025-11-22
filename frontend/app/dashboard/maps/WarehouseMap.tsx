'use client';

import { useState } from 'react';
import { MapPin, Activity, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

interface WarehouseLocation {
  city: string;
  coordinates: [number, number];
  operations: number;
  status: 'normal' | 'warning' | 'critical';
  inbound?: number;
  outbound?: number;
  capacity?: number;
}

const sampleLocations: WarehouseLocation[] = [
  { city: 'Mumbai', coordinates: [72.8777, 19.0760], operations: 1250, status: 'normal', inbound: 680, outbound: 570, capacity: 85 },
  { city: 'Delhi', coordinates: [77.1025, 28.7041], operations: 980, status: 'warning', inbound: 520, outbound: 460, capacity: 92 },
  { city: 'Bangalore', coordinates: [77.5946, 12.9716], operations: 1120, status: 'normal', inbound: 590, outbound: 530, capacity: 78 },
  { city: 'Chennai', coordinates: [80.2707, 13.0827], operations: 750, status: 'critical', inbound: 420, outbound: 330, capacity: 96 },
  { city: 'Kolkata', coordinates: [88.3639, 22.5726], operations: 620, status: 'normal', inbound: 340, outbound: 280, capacity: 72 },
  { city: 'Hyderabad', coordinates: [78.4867, 17.3850], operations: 890, status: 'warning', inbound: 480, outbound: 410, capacity: 88 },
];

export default function WarehouseMap({ locations = sampleLocations }: { locations?: WarehouseLocation[] }) {
  const [mapTimeframe, setMapTimeframe] = useState<string>('7');
  const [hoveredLocation, setHoveredLocation] = useState<WarehouseLocation | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([78, 22]);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['normal', 'warning', 'critical']));
  const [showLabels, setShowLabels] = useState<boolean>(false); // OFF by default
  const [showLegend, setShowLegend] = useState<boolean>(true);  // ON by default

  // colors per status for the heatmap effect
  const statusHeatColors = {
    normal: { inner: 'rgba(16,185,129,0.95)', mid: 'rgba(52,211,153,0.5)', outer: 'rgba(52,211,153,0.12)' },
    warning: { inner: 'rgba(245,158,11,0.95)', mid: 'rgba(250,204,21,0.5)', outer: 'rgba(250,204,21,0.12)' },
    critical: { inner: 'rgba(220,38,38,0.95)', mid: 'rgba(249,115,22,0.5)', outer: 'rgba(252,165,165,0.12)' },
  } as const;

  const timeframeColors = {
    '1': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    '7': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    '30': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' }
  };

  const currentTimeframeColor = timeframeColors[mapTimeframe as keyof typeof timeframeColors];

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 8));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 1));
  const handleReset = () => {
    setZoom(1);
    setCenter([78, 22]);
  };

  const toggleFilter = (status: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(status)) {
      newFilters.delete(status);
    } else {
      newFilters.add(status);
    }
    setActiveFilters(newFilters);
  };

  const filteredLocations = locations.filter(loc => activeFilters.has(loc.status));

  const handleMarkerHover = (location: WarehouseLocation, event: React.MouseEvent) => {
    const rect = (event.currentTarget as Element).getBoundingClientRect();
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
    setHoveredLocation(location);
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Warehouse Insights</h3>
            <p className="text-sm text-gray-500">Real-time operational monitoring</p>
          </div>
        </div>

        <select 
          value={mapTimeframe}
          onChange={(e) => setMapTimeframe(e.target.value)}
          className={`px-4 py-2 text-sm font-medium border-2 ${currentTimeframeColor.border} ${currentTimeframeColor.bg} ${currentTimeframeColor.text} rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer`}
        >
          <option value="1">📅 Today</option>
          <option value="7">📊 Last 7 days</option>
          <option value="30">📈 Last 30 days</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Map container */}
        <div className="col-span-2 relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 h-96 overflow-hidden shadow-inner">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              center: center,
              scale: 1000,
            }}
            className="w-full h-full"
          >
            <ZoomableGroup 
              zoom={zoom} 
              center={center} 
              onMoveEnd={(position) => setCenter(position.coordinates)}
            >
              <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json">
                {({ geographies }: { geographies: any[] }) =>
                  geographies.map((geo: any) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#ccd0d8ff"             // darker grey land
                      stroke="#4B5563"           // darker borders
                      strokeWidth={0.35}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none', fill: '#707882ff' }, // subtle hover
                        pressed: { outline: 'none' }
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Heatmap-style markers: consistent size, status colored */}
              {filteredLocations.map((location, index) => {
  const colors = statusHeatColors[location.status];
  const outerR = 18;
  const innerR = 4;

  return (
    <Marker key={index} coordinates={location.coordinates}>

      <defs>
        <radialGradient id={`heat-${index}`} r="1">
          <stop offset="0%" stopColor={colors.inner} stopOpacity="0.9" />
          <stop offset="55%" stopColor={colors.mid} stopOpacity="0.35" />
          <stop offset="100%" stopColor={colors.outer} stopOpacity="0.1" />
        </radialGradient>
      </defs>

      {/* Outer soft glow (slight pulse only in opacity, NOT in size) */}
      <circle
        r={outerR}
        fill={`url(#heat-${index})`}
        className="heatmap-pulse"
        onMouseEnter={(e) => handleMarkerHover(location, e)}
        onMouseLeave={() => setHoveredLocation(null)}
      />

      {/* Solid inner dot — stays still */}
      <circle
        r={innerR}
        fill={colors.inner}
        className="center-dot"
        pointerEvents="none"
      />

      {showLabels && (
        <text
          textAnchor="middle"
          y={outerR + 12}
          className="text-xs font-semibold fill-gray-200 pointer-events-none"
          style={{ fontSize: '11px' }}
        >
          {location.city}
        </text>
      )}
    </Marker>
  );
})}

            </ZoomableGroup>
          </ComposableMap>

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Tooltip */}
          {hoveredLocation && (
            <div 
              className="fixed z-50 pointer-events-none transition-opacity duration-150"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y - 10}px`,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="bg-white rounded-xl shadow-2xl p-3 border-2 border-gray-200 min-w-[200px] text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    hoveredLocation.status === 'critical' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                    hoveredLocation.status === 'warning' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    'bg-gradient-to-r from-green-400 to-green-600'
                  }`}></div>
                  <h4 className="font-bold text-gray-900 text-sm">{hoveredLocation.city}</h4>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Ops:</span>
                    <span className="font-semibold text-gray-900">{hoveredLocation.operations}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Inbound:</span>
                    <span className="font-semibold text-blue-600">{hoveredLocation.inbound}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Outbound:</span>
                    <span className="font-semibold text-purple-600">{hoveredLocation.outbound}</span>
                  </div>
                </div>
              </div>
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white mx-auto"></div>
            </div>
          )}
        </div>

        {/* Top Active Warehouses */}
        <div className="space-y-3">
          <div className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Top Active Warehouses
          </div>
          {filteredLocations
            .slice() // copy for safety before sort
            .sort((a, b) => b.operations - a.operations)
            .map((location, index) => {
              const statusColorClass =
                location.status === 'critical'
                  ? 'from-red-400 to-red-600'
                  : location.status === 'warning'
                    ? 'from-yellow-400 to-yellow-600'
                    : 'from-green-400 to-green-600';

              return (
                <div 
                  key={index} 
                  className="group relative p-3 rounded-xl hover:shadow-md transition-all border-2 border-transparent hover:border-gray-200 bg-white cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${statusColorClass} flex items-center justify-center text-white font-bold shadow-md`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">{location.city}</div>
                      <div className="text-xs text-gray-500">{location.operations.toLocaleString()} operations</div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-blue-600">↓ {location.inbound}</span>
                        <span className="text-xs text-purple-600">↑ {location.outbound}</span>
                      </div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      location.status === 'critical' ? 'bg-red-100 text-red-700' :
                      location.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {location.capacity}%
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Controls below the map: toggles for labels & legend (rounded pill style) */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLabels(v => !v)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all shadow-sm ${showLabels ? 'bg-white' : 'bg-gray-100'} hover:shadow-md`}
            title="Toggle map labels"
          >
            {showLabels ? 'Hide Labels' : 'Show Labels'}
          </button>

          <button
            onClick={() => setShowLegend(v => !v)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all shadow-sm ${showLegend ? 'bg-white' : 'bg-gray-100'} hover:shadow-md`}
            title="Toggle legend"
          >
            {showLegend ? 'Hide Legend' : 'Show Legend'}
          </button>
        </div>

        <div className="text-xs text-gray-600 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Live updates</span>
        </div>
      </div>

      {/* Legend (optional, smaller & simplified) */}
      {showLegend && (
        <div className="mt-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 text-xs w-full max-w-sm">
          <div className="font-bold text-gray-800 mb-2 text-xs">Map Legend</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-400 to-green-600 shadow-sm" />
              <span className="text-gray-700 text-[11px]">Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-sm" />
              <span className="text-gray-700 text-[11px]">Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-400 to-red-600 shadow-sm" />
              <span className="text-gray-700 text-[11px]">Critical</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Showing {filteredLocations.length} of {locations.length} warehouses • Real-time data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-600">Live updates</span>
          </div>
        </div>
      </div>

      {/* Extra CSS animations inline for the pulsing effects (works with Tailwind JIT or regular Tailwind) */}
      <style jsx>{`
  /* Outer glow pulsing (tiny opacity pulse only) */
  @keyframes heatPulse {
    0% { opacity: 0.55; }
    50% { opacity: 0.85; }
    100% { opacity: 0.55; }
  }

  .heatmap-pulse {
    animation: heatPulse 2.8s ease-in-out infinite;
    transform-origin: center;
  }

  /* Inner dot stays solid & sharp */
  .center-dot {
    opacity: 1;
  }
`}</style>

    </div>
  );
}
