'use client';

import { useState, useMemo, useCallback, useTransition, memo } from 'react';
import dynamic from 'next/dynamic';
import { SearchPanel } from '@/components/SearchPanel';
import { BuildingList } from '@/components/BuildingList';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { BuildingDetailModal } from '@/components/BuildingDetailModal';
import { ErrorBoundary, LoadingState } from '@/components/ErrorBoundary';
import { SkipLinks } from '@/components/ui/SkipLink';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { LiveRegionProvider, useLiveRegion } from '@/components/ui/LiveRegion';
import { BuildingListSkeleton } from '@/components/ui/Skeleton';
import { fetchBuildings } from '@/actions/buildings';
import { useKeyboardShortcut } from '@/hooks';
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

// Memoized tab button component
const TabButton = memo(function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors focus-ring ${
        active
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-500 hover:bg-gray-50'
      }`}
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
    >
      {icon}
      {label}
    </button>
  );
});

function HomeContent() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [detailBuildingId, setDetailBuildingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { showToast } = useToast();
  const { announce } = useLiveRegion();

  const selectedBuilding = useMemo(() => {
    if (!detailBuildingId) return null;
    return buildings.find((b) => b.id === detailBuildingId) || null;
  }, [detailBuildingId, buildings]);

  // Keyboard shortcuts
  useKeyboardShortcut('m', () => setActiveTab('map'), { ctrl: true });
  useKeyboardShortcut('a', () => setActiveTab('analysis'), { ctrl: true });
  useKeyboardShortcut('Escape', () => setDetailBuildingId(null));

  const handleSearch = useCallback((filters: SearchFilters) => {
    setError(null);
    startTransition(async () => {
      const response = await fetchBuildings(filters);
      if (response.success) {
        setBuildings(response.data);
        setSelectedBuildingId(null);
        setHasSearched(true);
        const count = response.data.length;
        announce(`検索完了。${count}件の建物が見つかりました。`);
        if (count > 0) {
          showToast(`${count}件の建物が見つかりました`, 'success');
        } else {
          showToast('条件に一致する建物がありません', 'info');
        }
      } else {
        setError(response.error || 'データの取得に失敗しました');
        setHasSearched(true);
        showToast(response.error || 'データの取得に失敗しました', 'error');
        announce('検索に失敗しました', 'assertive');
      }
    });
  }, [announce, showToast]);

  const handleReset = useCallback(() => {
    setBuildings([]);
    setSelectedBuildingId(null);
    setDetailBuildingId(null);
    setError(null);
    setHasSearched(false);
    announce('検索結果をリセットしました');
  }, [announce]);

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
    <>
      <SkipLinks />
      <div className="h-screen w-screen flex overflow-hidden bg-white">
        {/* Left Pane: 検索フィルター - 280px fixed */}
        <aside
          id="search-panel"
          className="w-[280px] flex-shrink-0 flex flex-col border-r border-[#E0E0E0]"
          aria-label="検索フィルター"
        >
          <div className="flex-1 flex flex-col p-6">
            <SearchPanel
              onSearch={handleSearch}
              onReset={handleReset}
              isLoading={isPending}
            />
          </div>

          {error && (
            <div
              className="mx-6 mb-6 p-3 bg-red-50 border border-red-100 rounded"
              role="alert"
              aria-live="polite"
            >
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </aside>

        {/* Middle Pane: 検索結果リスト - 340px fixed */}
        <section
          id="building-list"
          className="w-[340px] flex-shrink-0 flex flex-col border-r border-[#E0E0E0] overflow-hidden"
          aria-label="検索結果"
        >
          {isPending ? (
            <BuildingListSkeleton count={5} />
          ) : (
            <BuildingList
              buildings={buildings}
              selectedId={selectedBuildingId}
              onBuildingClick={handleBuildingClick}
              onBuildingSelect={handleBuildingSelect}
              hasSearched={hasSearched}
            />
          )}
        </section>

        {/* Right Pane: メインコンテンツ（マップ/分析） - flex: 1 */}
        <main id="main-content" className="flex-1 relative min-w-0" aria-label="メインコンテンツ">
          {/* セグメンテッドコントロール（オーバーレイ） */}
          <div className="absolute top-4 right-4 z-10">
            <div
              className="flex bg-white rounded-lg shadow-md overflow-hidden"
              role="tablist"
              aria-label="表示切り替え"
            >
              <TabButton
                active={activeTab === 'map'}
                onClick={() => setActiveTab('map')}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                }
                label="地図"
              />
              <TabButton
                active={activeTab === 'analysis'}
                onClick={() => setActiveTab('analysis')}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                label="分析"
              />
            </div>
          </div>

          {/* コンテンツエリア */}
          <div
            className="h-full w-full"
            role="tabpanel"
            aria-label={activeTab === 'map' ? '地図表示' : '分析グラフ'}
          >
            {activeTab === 'map' ? (
              <ErrorBoundary
                fallback={
                  <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <p className="text-sm text-[#757575]">マップの読み込みに失敗しました</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-sm text-[#2F54EB] hover:underline focus-ring"
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
    </>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <LiveRegionProvider>
          <HomeContent />
        </LiveRegionProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
