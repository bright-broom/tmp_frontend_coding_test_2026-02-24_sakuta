'use client';

import { useState } from 'react';
import type { SearchFilters, AssetTypeKey } from '@/lib/buildingUtils';
import { ASSET_TYPE_LABELS } from '@/lib/buildingUtils';

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
}

const ASSET_TYPE_KEYS = Object.keys(ASSET_TYPE_LABELS) as AssetTypeKey[];

export function SearchForm({ onSearch }: SearchFormProps) {
  const [keyword, setKeyword] = useState('');
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<AssetTypeKey[]>([]);

  const handleAssetTypeChange = (assetType: AssetTypeKey) => {
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
    onSearch({ keyword: '', assetTypes: [] });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4" suppressHydrationWarning>
      <h2 className="text-lg font-semibold mb-4 text-gray-800">建物検索</h2>

      <div className="mb-4">
        <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
          キーワード（建物名・住所）
        </label>
        <input
          type="text"
          id="keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="例: 渋谷、オフィス"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          suppressHydrationWarning
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          アセットタイプ
        </label>
        <div className="flex flex-wrap gap-2">
          {ASSET_TYPE_KEYS.map((assetType) => (
            <label
              key={assetType}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                selectedAssetTypes.includes(assetType)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedAssetTypes.includes(assetType)}
                onChange={() => handleAssetTypeChange(assetType)}
                className="sr-only"
              />
              {ASSET_TYPE_LABELS[assetType]}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium"
        >
          検索
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
        >
          クリア
        </button>
      </div>
    </form>
  );
}
