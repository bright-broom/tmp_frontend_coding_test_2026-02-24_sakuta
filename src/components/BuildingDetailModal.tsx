'use client';

import { useEffect, useCallback, useState } from 'react';
import type { Building } from '@/types';
import {
  formatPrice,
  formatArea,
  formatDateJP,
  getAssetTypeLabels,
} from '@/lib';
import { useFocusTrap } from '@/hooks';

interface BuildingDetailModalProps {
  building: Building | null;
  onClose: () => void;
}

export function BuildingDetailModal({ building, onClose }: BuildingDetailModalProps) {
  const focusTrapRef = useFocusTrap<HTMLDivElement>(!!building);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  }, [onClose]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
  }, [handleClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [handleEscape]);

  if (!building) return null;

  const assetTypes = getAssetTypeLabels(building.assetType);
  const latestOccupancy = building.financials.length > 0
    ? parseFloat(building.financials[building.financials.length - 1].leasing.occupancyRate)
    : null;

  return (
    <div
      ref={focusTrapRef}
      className={`fixed inset-0 z-modal flex items-center justify-center p-4 ${isClosing ? 'pointer-events-none' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="building-detail-title"
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'animate-fade-in'}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden transition-all duration-200 ${isClosing ? 'opacity-0 scale-95' : 'animate-slide-in-up'}`}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h2 id="building-detail-title" className="text-lg font-bold text-gray-900 truncate mb-1">
              {building.buildingSpec.name}
            </h2>
            <p className="text-sm text-gray-500">{building.buildingSpec.address}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 text-gray-400 hover:text-gray-600"
            aria-label="閉じる (Escキー)"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Asset Type Badges */}
          <div className="flex flex-wrap gap-2">
            {assetTypes.map((type) => (
              <span
                key={type}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded"
              >
                {type}
              </span>
            ))}
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {building.yieldEvaluation.capRate}%
              </div>
              <div className="text-xs text-gray-500 mt-1">最新CR</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {latestOccupancy ? `${latestOccupancy}%` : '-'}
              </div>
              <div className="text-xs text-gray-500 mt-1">最新稼働率</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {building.acquisition.initialCapRate}%
              </div>
              <div className="text-xs text-gray-500 mt-1">取得時CR</div>
            </div>
          </div>

          <div className="space-y-4">
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                取得情報
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-gray-500">取得価格</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                    {formatPrice(building.acquisition.acquisitionPrice)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">取得日</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                    {formatDateJP(building.acquisition.acquisitionDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">取得時キャップレート</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                    {building.acquisition.initialCapRate}%
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">譲渡日</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                    {building.transfer.transferDate
                      ? formatDateJP(building.transfer.transferDate)
                      : '未譲渡'}
                  </dd>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                評価情報
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-gray-500">最新鑑定評価額</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                    {formatPrice(building.yieldEvaluation.appraisedPrice)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">最新キャップレート</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                    {building.yieldEvaluation.capRate}%
                  </dd>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                建物仕様
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-gray-500">竣工</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                    {building.buildingSpec.completedYear}年{building.buildingSpec.completedMonth}月
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">延床面積</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                    {formatArea(building.buildingSpec.grossFloorArea)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">貸付可能面積</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                    {formatArea(building.buildingSpec.netLeasableAreaTotal)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">所在地</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                    {building.buildingSpec.address}
                  </dd>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                データ履歴
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-gray-500">CR履歴データ数</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                    {building.capRateHistories.length}件
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">決算データ数</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                    {building.financials.length}件
                  </dd>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent border-t border-gray-100 px-6 py-4">
          <button
            onClick={handleClose}
            className="w-full py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            閉じる
            <kbd className="ml-2 px-1.5 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded">Esc</kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
