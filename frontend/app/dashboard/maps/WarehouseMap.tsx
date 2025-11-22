'use client';

import { useState } from 'react';
import { MapPin, Activity } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import type { WarehouseLocation } from '../types';

interface WarehouseMapProps {
  locations: WarehouseLocation[];
}

export default function WarehouseMap({ locations }: WarehouseMapProps) {
  const [mapTimeframe, setMapTimeframe] = useState<string>('7');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Warehouse Insights Panel</h3>
        </div>
        <select 
          value={mapTimeframe}
          onChange={(e) => setMapTimeframe(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="1">Today</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 relative bg-gray-50 rounded-lg p-4 h-80">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              center: [78, 22],
              scale: 1000,
            }}
            className="w-full h-full"
          >
            <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json">
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#E5E7EB"
                    stroke="#D1D5DB"
                    strokeWidth={0.5}
                  />
                ))
              }
            </Geographies>
            
            {locations.map((location, index) => {
              const maxOps = Math.max(...locations.map(l => l.operations));
              const bubbleSize = (location.operations / maxOps) * 20 + 8;
              const color = location.status === 'critical' ? '#EF4444' : 
                            location.status === 'warning' ? '#F59E0B' : '#10B981';
              
              return (
                <Marker key={index} coordinates={location.coordinates}>
                  <circle
                    r={bubbleSize}
                    fill={color}
                    fillOpacity={0.4}
                    stroke={color}
                    strokeWidth={2}
                    className="hover:fill-opacity-60 transition-all cursor-pointer"
                  />
                  <circle
                    r={bubbleSize * 0.4}
                    fill={color}
                    fillOpacity={0.8}
                  />
                </Marker>
              );
            })}
          </ComposableMap>
          
          <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-md p-3 text-xs">
            <div className="font-semibold text-gray-700 mb-2">Bubble Size</div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-gray-600">Stock Movement</span>
            </div>
            <div className="font-semibold text-gray-700 mt-3 mb-2">Status</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-gray-600">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Critical</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-700 mb-3">Top Active Warehouses</div>
          {locations
            .sort((a, b) => b.operations - a.operations)
            .map((location, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-2 h-2 rounded-full ${
                    location.status === 'critical' ? 'bg-red-500' :
                    location.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{location.city}</div>
                    <div className="text-xs text-gray-500">{location.operations} ops</div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Activity className="w-3.5 h-3.5" />
          <span>Inbound + Outbound movements per warehouse</span>
        </div>
      </div>
    </div>
  );
}

