'use client';

import { useMemo, memo } from 'react';
import type { Building } from '@/types';

interface StatsBarProps {
  buildings: Building[];
  isLoading?: boolean;
  hasSearched?: boolean;
}

function calculateStats(buildings: Building[]) {
  if (buildings.length === 0) {
    return { count: 0, avgCapRate: 0, avgOccupancy: 0 };
  }

  const capRates = buildings
    .map((b) => parseFloat(b.yieldEvaluation.capRate))
    .filter((r): r is number => !isNaN(r));
  const occupancyRates = buildings
    .map((b) => {
      if (b.financials.length === 0) return null;
      const rate = b.financials[b.financials.length - 1].leasing.occupancyRate;
      return rate !== null ? parseFloat(rate) : null;
    })
    .filter((r): r is number => r !== null && !isNaN(r));

  const avgCapRate = capRates.length > 0
    ? capRates.reduce((a, b) => a + b, 0) / capRates.length
    : 0;
  const avgOccupancy = occupancyRates.length > 0
    ? occupancyRates.reduce((a, b) => a + b, 0) / occupancyRates.length
    : 0;

  return {
    count: buildings.length,
    avgCapRate,
    avgOccupancy,
  };
}

const StatItem = memo(function StatItem({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="text-center">
      <div className="text-[10px] text-gray-500 mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-gray-900">
        {value}<span className="text-xs font-normal text-gray-500 ml-0.5">{unit}</span>
      </div>
    </div>
  );
});

export const StatsBar = memo(function StatsBar({ buildings, isLoading, hasSearched }: StatsBarProps) {
  const stats = useMemo(() => calculateStats(buildings), [buildings]);

  if (!hasSearched && buildings.length === 0) {
    return (
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-400 text-center">検索して物件を表示</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-center gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse text-center">
              <div className="w-10 h-2 bg-gray-200 rounded mb-1.5 mx-auto" />
              <div className="w-8 h-4 bg-gray-200 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
      <div className="flex items-center justify-center gap-8">
        <StatItem label="物件数" value={stats.count} unit="件" />
        <div className="w-px h-6 bg-gray-200" />
        <StatItem label="平均CR" value={stats.avgCapRate.toFixed(2)} unit="%" />
        <div className="w-px h-6 bg-gray-200" />
        <StatItem label="平均稼働率" value={stats.avgOccupancy.toFixed(1)} unit="%" />
      </div>
    </div>
  );
});
