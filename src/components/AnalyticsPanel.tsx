'use client';

import { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import type { JReitBuilding } from '@/mocks/buildings.type';
import {
  getCapRateChartData,
  getOccupancyRateChartData,
  calculateAverage,
  formatDate,
} from '@/lib/buildingUtils';

interface AnalyticsPanelProps {
  buildings: JReitBuilding[];
  isExpanded: boolean;
  onToggle: () => void;
}

export function AnalyticsPanel({ buildings, isExpanded, onToggle }: AnalyticsPanelProps) {
  const capRateData = useMemo(() => getCapRateChartData(buildings), [buildings]);
  const occupancyData = useMemo(() => getOccupancyRateChartData(buildings), [buildings]);

  const capRateAvg = useMemo(() => calculateAverage(capRateData), [capRateData]);
  const occupancyAvg = useMemo(() => calculateAverage(occupancyData), [occupancyData]);

  const formattedCapRateData = useMemo(
    () => capRateData.map((p) => ({ ...p, displayDate: formatDate(p.date) })),
    [capRateData]
  );

  const formattedOccupancyData = useMemo(
    () => occupancyData.map((p) => ({ ...p, displayDate: formatDate(p.date) })),
    [occupancyData]
  );

  return (
    <div className={`card transition-all duration-300 ${isExpanded ? 'h-[280px]' : 'h-14'}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full h-14 px-5 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">分析グラフ</span>

          {/* Mini Stats when collapsed */}
          {!isExpanded && (
            <div className="flex items-center gap-4 ml-4">
              <span className="text-sm">
                <span className="text-gray-500">CR平均:</span>
                <span className="ml-1 font-semibold text-blue-600">{capRateAvg.toFixed(2)}%</span>
              </span>
              <span className="text-sm">
                <span className="text-gray-500">稼働率平均:</span>
                <span className="ml-1 font-semibold text-emerald-600">{occupancyAvg.toFixed(2)}%</span>
              </span>
            </div>
          )}
        </div>

        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Charts Container */}
      {isExpanded && (
        <div className="h-[calc(100%-56px)] px-5 pb-4 grid grid-cols-2 gap-6 animate-fade-in">
          {/* Cap Rate Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">キャップレート推移</h3>
              <span className="text-sm">
                <span className="text-gray-400">平均:</span>
                <span className="ml-1 font-semibold text-blue-600">{capRateAvg.toFixed(2)}%</span>
              </span>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedCapRateData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="capRateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                    width={40}
                  />
                  <Tooltip
                    formatter={(value) => {
                      const numValue = typeof value === 'number' ? value : 0;
                      return [`${numValue.toFixed(2)}%`, 'CR'];
                    }}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      fontSize: '12px',
                    }}
                  />
                  <ReferenceLine
                    y={capRateAvg}
                    stroke="#3B82F6"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#capRateGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Occupancy Rate Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">稼働率推移</h3>
              <span className="text-sm">
                <span className="text-gray-400">平均:</span>
                <span className="ml-1 font-semibold text-emerald-600">{occupancyAvg.toFixed(2)}%</span>
              </span>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedOccupancyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[80, 100]}
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                    width={40}
                  />
                  <Tooltip
                    formatter={(value) => {
                      const numValue = typeof value === 'number' ? value : 0;
                      return [`${numValue.toFixed(2)}%`, '稼働率'];
                    }}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      fontSize: '12px',
                    }}
                  />
                  <ReferenceLine
                    y={occupancyAvg}
                    stroke="#10B981"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#occupancyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
