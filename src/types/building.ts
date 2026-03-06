/**
 * Building Domain Types
 * @module types/building
 */

export type BuildingId = string & { readonly __brand: 'BuildingId' };
export type CapRateHistoryId = string & { readonly __brand: 'CapRateHistoryId' };

export function toBuildingId(id: string): BuildingId {
  return id as BuildingId;
}

export function toCapRateHistoryId(id: string): CapRateHistoryId {
  return id as CapRateHistoryId;
}

export type AssetTypeKey =
  | 'isOffice'
  | 'isRetail'
  | 'isHotel'
  | 'isParking'
  | 'isIndustrial'
  | 'isLogistic'
  | 'isResidential'
  | 'isHealthCare'
  | 'isOther';

export interface AssetType {
  isOffice: boolean;
  isRetail: boolean;
  isHotel: boolean;
  isParking: boolean;
  isIndustrial: boolean;
  isLogistic: boolean;
  isResidential: boolean;
  isHealthCare: boolean;
  isOther: boolean;
}

export interface Acquisition {
  acquisitionPrice: number;
  acquisitionDate: string; // YYYY-MM-DD
  initialCapRate: string;  // パーセント値
}

export interface BuildingSpec {
  address: string;
  completedMonth: number;
  completedYear: number;
  grossFloorArea: string;      // m²
  latitude: string;
  longitude: string;
  name: string;
  netLeasableAreaTotal: string; // m²
}

export interface YieldEvaluation {
  appraisedPrice: number;
  capRate: string; // パーセント値
}

export interface Transfer {
  transferDate: string | null; // YYYY-MM-DD or null
}

export interface CapRateHistory {
  id: string;
  jReitBuildingId: string;
  capRate: string;
  closingDate: string; // YYYY-MM-DD
}

export interface Leasing {
  occupancyRate: string; // パーセント値
}

export interface Financial {
  leasing: Leasing;
}

export interface Building {
  id: string;
  acquisition: Acquisition;
  buildingSpec: BuildingSpec;
  yieldEvaluation: YieldEvaluation;
  assetType: AssetType;
  transfer: Transfer;
  capRateHistories: CapRateHistory[];
  financials: Financial[];
}

export interface BuildingsData {
  jReitBuildings: Building[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface BuildingsResponse extends ApiResponse<Building[]> {
  total: number;
}

export type BuildingResponse = ApiResponse<Building | null>;

export interface RangeFilter {
  min: string;
  max: string;
}

export interface SearchFilters {
  keyword: string;
  assetTypes: AssetTypeKey[];
  occupancyRate: RangeFilter;
  appraisalPrice: RangeFilter;
  capRate: RangeFilter;
}

export interface SearchResult {
  buildings: Building[];
  total: number;
  filters: SearchFilters;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface FormattedChartDataPoint extends ChartDataPoint {
  displayDate: string;
}

export interface BuildingStats {
  totalBuildings: number;
  avgCapRate: number;
  avgOccupancyRate: number;
  assetTypeDistribution: Record<AssetTypeKey, number>;
}

export interface SelectionState {
  selectedId: string | null;
  detailId: string | null;
}

export interface SearchState {
  filters: SearchFilters;
  hasSearched: boolean;
  isLoading: boolean;
  error: string | null;
}

export function isBuilding(obj: unknown): obj is Building {
  if (typeof obj !== 'object' || obj === null) return false;
  const building = obj as Partial<Building>;
  return (
    typeof building.id === 'string' &&
    typeof building.buildingSpec === 'object' &&
    building.buildingSpec !== null &&
    typeof building.buildingSpec.name === 'string'
  );
}

export function isAssetTypeKey(key: string): key is AssetTypeKey {
  return [
    'isOffice',
    'isRetail',
    'isHotel',
    'isParking',
    'isIndustrial',
    'isLogistic',
    'isResidential',
    'isHealthCare',
    'isOther',
  ].includes(key);
}
