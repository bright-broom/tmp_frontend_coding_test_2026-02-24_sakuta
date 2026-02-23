'use client';

import { useRef, useEffect } from 'react';
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

export function BuildingList({
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

  // Empty state
  if (buildings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <svg
            className="w-12 h-12 text-[#E0E0E0] mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
    <div ref={parentRef} className="h-full overflow-y-auto">
      <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const building = buildings[virtualRow.index];
          const assetTypes = getAssetTypeLabels(building.assetType);
          const latestOccupancy =
            building.financials.length > 0
              ? building.financials[building.financials.length - 1].leasing.occupancyRate
              : '-';
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
              <div
                className={`mx-4 py-4 border-b border-[#E0E0E0] cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50 -mx-0 px-4' : 'hover:bg-gray-50'
                }`}
                onClick={() => onBuildingSelect?.(building.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onBuildingSelect?.(building.id);
                  }
                }}
              >
                {/* ヘッダー部: タイトル + 外部リンクアイコン */}
                <div className="mb-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuildingClick?.(building.id);
                    }}
                    className="text-[#2F54EB] hover:underline font-medium text-sm flex items-center gap-1 text-left"
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
                <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                  <div className="text-[#757575]">初回取得日</div>
                  <div className="text-[#333333]">
                    {formatDate(building.acquisition.acquisitionDate)}
                  </div>

                  <div className="text-[#757575]">最新鑑定CR</div>
                  <div className="text-[#333333]">{building.yieldEvaluation.capRate}%</div>

                  <div className="text-[#757575]">最新鑑定評価額</div>
                  <div className="text-[#333333]">
                    {formatPriceInOku(building.yieldEvaluation.appraisedPrice)}
                  </div>

                  <div className="text-[#757575]">現在の稼働率</div>
                  <div className="text-[#333333]">{latestOccupancy}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
