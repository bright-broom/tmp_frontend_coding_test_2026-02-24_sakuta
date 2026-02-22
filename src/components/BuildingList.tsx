'use client';

import type { JReitBuilding } from '@/mocks/buildings.type';
import { ASSET_TYPE_LABELS, type AssetTypeKey } from '@/lib/buildingUtils';

interface BuildingListProps {
  buildings: JReitBuilding[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDetail?: (id: string) => void;
}

function getAssetTypeLabels(assetType: JReitBuilding['assetType']): string[] {
  return (Object.keys(assetType) as AssetTypeKey[])
    .filter((key) => assetType[key])
    .map((key) => ASSET_TYPE_LABELS[key]);
}

export function BuildingList({ buildings, selectedId, onSelect, onDetail }: BuildingListProps) {
  if (buildings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">該当する建物がありません</p>
          <p className="text-xs text-gray-400 mt-1">検索条件を変更してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-3 py-2">
        {buildings.map((building, index) => {
          const isSelected = building.id === selectedId;
          const assetTypes = getAssetTypeLabels(building.assetType);

          return (
            <div
              key={building.id}
              className={`
                p-3 rounded-lg mb-1.5 transition-all duration-150
                ${isSelected
                  ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                  : 'bg-white border border-transparent hover:bg-gray-50 hover:border-gray-100'
                }
              `}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <button
                onClick={() => onSelect(building.id)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-3">
                  {/* Building Number */}
                  <div className={`
                    w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-semibold
                    ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}
                  `}>
                    {index + 1}
                  </div>

                  {/* Building Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {building.buildingSpec.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {building.buildingSpec.address}
                    </p>

                    {/* Asset Type Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {assetTypes.slice(0, 2).map((type) => (
                        <span
                          key={type}
                          className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded"
                        >
                          {type}
                        </span>
                      ))}
                      {assetTypes.length > 2 && (
                        <span className="inline-block px-1.5 py-0.5 text-[10px] text-gray-400">
                          +{assetTypes.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cap Rate */}
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-semibold ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                      {building.yieldEvaluation.capRate}%
                    </div>
                    <div className="text-[10px] text-gray-400">CR</div>
                  </div>
                </div>
              </button>

              {/* Detail Button - Show on selection */}
              {isSelected && onDetail && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDetail(building.id);
                  }}
                  className="mt-2 w-full py-1.5 text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors flex items-center justify-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  詳細を見る
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
