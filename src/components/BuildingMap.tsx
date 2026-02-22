'use client';

import { useEffect, useRef } from 'react';
import type { JReitBuilding } from '@/mocks/buildings.type';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface BuildingMapProps {
  buildings: JReitBuilding[];
}

const DEFAULT_CENTER: [number, number] = [35.6762, 139.6503]; // Tokyo
const DEFAULT_ZOOM = 11;

export function BuildingMap({ buildings }: BuildingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (buildings.length === 0) return;

    // Create custom icon
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: #3B82F6;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Add markers for each building
    const bounds: L.LatLngBoundsLiteral = [];

    buildings.forEach((building) => {
      const lat = parseFloat(building.buildingSpec.latitude);
      const lng = parseFloat(building.buildingSpec.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      bounds.push([lat, lng]);

      const marker = L.marker([lat, lng], { icon }).addTo(mapRef.current!);

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">${building.buildingSpec.name}</h3>
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${building.buildingSpec.address}</p>
          <div style="margin-top: 8px; font-size: 12px;">
            <p><span style="color: #6b7280;">最新CR:</span> <span style="font-weight: 600; color: #1f2937;">${building.yieldEvaluation.capRate}%</span></p>
            <p><span style="color: #6b7280;">竣工:</span> <span style="color: #1f2937;">${building.buildingSpec.completedYear}年${building.buildingSpec.completedMonth}月</span></p>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Fit bounds if there are markers
    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50] });
    }
  }, [buildings]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          検索結果マップ
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({buildings.length}件)
          </span>
        </h2>
      </div>
      <div ref={containerRef} className="h-[400px] w-full" />
    </div>
  );
}
