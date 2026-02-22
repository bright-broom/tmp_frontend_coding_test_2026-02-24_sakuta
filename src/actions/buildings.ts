'use server';

import buildingsData from '@/mocks/buildings.json';
import type { Building, SearchFilters, AssetTypeKey } from '@/types';

export interface BuildingsResponse {
  success: boolean;
  data: Building[];
  error?: string;
  total: number;
}

const SIMULATED_DELAY = 0;

async function delay(ms: number): Promise<void> {
  if (ms > 0) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export async function fetchBuildings(
  filters?: SearchFilters
): Promise<BuildingsResponse> {
  try {
    await delay(SIMULATED_DELAY);

    const buildings = buildingsData.data.jReitBuildings as Building[];

    if (!filters || (!filters.keyword && filters.assetTypes.length === 0)) {
      return {
        success: true,
        data: buildings,
        total: buildings.length,
      };
    }

    const filtered = buildings.filter((building) => {
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const nameMatch = building.buildingSpec.name.toLowerCase().includes(keyword);
        const addressMatch = building.buildingSpec.address.toLowerCase().includes(keyword);
        if (!nameMatch && !addressMatch) {
          return false;
        }
      }

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

