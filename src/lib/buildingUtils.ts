import type {
  Building,
  SearchFilters,
  ChartDataPoint,
  AssetTypeKey,
  RangeFilter,
} from '@/types';
import { ASSET_TYPE_LABELS, ASSET_TYPE_KEYS, FORMAT } from './constants';

export { ASSET_TYPE_LABELS, ASSET_TYPE_KEYS };
export type { SearchFilters, AssetTypeKey };

function isRangeFilterActive(range: RangeFilter): boolean {
  return range.min !== '' || range.max !== '';
}

function matchesRangeFilter(value: number, range: RangeFilter): boolean {
  const min = range.min !== '' ? parseFloat(range.min) : null;
  const max = range.max !== '' ? parseFloat(range.max) : null;

  if (min !== null && isNaN(min)) return true;
  if (max !== null && isNaN(max)) return true;

  if (min !== null && value < min) return false;
  if (max !== null && value > max) return false;

  return true;
}

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

    // 稼働率フィルター
    if (isRangeFilterActive(filters.occupancyRate)) {
      const latestOccupancy = building.financials.length > 0
        ? parseFloat(building.financials[building.financials.length - 1].leasing.occupancyRate)
        : 0;
      if (!matchesRangeFilter(latestOccupancy, filters.occupancyRate)) {
        return false;
      }
    }

    // 最新鑑定評価額フィルター（百万円単位）
    if (isRangeFilterActive(filters.appraisalPrice)) {
      const priceInMillion = building.yieldEvaluation.appraisedPrice / 1000000;
      if (!matchesRangeFilter(priceInMillion, filters.appraisalPrice)) {
        return false;
      }
    }

    // キャップレートフィルター
    if (isRangeFilterActive(filters.capRate)) {
      const capRate = parseFloat(building.yieldEvaluation.capRate);
      if (!matchesRangeFilter(capRate, filters.capRate)) {
        return false;
      }
    }

    return true;
  });
}

function aggregateByDate(dataPoints: { date: string; value: number }[]): ChartDataPoint[] {
  const dateMap = new Map<string, number[]>();
  dataPoints.forEach(({ date, value }) => {
    if (!dateMap.has(date)) {
      dateMap.set(date, []);
    }
    dateMap.get(date)!.push(value);
  });

  return Array.from(dateMap.entries())
    .map(([date, values]) => ({
      date,
      value: values.reduce((sum, v) => sum + v, 0) / values.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getCapRateChartData(buildings: Building[]): ChartDataPoint[] {
  if (buildings.length === 0) return [];

  const dataPoints = buildings.flatMap((building) =>
    building.capRateHistories.map((history) => ({
      date: history.closingDate,
      value: parseFloat(history.capRate),
    }))
  );

  return aggregateByDate(dataPoints);
}

export function getOccupancyRateChartData(buildings: Building[]): ChartDataPoint[] {
  if (buildings.length === 0) return [];

  const dataPoints = buildings.flatMap((building) => {
    const { capRateHistories, financials } = building;
    const minLength = Math.min(capRateHistories.length, financials.length);
    return Array.from({ length: minLength }, (_, i) => ({
      date: capRateHistories[i].closingDate,
      value: parseFloat(financials[i].leasing.occupancyRate),
    }));
  });

  return aggregateByDate(dataPoints);
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

export function formatCapRate(rate: number, decimals: number = FORMAT.CAP_RATE_DECIMALS): string {
  return `${rate.toFixed(decimals)}%`;
}

export function formatOccupancyRate(rate: number, decimals: number = FORMAT.OCCUPANCY_DECIMALS): string {
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
