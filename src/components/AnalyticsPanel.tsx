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
import type { Building } from '@/types';
import {
  getCapRateChartData,
  getOccupancyRateChartData,
  calculateAverage,
  formatDate,
} from '@/lib';

interface AnalyticsPanelProps {
  buildings: Building[];
}

export function AnalyticsPanel({ buildings }: AnalyticsPanelProps) {
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

  if (buildings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">分析データがありません</h3>
          <p className="text-sm text-gray-500">左のパネルから建物を検索してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {/* キャップレート推移 */}
      <section className="flex-1 bg-white rounded-lg shadow-sm p-6" aria-label="キャップレート推移グラフ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">キャップレート推移</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              <span className="text-gray-500">データ件数:</span>
              <span className="ml-1 font-medium text-gray-900">{capRateData.length}</span>
            </span>
            <span className="text-sm">
              <span className="text-gray-500">平均:</span>
              <span className="ml-1 font-semibold text-blue-600">{capRateAvg.toFixed(2)}%</span>
            </span>
          </div>
        </div>
        <div className="h-[calc(100%-40px)]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedCapRateData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="capRateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                width={45}
              />
              <Tooltip
                formatter={(value) => {
                  const numValue = typeof value === 'number' ? value : 0;
                  return [`${numValue.toFixed(2)}%`, 'キャップレート'];
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
                label={{
                  value: `平均 ${capRateAvg.toFixed(2)}%`,
                  position: 'right',
                  fill: '#3B82F6',
                  fontSize: 10,
                }}
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
      </section>

      {/* 稼働率推移 */}
      <section className="flex-1 bg-white rounded-lg shadow-sm p-6" aria-label="稼働率推移グラフ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">稼働率推移</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              <span className="text-gray-500">データ件数:</span>
              <span className="ml-1 font-medium text-gray-900">{occupancyData.length}</span>
            </span>
            <span className="text-sm">
              <span className="text-gray-500">平均:</span>
              <span className="ml-1 font-semibold text-emerald-600">{occupancyAvg.toFixed(2)}%</span>
            </span>
          </div>
        </div>
        <div className="h-[calc(100%-40px)]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedOccupancyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[80, 100]}
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                width={45}
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
                label={{
                  value: `平均 ${occupancyAvg.toFixed(2)}%`,
                  position: 'right',
                  fill: '#10B981',
                  fontSize: 10,
                }}
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
      </section>
    </div>
  );
}
