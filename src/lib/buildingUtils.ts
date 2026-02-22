import type { JReitBuilding } from '@/mocks/buildings.type';

export type AssetTypeKey = keyof JReitBuilding['assetType'];

export const ASSET_TYPE_LABELS: Record<AssetTypeKey, string> = {
  isOffice: 'オフィス',
  isRetail: '商業施設',
  isHotel: 'ホテル',
  isParking: '駐車場',
  isIndustrial: '工場',
  isLogistic: '物流施設',
  isResidential: '住宅',
  isHealthCare: '医療施設',
  isOther: 'その他',
};

export interface SearchFilters {
  keyword: string;
  assetTypes: AssetTypeKey[];
}

export function filterBuildings(
  buildings: JReitBuilding[],
  filters: SearchFilters
): JReitBuilding[] {
  return buildings.filter((building) => {
    // Keyword search (name or address)
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      const nameMatch = building.buildingSpec.name.toLowerCase().includes(keyword);
      const addressMatch = building.buildingSpec.address.toLowerCase().includes(keyword);
      if (!nameMatch && !addressMatch) {
        return false;
      }
    }

    // Asset type filter
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

export interface ChartDataPoint {
  date: string;
  value: number;
}

export function getCapRateChartData(buildings: JReitBuilding[]): ChartDataPoint[] {
  if (buildings.length === 0) return [];

  // Collect all cap rate histories with dates
  const allHistories: { date: string; capRate: number }[] = [];

  buildings.forEach((building) => {
    building.capRateHistories.forEach((history) => {
      allHistories.push({
        date: history.closingDate,
        capRate: parseFloat(history.capRate),
      });
    });
  });

  // Group by date and calculate average
  const dateMap = new Map<string, number[]>();
  allHistories.forEach(({ date, capRate }) => {
    if (!dateMap.has(date)) {
      dateMap.set(date, []);
    }
    dateMap.get(date)!.push(capRate);
  });

  // Calculate averages and sort by date
  const chartData: ChartDataPoint[] = Array.from(dateMap.entries())
    .map(([date, rates]) => ({
      date,
      value: rates.reduce((sum, rate) => sum + rate, 0) / rates.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return chartData;
}

export function getOccupancyRateChartData(buildings: JReitBuilding[]): ChartDataPoint[] {
  if (buildings.length === 0) return [];

  // Collect all occupancy rates with dates from capRateHistories
  const allData: { date: string; occupancyRate: number }[] = [];

  buildings.forEach((building) => {
    const { capRateHistories, financials } = building;

    // Match financials with capRateHistories by index
    // Only include indices where both exist
    const minLength = Math.min(capRateHistories.length, financials.length);

    for (let i = 0; i < minLength; i++) {
      allData.push({
        date: capRateHistories[i].closingDate,
        occupancyRate: parseFloat(financials[i].leasing.occupancyRate),
      });
    }
  });

  // Group by date and calculate average
  const dateMap = new Map<string, number[]>();
  allData.forEach(({ date, occupancyRate }) => {
    if (!dateMap.has(date)) {
      dateMap.set(date, []);
    }
    dateMap.get(date)!.push(occupancyRate);
  });

  // Calculate averages and sort by date
  const chartData: ChartDataPoint[] = Array.from(dateMap.entries())
    .map(([date, rates]) => ({
      date,
      value: rates.reduce((sum, rate) => sum + rate, 0) / rates.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return chartData;
}

export function calculateAverage(data: ChartDataPoint[]): number {
  if (data.length === 0) return 0;
  return data.reduce((sum, point) => sum + point.value, 0) / data.length;
}

export function formatDate(dateString: string): string {
  const [year, month] = dateString.split('-');
  return `${year}/${month}`;
}
