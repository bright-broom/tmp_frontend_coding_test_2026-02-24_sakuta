'use client';

import { useRef, useEffect, memo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Building } from '@/types';
import { getAssetTypeLabels, formatPrice } from '@/lib';

interface BuildingListProps {
  buildings: Building[];
  selectedId?: string | null;
  onBuildingClick?: (id: string) => void;
  onBuildingSelect?: (id: string) => void;
  hasSearched?: boolean;
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${year}/${month}/${day}`;
}

function formatPriceInOku(price: number): string {
  if (price >= 100000000) {
    const oku = Math.floor(price / 100000000);
    return `${oku}億円`;
  }
  if (price >= 10000000) {
    const man = Math.floor(price / 10000);
    return `${man.toLocaleString()}万円`;
  }
  return formatPrice(price);
}

const ITEM_HEIGHT = 180;

// Memoized building card component
const BuildingCard = memo(function BuildingCard({
  building,
  isSelected,
  onSelect,
  onClick,
  index,
}: {
  building: Building;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
  index: number;
}) {
  const assetTypes = getAssetTypeLabels(building.assetType);
  const latestOccupancy =
    building.financials.length > 0
      ? parseFloat(building.financials[building.financials.length - 1].leasing.occupancyRate)
      : null;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect();
      }
    },
    [onSelect]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick();
    },
    [onClick]
  );

  const getOccupancyColor = (rate: number | null) => {
    if (rate === null) return 'text-gray-400';
    if (rate >= 95) return 'text-emerald-600';
    if (rate >= 85) return 'text-amber-600';
    return 'text-red-500';
  };

  return (
    <div
      className={`relative mx-3 my-1.5 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 ring-2 ring-blue-400 shadow-md'
          : 'bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-100'
      }`}
      onClick={onSelect}
      role="option"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onKeyDown={handleKeyDown}
      style={{ animationDelay: `${Math.min(index * 30, 150)}ms` }}
    >
      {/* ヘッダー部 */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <button
          onClick={handleClick}
          className="text-gray-900 hover:text-blue-600 font-semibold text-sm text-left transition-colors focus-ring rounded group flex-1 min-w-0"
          aria-label={`${building.buildingSpec.name}の詳細を開く`}
        >
          <span className="line-clamp-2 group-hover:underline">{building.buildingSpec.name}</span>
        </button>
        <button
          onClick={handleClick}
          className="flex-shrink-0 px-2 py-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
          aria-label="詳細を開く"
        >
          詳細 →
        </button>
      </div>

      {/* アセットタイプバッジ */}
      <div className="mb-3">
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded">
          {assetTypes[0] || 'その他'}
        </span>
      </div>

      {/* メトリクス */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-0.5">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">CR</div>
          <div className="text-sm font-bold text-blue-600">{building.yieldEvaluation.capRate}%</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">稼働率</div>
          <div className={`text-sm font-bold ${getOccupancyColor(latestOccupancy)}`}>
            {latestOccupancy !== null ? `${latestOccupancy}%` : '-'}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">評価額</div>
          <div className="text-sm font-semibold text-gray-700">{formatPriceInOku(building.yieldEvaluation.appraisedPrice)}</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">取得日</div>
          <div className="text-sm text-gray-600">{formatDate(building.acquisition.acquisitionDate)}</div>
        </div>
      </div>

      {/* 選択インジケーター */}
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
      )}
    </div>
  );
});

export const BuildingList = memo(function BuildingList({
  buildings,
  selectedId,
  onBuildingClick,
  onBuildingSelect,
  hasSearched = false,
}: BuildingListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: buildings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  });

  // Scroll to selected building
  useEffect(() => {
    if (selectedId && parentRef.current) {
      const index = buildings.findIndex((b) => b.id === selectedId);
      if (index !== -1) {
        virtualizer.scrollToIndex(index, { align: 'center', behavior: 'smooth' });
      }
    }
  }, [selectedId, buildings, virtualizer]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!selectedId || buildings.length === 0) return;

      const currentIndex = buildings.findIndex((b) => b.id === selectedId);
      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          newIndex = Math.min(currentIndex + 1, buildings.length - 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          newIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = buildings.length - 1;
          break;
        case 'Enter':
          e.preventDefault();
          if (currentIndex >= 0) {
            onBuildingClick?.(buildings[currentIndex].id);
          }
          return;
        default:
          return;
      }

      if (newIndex !== currentIndex && newIndex >= 0) {
        onBuildingSelect?.(buildings[newIndex].id);
      }
    },
    [selectedId, buildings, onBuildingSelect, onBuildingClick]
  );

  // Empty state
  if (buildings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6" role="status">
        <div className="text-center">
          {hasSearched ? (
            <>
              <p className="text-sm text-gray-600 mb-1">結果が見つかりません</p>
              <p className="text-xs text-gray-400">条件を変更してください</p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-1">物件を検索</p>
              <p className="text-xs text-gray-400">左パネルから検索してください</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full overflow-y-auto custom-scrollbar bg-gray-50/50"
      role="listbox"
      aria-label={`建物リスト (${buildings.length}件)`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="relative py-2" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const building = buildings[virtualRow.index];
          const isSelected = building.id === selectedId;

          return (
            <div
              key={building.id}
              className="absolute top-0 left-0 right-0"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <BuildingCard
                building={building}
                isSelected={isSelected}
                onSelect={() => onBuildingSelect?.(building.id)}
                onClick={() => onBuildingClick?.(building.id)}
                index={virtualRow.index}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
