'use client';

import { useMemo } from 'react';
import type { JReitBuilding } from '@/mocks/buildings.type';

interface StatsPanelProps {
  buildings: JReitBuilding[];
}

export function StatsPanel({ buildings }: StatsPanelProps) {
  const stats = useMemo(() => {
    if (buildings.length === 0) {
      return { count: 0, avgCapRate: 0, avgOccupancy: 0 };
    }

    const totalCapRate = buildings.reduce(
      (sum, b) => sum + parseFloat(b.yieldEvaluation.capRate),
      0
    );

    // Get latest occupancy rate for each building
    const occupancyRates = buildings
      .filter((b) => b.financials.length > 0)
      .map((b) => parseFloat(b.financials[b.financials.length - 1].leasing.occupancyRate));

    const avgOccupancy = occupancyRates.length > 0
      ? occupancyRates.reduce((sum, rate) => sum + rate, 0) / occupancyRates.length
      : 0;

    return {
      count: buildings.length,
      avgCapRate: totalCapRate / buildings.length,
      avgOccupancy,
    };
  }, [buildings]);

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Building Count */}
      <div className="text-center">
        <div className="stat-value text-blue-600">{stats.count}</div>
        <div className="stat-label">件</div>
      </div>

      {/* Average Cap Rate */}
      <div className="text-center border-l border-r border-gray-100">
        <div className="stat-value text-gray-900">
          {stats.avgCapRate > 0 ? stats.avgCapRate.toFixed(2) : '-'}
          <span className="text-base font-normal text-gray-400">%</span>
        </div>
        <div className="stat-label">平均CR</div>
      </div>

      {/* Average Occupancy */}
      <div className="text-center">
        <div className="stat-value text-emerald-600">
          {stats.avgOccupancy > 0 ? stats.avgOccupancy.toFixed(1) : '-'}
          <span className="text-base font-normal text-gray-400">%</span>
        </div>
        <div className="stat-label">平均稼働率</div>
      </div>
    </div>
  );
}
