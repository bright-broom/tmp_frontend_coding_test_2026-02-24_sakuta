'use client';

import { useEffect, useRef } from 'react';
import type { Building } from '@/types';
import { MAP_CONFIG } from '@/lib/constants';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

interface BuildingMapProps {
  buildings: Building[];
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
}

function createMarkerIcon(isSelected: boolean): L.DivIcon {
  const size = isSelected ? 32 : 24;
  const color = isSelected ? '#DC2626' : '#EF4444';
  const borderWidth = isSelected ? 4 : 3;
  const shadow = isSelected
    ? '0 4px 12px rgba(220, 38, 38, 0.4)'
    : '0 2px 6px rgba(0,0,0,0.2)';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        transition: all 0.2s ease;
      ">
        <div style="
          width: 100%;
          height: 100%;
          background: ${color};
          border-radius: 50%;
          border: ${borderWidth}px solid white;
          box-shadow: ${shadow};
          ${isSelected ? 'animation: pulse 1.5s ease-in-out infinite;' : ''}
        "></div>
        ${isSelected ? `
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${size + 16}px;
            height: ${size + 16}px;
            border: 2px solid ${color};
            border-radius: 50%;
            opacity: 0.3;
            animation: ping 1.5s ease-out infinite;
          "></div>
        ` : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function BuildingMap({ buildings, selectedId, onMarkerClick }: BuildingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      zoomControl: false,
    }).setView(MAP_CONFIG.DEFAULT_CENTER, MAP_CONFIG.DEFAULT_ZOOM);

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

    L.tileLayer(MAP_CONFIG.TILE_URL, {
      attribution: MAP_CONFIG.TILE_ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    if (buildings.length === 0) return;

    const bounds: L.LatLngBoundsLiteral = [];

    buildings.forEach((building) => {
      const lat = parseFloat(building.buildingSpec.latitude);
      const lng = parseFloat(building.buildingSpec.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      bounds.push([lat, lng]);

      const isSelected = building.id === selectedId;
      const icon = createMarkerIcon(isSelected);

      const marker = L.marker([lat, lng], {
        icon,
        zIndexOffset: isSelected ? 1000 : 0,
      }).addTo(mapRef.current!);

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="min-width: 220px; padding: 4px;">
          <h3 style="font-weight: 600; font-size: 14px; color: #111827; margin-bottom: 6px; line-height: 1.3;">
            ${escapeHtml(building.buildingSpec.name)}
          </h3>
          <p style="font-size: 12px; color: #6B7280; margin-bottom: 10px; line-height: 1.4;">
            ${escapeHtml(building.buildingSpec.address)}
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div style="background: #F3F4F6; padding: 8px; border-radius: 6px;">
              <div style="font-size: 10px; color: #9CA3AF; margin-bottom: 2px;">キャップレート</div>
              <div style="font-size: 16px; font-weight: 700; color: #3B82F6;">${escapeHtml(building.yieldEvaluation.capRate)}%</div>
            </div>
            <div style="background: #F3F4F6; padding: 8px; border-radius: 6px;">
              <div style="font-size: 10px; color: #9CA3AF; margin-bottom: 2px;">竣工</div>
              <div style="font-size: 14px; font-weight: 600; color: #111827;">${escapeHtml(String(building.buildingSpec.completedYear))}年</div>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        className: 'custom-popup',
      });

      marker.on('click', () => {
        onMarkerClickRef.current?.(building.id);
      });

      markersRef.current.set(building.id, marker);
    });

    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds as L.LatLngBoundsExpression, {
        padding: [60, 60],
        maxZoom: 15,
      });
    }
  }, [buildings, selectedId]);

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const isSelected = id === selectedId;
      marker.setIcon(createMarkerIcon(isSelected));
      marker.setZIndexOffset(isSelected ? 1000 : 0);

      if (isSelected && mapRef.current) {
        const latLng = marker.getLatLng();
        mapRef.current.panTo(latLng, { animate: true, duration: 0.3 });
        marker.openPopup();
      }
    });
  }, [selectedId]);

  return (
    <div className="h-full w-full relative">
      <div ref={containerRef} className="h-full w-full rounded-lg" />

      {buildings.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">マップに表示する建物がありません</h3>
            <p className="text-sm text-gray-500">左のパネルから建物を検索してください</p>
          </div>
        </div>
      )}

      {buildings.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow"></div>
            <span className="text-gray-600">建物 ({buildings.length}件)</span>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes ping {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .custom-popup .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
        }
        .custom-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
      `}</style>
    </div>
  );
}
