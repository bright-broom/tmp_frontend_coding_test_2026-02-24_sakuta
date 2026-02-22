'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SearchForm } from '@/components/SearchForm';
import { CapRateChart } from '@/components/CapRateChart';
import { OccupancyRateChart } from '@/components/OccupancyRateChart';
import { filterBuildings, type SearchFilters } from '@/lib/buildingUtils';
import buildingsData from '@/mocks/buildings.json';
import type { JReitBuilding } from '@/mocks/buildings.type';

// Dynamic import for map component (Leaflet requires browser window)
const BuildingMap = dynamic(
  () => import('@/components/BuildingMap').then((mod) => mod.BuildingMap),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">検索結果マップ</h2>
        </div>
        <div className="h-[400px] flex items-center justify-center text-gray-500">
          マップを読み込み中...
        </div>
      </div>
    ),
  }
);

const buildings = buildingsData.data.jReitBuildings as JReitBuilding[];

export default function Home() {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    assetTypes: [],
  });
  const [hasSearched, setHasSearched] = useState(false);

  const filteredBuildings = useMemo(() => {
    if (!hasSearched) return [];
    return filterBuildings(buildings, filters);
  }, [filters, hasSearched]);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">J-REIT 建物検索</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <SearchForm onSearch={handleSearch} />

            {hasSearched && (
              <div className="mt-4 bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">検索結果</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredBuildings.length}
                  <span className="text-sm font-normal text-gray-500 ml-1">件</span>
                </p>
              </div>
            )}
          </div>

          {/* Map Panel */}
          <div className="lg:col-span-2">
            {hasSearched ? (
              <BuildingMap buildings={filteredBuildings} />
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">検索結果マップ</h2>
                </div>
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                  検索を実行してください
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        {hasSearched && filteredBuildings.length > 0 && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CapRateChart buildings={filteredBuildings} />
            <OccupancyRateChart buildings={filteredBuildings} />
          </div>
        )}

        {/* No Results Message */}
        {hasSearched && filteredBuildings.length === 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              条件に一致する建物が見つかりませんでした。
              <br />
              検索条件を変更してお試しください。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
