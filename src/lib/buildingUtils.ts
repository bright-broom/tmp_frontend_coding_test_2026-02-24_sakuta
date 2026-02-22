/**
 * Building Utilities - 建物データ処理ユーティリティ
 * @module lib/buildingUtils
 */

import type {
  Building,
  SearchFilters,
  ChartDataPoint,
  AssetTypeKey,
} from '@/types';
import { ASSET_TYPE_LABELS, ASSET_TYPE_KEYS, FORMAT } from './constants';

export { ASSET_TYPE_LABELS, ASSET_TYPE_KEYS };
export type { SearchFilters, AssetTypeKey };

export function filterBuildings(
  buildings: Building[],
  filters: SearchFilters
): Building[] {
  return buildings.filter((building) => {
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      const nameMatch = building.buildingSpec.name.toLowerCase().includes(keyword);
      const addressMatch = building.buildingSpec.address.toLowerCase().includes(keyword);
      if (!nameMatch && !addressMatch) {
        return false;
      }
    }

    // OR条件: いずれかのアセットタイプに一致すればOK
    if (filters.assetTypes.length > 0) {
      const hasMatchingType = filters.assetTypes.some(
        (assetType) => building.assetType[assetType]
      );
      if (!hasMatchingType) {
        return false;
      }
    }

    return true;
  });
}

export function getCapRateChartData(buildings: Building[]): ChartDataPoint[] {
  if (buildings.length === 0) return [];

  const allHistories: { date: string; capRate: number }[] = [];
  buildings.forEach((building) => {
    building.capRateHistories.forEach((history) => {
      allHistories.push({
        date: history.closingDate,
        capRate: parseFloat(history.capRate),
      });
    });
  });

  const dateMap = new Map<string, number[]>();
  allHistories.forEach(({ date, capRate }) => {
    if (!dateMap.has(date)) {
      dateMap.set(date, []);
    }
    dateMap.get(date)!.push(capRate);
  });

  return Array.from(dateMap.entries())
    .map(([date, rates]) => ({
      date,
      value: rates.reduce((sum, rate) => sum + rate, 0) / rates.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getOccupancyRateChartData(buildings: Building[]): ChartDataPoint[] {
  if (buildings.length === 0) return [];

  const allData: { date: string; occupancyRate: number }[] = [];
  buildings.forEach((building) => {
    const { capRateHistories, financials } = building;
    // financialsには日付がないため、capRateHistoriesの日付を使用
    const minLength = Math.min(capRateHistories.length, financials.length);
    for (let i = 0; i < minLength; i++) {
      allData.push({
        date: capRateHistories[i].closingDate,
        occupancyRate: parseFloat(financials[i].leasing.occupancyRate),
      });
    }
  });

  const dateMap = new Map<string, number[]>();
  allData.forEach(({ date, occupancyRate }) => {
    if (!dateMap.has(date)) {
      dateMap.set(date, []);
    }
    dateMap.get(date)!.push(occupancyRate);
  });

  return Array.from(dateMap.entries())
    .map(([date, rates]) => ({
      date,
      value: rates.reduce((sum, rate) => sum + rate, 0) / rates.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateAverage(data: ChartDataPoint[]): number {
  if (data.length === 0) return 0;
  return data.reduce((sum, point) => sum + point.value, 0) / data.length;
}

export function formatDate(dateString: string): string {
  const [year, month] = dateString.split('-');
  return `${year}/${month}`;
}

export function formatDateJP(dateString: string | null): string {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${year}年${parseInt(month)}月${parseInt(day)}日`;
}

export function formatPrice(price: number): string {
  if (price >= 100000000) {
    const oku = Math.floor(price / 100000000);
    const man = Math.floor((price % 100000000) / 10000);
    if (man > 0) {
      return `${oku}億${man.toLocaleString()}万円`;
    }
    return `${oku}億円`;
  }
  if (price >= 10000) {
    return `${Math.floor(price / 10000).toLocaleString()}万円`;
  }
  return `${price.toLocaleString()}円`;
}

export function formatArea(area: string): string {
  const num = parseFloat(area);
  return `${num.toLocaleString()} m²`;
}

export function formatCapRate(rate: number, decimals = FORMAT.CAP_RATE_DECIMALS): string {
  return `${rate.toFixed(decimals)}%`;
}

export function formatOccupancyRate(rate: number, decimals = FORMAT.OCCUPANCY_DECIMALS): string {
  return `${rate.toFixed(decimals)}%`;
}

export function getAssetTypeLabels(assetType: Building['assetType']): string[] {
  return ASSET_TYPE_KEYS
    .filter((key) => assetType[key])
    .map((key) => ASSET_TYPE_LABELS[key]);
}

export function countAssetTypes(assetType: Building['assetType']): number {
  return ASSET_TYPE_KEYS.filter((key) => assetType[key]).length;
}
