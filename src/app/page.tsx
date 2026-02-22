'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { SearchPanel } from '@/components/SearchPanel';
import { BuildingList } from '@/components/BuildingList';
import { StatsPanel } from '@/components/StatsPanel';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { BuildingDetailModal } from '@/components/BuildingDetailModal';
import { ErrorBoundary, LoadingState } from '@/components/ErrorBoundary';
import { fetchBuildings } from '@/actions/buildings';
import type { Building, SearchFilters } from '@/types';

const BuildingMap = dynamic(
  () => import('@/components/BuildingMap').then((mod) => mod.BuildingMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-xl">
        <LoadingState message="マップを読み込み中..." />
      </div>
    ),
  }
);

export default function Home() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [detailBuildingId, setDetailBuildingId] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const selectedBuilding = useMemo(() => {
    if (!detailBuildingId) return null;
    return buildings.find((b) => b.id === detailBuildingId) || null;
  }, [detailBuildingId, buildings]);

  const handleSearch = useCallback((filters: SearchFilters) => {
    setError(null);
    startTransition(async () => {
      const response = await fetchBuildings(filters);
      if (response.success) {
        setBuildings(response.data);
        setHasSearched(true);
        setSelectedBuildingId(null);
        if (filters.keyword || filters.assetTypes.length > 0) {
          setShowAnalytics(true);
        }
        // Close mobile menu after search
        setIsMobileMenuOpen(false);
      } else {
        setError(response.error || 'データの取得に失敗しました');
      }
    });
  }, []);

  const handleBuildingSelect = useCallback((buildingId: string) => {
    setSelectedBuildingId((prev) => (prev === buildingId ? null : buildingId));
  }, []);

  const handleBuildingDetail = useCallback((buildingId: string) => {
    setDetailBuildingId(buildingId);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailBuildingId(null);
  }, []);

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-[var(--background)]">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-base font-bold text-gray-900">J-REIT Analytics</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="メニュー"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </header>

        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside className={`
          fixed lg:relative inset-y-0 left-0 z-50
          w-[85vw] sm:w-[380px] lg:w-[var(--sidebar-width)]
          flex-shrink-0 flex flex-col
          border-r border-[var(--border)] bg-white
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <header className="hidden lg:flex h-[var(--header-height)] items-center px-6 border-b border-[var(--border-light)]">
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

          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">検索・フィルター</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 lg:p-5 border-b border-[var(--border-light)]">
            <SearchPanel onSearch={handleSearch} isLoading={isPending} />
          </div>

          {error && (
            <div className="mx-4 lg:mx-5 mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-0">
            {isPending && (
              <div className="flex-1 flex items-center justify-center">
                <LoadingState message="検索中..." />
              </div>
            )}

            {!isPending && hasSearched && (
              <>
                <div className="px-4 lg:px-5 py-4 border-b border-[var(--border-light)]">
                  <StatsPanel buildings={buildings} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <BuildingList
                    buildings={buildings}
                    selectedId={selectedBuildingId}
                    onSelect={handleBuildingSelect}
                    onDetail={handleBuildingDetail}
                  />
                </div>
              </>
            )}

            {!isPending && !hasSearched && (
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

        <main className="flex-1 flex flex-col min-w-0 p-2 sm:p-4 gap-2 sm:gap-4 pt-0 lg:pt-4">
          <div className="flex-1 min-h-[300px] lg:min-h-0 card overflow-hidden">
            <ErrorBoundary
              fallback={
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">マップの読み込みに失敗しました</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      再読み込み
                    </button>
                  </div>
                </div>
              }
            >
              <BuildingMap
                buildings={buildings}
                selectedId={selectedBuildingId}
                onMarkerClick={handleBuildingSelect}
              />
            </ErrorBoundary>
          </div>

          {hasSearched && buildings.length > 0 && (
            <div className="flex-shrink-0">
              <AnalyticsPanel
                buildings={buildings}
                isExpanded={showAnalytics}
                onToggle={() => setShowAnalytics(!showAnalytics)}
              />
            </div>
          )}
        </main>

        {selectedBuilding && (
          <BuildingDetailModal
            building={selectedBuilding}
            onClose={handleCloseDetail}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
