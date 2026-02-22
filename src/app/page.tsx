'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { SearchPanel } from '@/components/SearchPanel';
import { BuildingList } from '@/components/BuildingList';
import { StatsPanel } from '@/components/StatsPanel';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { filterBuildings, type SearchFilters } from '@/lib/buildingUtils';
import buildingsData from '@/mocks/buildings.json';
import type { JReitBuilding } from '@/mocks/buildings.type';

const BuildingMap = dynamic(
  () => import('@/components/BuildingMap').then((mod) => mod.BuildingMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">マップを読み込み中...</p>
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
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const filteredBuildings = useMemo(() => {
    if (!hasSearched) return [];
    return filterBuildings(buildings, filters);
  }, [filters, hasSearched]);


  const handleSearch = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setHasSearched(true);
    setSelectedBuildingId(null);
    if (newFilters.keyword || newFilters.assetTypes.length > 0) {
      setShowAnalytics(true);
    }
  }, []);

  const handleBuildingSelect = useCallback((buildingId: string) => {
    setSelectedBuildingId((prev) => (prev === buildingId ? null : buildingId));
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--background)]">
      {/* Left Panel - Fixed Width Sidebar */}
      <aside className="w-[var(--sidebar-width)] flex-shrink-0 flex flex-col border-r border-[var(--border)] bg-white">
        {/* Header */}
        <header className="h-[var(--header-height)] flex items-center px-6 border-b border-[var(--border-light)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">J-REIT Analytics</h1>
              <p className="text-xs text-gray-500">建物検索・分析システム</p>
            </div>
          </div>
        </header>

        {/* Search Panel */}
        <div className="p-5 border-b border-[var(--border-light)]">
          <SearchPanel onSearch={handleSearch} />
        </div>

        {/* Results Section */}
        <div className="flex-1 flex flex-col min-h-0">
          {hasSearched && (
            <>
              {/* Stats Summary */}
              <div className="px-5 py-4 border-b border-[var(--border-light)]">
                <StatsPanel buildings={filteredBuildings} />
              </div>

              {/* Building List */}
              <div className="flex-1 overflow-hidden">
                <BuildingList
                  buildings={filteredBuildings}
                  selectedId={selectedBuildingId}
                  onSelect={handleBuildingSelect}
                />
              </div>
            </>
          )}

          {!hasSearched && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-xs">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">建物を検索</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  キーワードやアセットタイプで建物を検索し、地図上で確認できます
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Right Panel - Map & Analytics */}
      <main className="flex-1 flex flex-col min-w-0 p-4 gap-4">
        {/* Map Container */}
        <div className="flex-1 min-h-0 card overflow-hidden">
          <BuildingMap
            buildings={filteredBuildings}
            selectedId={selectedBuildingId}
            onMarkerClick={handleBuildingSelect}
          />
        </div>

        {/* Analytics Panel - Collapsible */}
        {hasSearched && filteredBuildings.length > 0 && (
          <AnalyticsPanel
            buildings={filteredBuildings}
            isExpanded={showAnalytics}
            onToggle={() => setShowAnalytics(!showAnalytics)}
          />
        )}
      </main>
    </div>
  );
}
