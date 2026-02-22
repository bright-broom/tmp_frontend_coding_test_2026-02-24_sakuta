'use client';

import { useState } from 'react';
import type { SearchFilters, AssetTypeKey } from '@/lib/buildingUtils';
import { ASSET_TYPE_LABELS } from '@/lib/buildingUtils';

interface SearchPanelProps {
  onSearch: (filters: SearchFilters) => void;
}

const ASSET_TYPE_KEYS = Object.keys(ASSET_TYPE_LABELS) as AssetTypeKey[];

export function SearchPanel({ onSearch }: SearchPanelProps) {
  const [keyword, setKeyword] = useState('');
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<AssetTypeKey[]>([]);

  const handleAssetTypeToggle = (assetType: AssetTypeKey) => {
    setSelectedAssetTypes((prev) =>
      prev.includes(assetType)
        ? prev.filter((t) => t !== assetType)
        : [...prev, assetType]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      keyword,
      assetTypes: selectedAssetTypes,
    });
  };

  const handleClear = () => {
    setKeyword('');
    setSelectedAssetTypes([]);
  };

  const hasFilters = keyword.length > 0 || selectedAssetTypes.length > 0;

  return (
    <form onSubmit={handleSubmit} suppressHydrationWarning>
      {/* Search Input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="建物名・住所で検索..."
          className="input-field pl-10 pr-10"
          suppressHydrationWarning
        />
        {keyword && (
          <button
            type="button"
            onClick={() => setKeyword('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Asset Type Chips */}
      <div className="mb-4">
        <p className="section-title">アセットタイプ</p>
        <div className="flex flex-wrap gap-2">
          {ASSET_TYPE_KEYS.map((assetType) => {
            const isActive = selectedAssetTypes.includes(assetType);
            return (
              <button
                key={assetType}
                type="button"
                onClick={() => handleAssetTypeToggle(assetType)}
                className={`chip ${isActive ? 'chip-active' : 'chip-default'}`}
              >
                {ASSET_TYPE_LABELS[assetType]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          検索
        </button>
        {hasFilters && (
          <button type="button" onClick={handleClear} className="btn-secondary">
            クリア
          </button>
        )}
      </div>
    </form>
  );
}
