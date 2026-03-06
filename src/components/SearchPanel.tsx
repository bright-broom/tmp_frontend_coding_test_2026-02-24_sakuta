'use client';

import { useState, memo, useCallback, useId, useMemo } from 'react';
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
  hasValue?: boolean;
  hasError?: boolean;
}

const RangeInput = memo(function RangeInput({ label, unit, value, onChange, id, hasValue, hasError }: RangeInputProps) {
  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.replace(/[^\d.]/g, '');
      onChange({ ...value, min: newValue });
    },
    [value, onChange]
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.replace(/[^\d.]/g, '');
      onChange({ ...value, max: newValue });
    },
    [value, onChange]
  );

  const handleClear = useCallback(() => {
    onChange(emptyRange);
  }, [onChange]);

  return (
    <div className={`mb-5 p-3 rounded-lg transition-all duration-200 ${hasError ? 'bg-red-50/50 ring-1 ring-red-200' : hasValue ? 'bg-blue-50/50 ring-1 ring-blue-200' : 'bg-gray-50/50 hover:bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={`${id}-min`} className="text-xs font-medium text-gray-600">
          {label}
        </label>
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={`${label}をクリア`}
          >
            クリア
          </button>
        )}
      </div>
      <div className="flex items-center gap-2" role="group" aria-labelledby={`${id}-label`}>
        <span id={`${id}-label`} className="sr-only">{label}の範囲</span>
        <div className="relative flex-1">
          <input
            id={`${id}-min`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*\.?[0-9]*"
            value={value.min}
            onChange={handleMinChange}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-150"
            placeholder="下限"
            aria-label={`${label}の最小値`}
            suppressHydrationWarning
          />
        </div>
        <span className="text-gray-400 text-xs font-medium" aria-hidden="true">〜</span>
        <div className="relative flex-1">
          <input
            id={`${id}-max`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*\.?[0-9]*"
            value={value.max}
            onChange={handleMaxChange}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-150"
            placeholder="上限"
            aria-label={`${label}の最大値`}
            suppressHydrationWarning
          />
        </div>
        <span className="text-xs text-gray-500 font-medium min-w-[2.5rem] text-right" aria-hidden="true">{unit}</span>
      </div>
      {hasError && (
        <p className="mt-1.5 text-[10px] text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          下限は上限以下にしてください
        </p>
      )}
    </div>
  );
});

export const SearchPanel = memo(function SearchPanel({ onSearch, onReset, isLoading = false }: SearchPanelProps) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const formId = useId();

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.occupancyRate.min || filters.occupancyRate.max) count++;
    if (filters.appraisalPrice.min || filters.appraisalPrice.max) count++;
    if (filters.capRate.min || filters.capRate.max) count++;
    return count;
  }, [filters]);

  const hasOccupancyValue = !!(filters.occupancyRate.min || filters.occupancyRate.max);
  const hasAppraisalValue = !!(filters.appraisalPrice.min || filters.appraisalPrice.max);
  const hasCapRateValue = !!(filters.capRate.min || filters.capRate.max);

  const isRangeInvalid = (range: RangeFilter): boolean => {
    if (!range.min || !range.max) return false;
    return parseFloat(range.min) > parseFloat(range.max);
  };

  const hasOccupancyError = isRangeInvalid(filters.occupancyRate);
  const hasAppraisalError = isRangeInvalid(filters.appraisalPrice);
  const hasCapRateError = isRangeInvalid(filters.capRate);
  const hasAnyError = hasOccupancyError || hasAppraisalError || hasCapRateError;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (hasAnyError) return;
      onSearch(filters);
    },
    [filters, onSearch, hasAnyError]
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
          hasValue={hasOccupancyValue}
          hasError={hasOccupancyError}
        />

        <RangeInput
          id={`${formId}-appraisal`}
          label="最新鑑定評価額"
          unit="百万円"
          value={filters.appraisalPrice}
          onChange={handleAppraisalChange}
          hasValue={hasAppraisalValue}
          hasError={hasAppraisalError}
        />

        <RangeInput
          id={`${formId}-caprate`}
          label="最新キャップレート"
          unit="%"
          value={filters.capRate}
          onChange={handleCapRateChange}
          hasValue={hasCapRateValue}
          hasError={hasCapRateError}
        />
      </fieldset>

      {/* アクションエリア（下部固定） */}
      <div className="mt-auto pt-4 space-y-3">
        <button
          type="submit"
          disabled={isLoading || hasAnyError}
          className="relative w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md focus-ring btn-hover-lift"
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
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              検索
              {activeFilterCount > 0 && (
                <span className="badge-count">{activeFilterCount}</span>
              )}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={activeFilterCount === 0}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-all duration-150 focus-ring rounded-lg"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          リセット
        </button>
      </div>
    </form>
  );
});
