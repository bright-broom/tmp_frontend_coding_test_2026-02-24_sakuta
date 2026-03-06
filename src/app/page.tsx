'use client';

import { useState, useMemo, useCallback, useTransition, memo } from 'react';
import dynamic from 'next/dynamic';
import { SearchPanel } from '@/components/SearchPanel';
import { BuildingList } from '@/components/BuildingList';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { BuildingDetailModal } from '@/components/BuildingDetailModal';
import { StatsBar } from '@/components/StatsBar';
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

// App Header Component
const AppHeader = memo(function AppHeader() {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">J-REIT Building Analytics</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <kbd className="kbd">⌘</kbd><kbd className="kbd">M</kbd>
            <span className="ml-1">地図</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1">
            <kbd className="kbd">⌘</kbd><kbd className="kbd">A</kbd>
            <span className="ml-1">分析</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1">
            <kbd className="kbd">Esc</kbd>
            <span className="ml-1">閉じる</span>
          </span>
        </div>
      </div>
    </header>
  );
});

// Memoized tab button component
const TabButton = memo(function TabButton({
  active,
  onClick,
  icon,
  label,
  shortcut,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-ring ${
        active
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
      }`}
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      title={shortcut ? `キーボードショートカット: ${shortcut}` : undefined}
    >
      <span className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
        {icon}
      </span>
      {label}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full" />
      )}
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
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-50">
        {/* App Header */}
        <AppHeader />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Pane: 検索フィルター - 280px fixed */}
          <aside
            id="search-panel"
            className="w-[280px] flex-shrink-0 flex flex-col bg-white border-r border-gray-200 shadow-sm"
            aria-label="検索フィルター"
          >
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                検索フィルター
              </h2>
            </div>
            <div className="flex-1 flex flex-col p-5 overflow-y-auto custom-scrollbar">
              <SearchPanel
                onSearch={handleSearch}
                onReset={handleReset}
                isLoading={isPending}
              />
            </div>

            {error && (
              <div
                className="mx-5 mb-5 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </aside>

          {/* Middle Pane: 検索結果リスト - 360px fixed */}
          <section
            id="building-list"
            className="w-[360px] flex-shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-hidden"
            aria-label="検索結果"
          >
            {/* Stats Bar */}
            <StatsBar buildings={buildings} isLoading={isPending} hasSearched={hasSearched} />

            {/* Building List */}
            <div className="flex-1 overflow-hidden">
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
            </div>
          </section>

          {/* Right Pane: メインコンテンツ（マップ/分析） - flex: 1 */}
          <main id="main-content" className="flex-1 relative min-w-0" aria-label="メインコンテンツ">
            {/* セグメンテッドコントロール（オーバーレイ） */}
            <div className="absolute top-4 right-4 z-10">
              <div
                className="flex bg-gray-100/90 backdrop-blur-sm rounded-xl p-1 shadow-lg"
                role="tablist"
                aria-label="表示切り替え"
              >
                <TabButton
                  active={activeTab === 'map'}
                  onClick={() => setActiveTab('map')}
                  shortcut="⌘M"
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
                  shortcut="⌘A"
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
                      <div className="text-center p-8">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">マップの読み込みに失敗しました</p>
                        <button
                          onClick={() => window.location.reload()}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors focus-ring"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
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
                <div className="h-full p-6 overflow-auto bg-gray-50 custom-scrollbar">
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
