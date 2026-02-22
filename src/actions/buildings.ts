'use server';

import buildingsData from '@/mocks/buildings.json';
import type { JReitBuilding } from '@/mocks/buildings.type';
import type { SearchFilters, AssetTypeKey } from '@/lib/buildingUtils';

export interface BuildingsResponse {
  success: boolean;
  data: JReitBuilding[];
  error?: string;
  total: number;
}

export interface BuildingResponse {
  success: boolean;
  data: JReitBuilding | null;
  error?: string;
}

// Simulated delay for realistic loading states
const SIMULATED_DELAY = 0; // Set to 0 for production, increase for testing loading states

async function delay(ms: number): Promise<void> {
  if (ms > 0) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Fetch all buildings with optional filtering
 */
export async function fetchBuildings(
  filters?: SearchFilters
): Promise<BuildingsResponse> {
  try {
    await delay(SIMULATED_DELAY);

    const buildings = buildingsData.data.jReitBuildings as JReitBuilding[];

    if (!filters || (!filters.keyword && filters.assetTypes.length === 0)) {
      return {
        success: true,
        data: buildings,
        total: buildings.length,
      };
    }

    const filtered = buildings.filter((building) => {
      // Keyword search
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
          (assetType: AssetTypeKey) => building.assetType[assetType]
        );
        if (!hasMatchingType) {
          return false;
        }
      }

      return true;
    });

    return {
      success: true,
      data: filtered,
      total: filtered.length,
    };
  } catch (error) {
    console.error('Error fetching buildings:', error);
    return {
      success: false,
      data: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Fetch a single building by ID
 */
export async function fetchBuildingById(id: string): Promise<BuildingResponse> {
  try {
    await delay(SIMULATED_DELAY);

    const buildings = buildingsData.data.jReitBuildings as JReitBuilding[];
    const building = buildings.find((b) => b.id === id);

    if (!building) {
      return {
        success: false,
        data: null,
        error: 'Building not found',
      };
    }

    return {
      success: true,
      data: building,
    };
  } catch (error) {
    console.error('Error fetching building:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get building statistics
 */
export async function fetchBuildingStats(): Promise<{
  success: boolean;
  data: {
    totalBuildings: number;
    avgCapRate: number;
    avgOccupancyRate: number;
    assetTypeDistribution: Record<string, number>;
  } | null;
  error?: string;
}> {
  try {
    await delay(SIMULATED_DELAY);

    const buildings = buildingsData.data.jReitBuildings as JReitBuilding[];

    const totalBuildings = buildings.length;

    const totalCapRate = buildings.reduce(
      (sum, b) => sum + parseFloat(b.yieldEvaluation.capRate),
      0
    );
    const avgCapRate = totalCapRate / totalBuildings;

    const occupancyRates = buildings
      .filter((b) => b.financials.length > 0)
      .map((b) => parseFloat(b.financials[b.financials.length - 1].leasing.occupancyRate));
    const avgOccupancyRate = occupancyRates.length > 0
      ? occupancyRates.reduce((sum, rate) => sum + rate, 0) / occupancyRates.length
      : 0;

    const assetTypeKeys: AssetTypeKey[] = [
      'isOffice', 'isRetail', 'isHotel', 'isParking',
      'isIndustrial', 'isLogistic', 'isResidential', 'isHealthCare', 'isOther'
    ];

    const assetTypeDistribution: Record<string, number> = {};
    assetTypeKeys.forEach((key) => {
      assetTypeDistribution[key] = buildings.filter((b) => b.assetType[key]).length;
    });

    return {
      success: true,
      data: {
        totalBuildings,
        avgCapRate,
        avgOccupancyRate,
        assetTypeDistribution,
      },
    };
  } catch (error) {
    console.error('Error fetching building stats:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
