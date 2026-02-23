'use client';

import { useState } from 'react';
import type { SearchFilters, RangeFilter } from '@/types';

interface SearchPanelProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
  isLoading?: boolean;
}

const emptyRange: RangeFilter = { min: '', max: '' };

const defaultFilters: SearchFilters = {
  keyword: '',
  assetTypes: [],
  occupancyRate: emptyRange,
  appraisalPrice: emptyRange,
  capRate: emptyRange,
};

interface RangeInputProps {
  label: string;
  unit: string;
  value: RangeFilter;
  onChange: (value: RangeFilter) => void;
}

function RangeInput({ label, unit, value, onChange }: RangeInputProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm text-[#757575] mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={value.min}
          onChange={(e) => onChange({ ...value, min: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded text-sm text-[#333333] focus:outline-none focus:border-[#98A2FF] focus:ring-1 focus:ring-[#98A2FF]"
          placeholder=""
          suppressHydrationWarning
        />
        <span className="text-[#757575] text-sm flex-shrink-0">〜</span>
        <input
          type="text"
          inputMode="numeric"
          value={value.max}
          onChange={(e) => onChange({ ...value, max: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded text-sm text-[#333333] focus:outline-none focus:border-[#98A2FF] focus:ring-1 focus:ring-[#98A2FF]"
          placeholder=""
          suppressHydrationWarning
        />
        <span className="text-sm text-[#757575] flex-shrink-0">{unit}</span>
      </div>
    </div>
  );
}

export function SearchPanel({ onSearch, onReset, isLoading = false }: SearchPanelProps) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onReset();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full" suppressHydrationWarning>
      {/* 入力フォーム群 */}
      <div className="flex-1">
        <RangeInput
          label="稼働率"
          unit="%"
          value={filters.occupancyRate}
          onChange={(occupancyRate) => setFilters({ ...filters, occupancyRate })}
        />

        <RangeInput
          label="最新鑑定評価額"
          unit="百万円"
          value={filters.appraisalPrice}
          onChange={(appraisalPrice) => setFilters({ ...filters, appraisalPrice })}
        />

        <RangeInput
          label="最新CR"
          unit="%"
          value={filters.capRate}
          onChange={(capRate) => setFilters({ ...filters, capRate })}
        />
      </div>

      {/* アクションエリア（下部固定） */}
      <div className="mt-auto">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#98A2FF] hover:bg-[#8592F0] text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '検索中...' : '検索'}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="mt-3 text-sm text-[#9E9E9E] hover:text-[#757575] transition-colors"
        >
          検索結果をリセット
        </button>
      </div>
    </form>
  );
}
