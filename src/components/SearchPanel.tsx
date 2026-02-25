'use client';

import { useState, memo, useCallback, useId } from 'react';
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
  id: string;
}

const RangeInput = memo(function RangeInput({ label, unit, value, onChange, id }: RangeInputProps) {
  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Only allow numeric input
      const newValue = e.target.value.replace(/[^\d.]/g, '');
      onChange({ ...value, min: newValue });
    },
    [value, onChange]
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Only allow numeric input
      const newValue = e.target.value.replace(/[^\d.]/g, '');
      onChange({ ...value, max: newValue });
    },
    [value, onChange]
  );

  return (
    <div className="mb-6">
      <label htmlFor={`${id}-min`} className="block text-sm text-[#757575] mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2" role="group" aria-labelledby={`${id}-label`}>
        <span id={`${id}-label`} className="sr-only">{label}の範囲</span>
        <input
          id={`${id}-min`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*\.?[0-9]*"
          value={value.min}
          onChange={handleMinChange}
          className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded text-sm text-[#333333] focus:outline-none focus:border-[#98A2FF] focus:ring-2 focus:ring-[#98A2FF]/20 transition-colors"
          placeholder="最小"
          aria-label={`${label}の最小値`}
          suppressHydrationWarning
        />
        <span className="text-[#757575] text-sm flex-shrink-0" aria-hidden="true">〜</span>
        <input
          id={`${id}-max`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*\.?[0-9]*"
          value={value.max}
          onChange={handleMaxChange}
          className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded text-sm text-[#333333] focus:outline-none focus:border-[#98A2FF] focus:ring-2 focus:ring-[#98A2FF]/20 transition-colors"
          placeholder="最大"
          aria-label={`${label}の最大値`}
          suppressHydrationWarning
        />
        <span className="text-sm text-[#757575] flex-shrink-0" aria-hidden="true">{unit}</span>
      </div>
    </div>
  );
});

export const SearchPanel = memo(function SearchPanel({ onSearch, onReset, isLoading = false }: SearchPanelProps) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const formId = useId();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(filters);
    },
    [filters, onSearch]
  );

  const handleReset = useCallback(() => {
    setFilters(defaultFilters);
    onReset();
  }, [onReset]);

  const handleOccupancyChange = useCallback(
    (occupancyRate: RangeFilter) => setFilters((prev) => ({ ...prev, occupancyRate })),
    []
  );

  const handleAppraisalChange = useCallback(
    (appraisalPrice: RangeFilter) => setFilters((prev) => ({ ...prev, appraisalPrice })),
    []
  );

  const handleCapRateChange = useCallback(
    (capRate: RangeFilter) => setFilters((prev) => ({ ...prev, capRate })),
    []
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full"
      suppressHydrationWarning
      aria-label="建物検索フォーム"
    >
      {/* 入力フォーム群 */}
      <fieldset className="flex-1 border-0 p-0 m-0">
        <legend className="sr-only">検索条件</legend>
        <RangeInput
          id={`${formId}-occupancy`}
          label="稼働率"
          unit="%"
          value={filters.occupancyRate}
          onChange={handleOccupancyChange}
        />

        <RangeInput
          id={`${formId}-appraisal`}
          label="最新鑑定評価額"
          unit="百万円"
          value={filters.appraisalPrice}
          onChange={handleAppraisalChange}
        />

        <RangeInput
          id={`${formId}-caprate`}
          label="最新CR"
          unit="%"
          value={filters.capRate}
          onChange={handleCapRateChange}
        />
      </fieldset>

      {/* アクションエリア（下部固定） */}
      <div className="mt-auto">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#98A2FF] hover:bg-[#8592F0] active:bg-[#7A85E0] text-white font-medium rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              検索中...
            </span>
          ) : (
            '検索'
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="w-full mt-3 text-sm text-[#9E9E9E] hover:text-[#757575] transition-colors focus-ring rounded py-1"
        >
          検索結果をリセット
        </button>
      </div>
    </form>
  );
});
