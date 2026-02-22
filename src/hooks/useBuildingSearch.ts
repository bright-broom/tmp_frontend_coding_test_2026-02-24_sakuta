'use client';

import { useState, useCallback, useTransition, useMemo } from 'react';
import { fetchBuildings } from '@/actions/buildings';
import type { Building, SearchFilters, SearchState } from '@/types';

export interface UseBuildingSearchReturn {
  buildings: Building[];
  state: SearchState;
  search: (filters: SearchFilters) => void;
  clear: () => void;
  updateFilters: (filters: Partial<SearchFilters>) => void;
}

const INITIAL_FILTERS: SearchFilters = {
  keyword: '',
  assetTypes: [],
};

const INITIAL_STATE: SearchState = {
  filters: INITIAL_FILTERS,
  hasSearched: false,
  isLoading: false,
  error: null,
};

export function useBuildingSearch(): UseBuildingSearchReturn {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [state, setState] = useState<SearchState>(INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  const search = useCallback((filters: SearchFilters) => {
    setState((prev) => ({
      ...prev,
      filters,
      error: null,
    }));

    startTransition(async () => {
      try {
        const response = await fetchBuildings(filters);

        if (response.success) {
          setBuildings(response.data);
          setState((prev) => ({
            ...prev,
            hasSearched: true,
            error: null,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            hasSearched: true,
            error: response.error || 'データの取得に失敗しました',
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          hasSearched: true,
          error: error instanceof Error ? error.message : '予期しないエラーが発生しました',
        }));
      }
    });
  }, []);

  const clear = useCallback(() => {
    setBuildings([]);
    setState(INITIAL_STATE);
  }, []);

  const updateFilters = useCallback((partialFilters: Partial<SearchFilters>) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...partialFilters,
      },
    }));
  }, []);

  const currentState = useMemo(
    () => ({
      ...state,
      isLoading: isPending,
    }),
    [state, isPending]
  );

  return {
    buildings,
    state: currentState,
    search,
    clear,
    updateFilters,
  };
}

export default useBuildingSearch;
