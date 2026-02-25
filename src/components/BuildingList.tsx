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

const ITEM_HEIGHT = 168;

// Memoized building card component
const BuildingCard = memo(function BuildingCard({
  building,
  isSelected,
  onSelect,
  onClick,
}: {
  building: Building;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}) {
  const assetTypes = getAssetTypeLabels(building.assetType);
  const latestOccupancy =
    building.financials.length > 0
      ? building.financials[building.financials.length - 1].leasing.occupancyRate
      : '-';

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

  return (
    <div
      className={`mx-4 py-4 border-b border-[#E0E0E0] cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 -mx-0 px-4' : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
      role="option"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onKeyDown={handleKeyDown}
    >
      {/* ヘッダー部: タイトル + 外部リンクアイコン */}
      <div className="mb-1">
        <button
          onClick={handleClick}
          className="text-[#2F54EB] hover:underline font-medium text-sm flex items-center gap-1 text-left focus-ring rounded"
          aria-label={`${building.buildingSpec.name}の詳細を開く`}
        >
          {building.buildingSpec.name}
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </button>
      </div>

      {/* サブタイトル: 建物アイコン + アセットタイプ */}
      <div className="flex items-center gap-1.5 text-xs text-[#757575] mb-3">
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <span>{assetTypes[0] || 'その他'}</span>
      </div>

      {/* データ明細部（2カラムGrid） */}
      <dl className="grid grid-cols-2 gap-y-1.5 text-xs">
        <dt className="text-[#757575]">初回取得日</dt>
        <dd className="text-[#333333]">
          {formatDate(building.acquisition.acquisitionDate)}
        </dd>

        <dt className="text-[#757575]">最新鑑定CR</dt>
        <dd className="text-[#333333]">{building.yieldEvaluation.capRate}%</dd>

        <dt className="text-[#757575]">最新鑑定評価額</dt>
        <dd className="text-[#333333]">
          {formatPriceInOku(building.yieldEvaluation.appraisedPrice)}
        </dd>

        <dt className="text-[#757575]">現在の稼働率</dt>
        <dd className="text-[#333333]">{latestOccupancy}%</dd>
      </dl>
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
          <svg
            className="w-12 h-12 text-[#E0E0E0] mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p className="text-[#757575] text-sm">
            {hasSearched ? '検索条件に一致する建物がありません' : '左のパネルから検索してください'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full overflow-y-auto"
      role="listbox"
      aria-label={`建物リスト (${buildings.length}件)`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
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
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
