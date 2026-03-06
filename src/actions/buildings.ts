'use server';

import buildingsData from '@/mocks/buildings.json';
import type { Building, SearchFilters, BuildingsResponse, RangeFilter } from '@/types';
import { filterBuildings, ERROR_MESSAGES } from '@/lib';

function isRangeFilterActive(range: RangeFilter): boolean {
  return range.min !== '' || range.max !== '';
}

function hasActiveFilters(filters: SearchFilters): boolean {
  return (
    filters.keyword !== '' ||
    filters.assetTypes.length > 0 ||
    isRangeFilterActive(filters.occupancyRate) ||
    isRangeFilterActive(filters.appraisalPrice) ||
    isRangeFilterActive(filters.capRate)
  );
}

export async function fetchBuildings(
  filters?: SearchFilters
): Promise<BuildingsResponse> {
  try {
    const buildings = buildingsData.data.jReitBuildings as Building[];

    if (!filters || !hasActiveFilters(filters)) {
      return {
        success: true,
        data: buildings,
        total: buildings.length,
      };
    }

    const filtered = filterBuildings(buildings, filters);

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
      error: error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC,
    };
  }
}

