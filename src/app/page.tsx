'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { SearchPanel } from '@/components/SearchPanel';
import { BuildingList } from '@/components/BuildingList';
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
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <LoadingState message="マップを読み込み中..." />
      </div>
    ),
  }
);

type TabType = 'map' | 'analysis';

export default function Home() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [detailBuildingId, setDetailBuildingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

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
        setSelectedBuildingId(null);
        setHasSearched(true);
      } else {
        setError(response.error || 'データの取得に失敗しました');
        setHasSearched(true);
      }
    });
  }, []);

  const handleReset = useCallback(() => {
    setBuildings([]);
    setSelectedBuildingId(null);
    setDetailBuildingId(null);
    setError(null);
    setHasSearched(false);
  }, []);

  const handleBuildingClick = useCallback((buildingId: string) => {
    setDetailBuildingId(buildingId);
    setSelectedBuildingId(buildingId);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailBuildingId(null);
  }, []);

  const handleMarkerClick = useCallback((buildingId: string) => {
    setSelectedBuildingId(buildingId);
  }, []);

  const handleBuildingSelect = useCallback((buildingId: string) => {
    setSelectedBuildingId(buildingId);
  }, []);

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen flex overflow-hidden bg-white">
        {/* Left Pane: 検索フィルター - 280px fixed */}
        <aside className="w-[280px] flex-shrink-0 flex flex-col border-r border-[#E0E0E0]">
          <div className="flex-1 flex flex-col p-6">
            <SearchPanel
              onSearch={handleSearch}
              onReset={handleReset}
              isLoading={isPending}
            />
          </div>

          {error && (
            <div className="mx-6 mb-6 p-3 bg-red-50 border border-red-100 rounded">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </aside>

        {/* Middle Pane: 検索結果リスト - 340px fixed */}
        <div className="w-[340px] flex-shrink-0 flex flex-col border-r border-[#E0E0E0] overflow-hidden">
          {isPending ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingState message="検索中..." />
            </div>
          ) : (
            <BuildingList
              buildings={buildings}
              selectedId={selectedBuildingId}
              onBuildingClick={handleBuildingClick}
              onBuildingSelect={handleBuildingSelect}
              hasSearched={hasSearched}
            />
          )}
        </div>

        {/* Right Pane: メインコンテンツ（マップ/分析） - flex: 1 */}
        <main className="flex-1 relative min-w-0">
          {/* セグメンテッドコントロール（オーバーレイ） */}
          <div className="absolute top-4 right-4 z-10">
            <div className="flex bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'map'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                地図
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'analysis'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                分析
              </button>
            </div>
          </div>

          {/* コンテンツエリア */}
          <div className="h-full w-full">
            {activeTab === 'map' ? (
              <ErrorBoundary
                fallback={
                  <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <p className="text-sm text-[#757575]">マップの読み込みに失敗しました</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-sm text-[#2F54EB] hover:underline"
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
                  onMarkerClick={handleMarkerClick}
                />
              </ErrorBoundary>
            ) : (
              <div className="h-full p-6 overflow-auto bg-gray-50">
                <AnalyticsPanel buildings={buildings} />
              </div>
            )}
          </div>
        </main>

        {/* 詳細モーダル */}
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
