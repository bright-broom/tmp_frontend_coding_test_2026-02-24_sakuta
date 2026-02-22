'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { JReitBuilding } from '@/mocks/buildings.type';
import { getCapRateChartData, calculateAverage, formatDate } from '@/lib/buildingUtils';

interface CapRateChartProps {
  buildings: JReitBuilding[];
}

export function CapRateChart({ buildings }: CapRateChartProps) {
  const chartData = getCapRateChartData(buildings);
  const average = calculateAverage(chartData);

  const formattedData = chartData.map((point) => ({
    ...point,
    displayDate: formatDate(point.date),
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">キャップレート推移</h2>
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          データがありません
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">キャップレート推移</h2>
        <div className="text-sm">
          <span className="text-gray-500">平均:</span>
          <span className="ml-1 font-semibold text-blue-600">{average.toFixed(2)}%</span>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={{ stroke: '#d1d5db' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={{ stroke: '#d1d5db' }}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
              width={50}
            />
            <Tooltip
              formatter={(value) => {
                const numValue = typeof value === 'number' ? value : 0;
                return [`${numValue.toFixed(2)}%`, 'キャップレート'];
              }}
              labelFormatter={(label) => `期間: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            />
            <ReferenceLine
              y={average}
              stroke="#3B82F6"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `平均: ${average.toFixed(2)}%`,
                position: 'right',
                fill: '#3B82F6',
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
