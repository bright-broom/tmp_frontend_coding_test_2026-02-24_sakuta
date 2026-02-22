'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Building, SelectionState } from '@/types';

export interface UseBuildingSelectionReturn {
  state: SelectionState;
  selectedBuilding: Building | null;
  detailBuilding: Building | null;
  select: (id: string) => void;
  deselect: () => void;
  showDetail: (id: string) => void;
  hideDetail: () => void;
  isSelected: (id: string) => boolean;
}

export function useBuildingSelection(buildings: Building[]): UseBuildingSelectionReturn {
  const [state, setState] = useState<SelectionState>({
    selectedId: null,
    detailId: null,
  });

  const selectedBuilding = useMemo(() => {
    if (!state.selectedId) return null;
    return buildings.find((b) => b.id === state.selectedId) || null;
  }, [buildings, state.selectedId]);

  const detailBuilding = useMemo(() => {
    if (!state.detailId) return null;
    return buildings.find((b) => b.id === state.detailId) || null;
  }, [buildings, state.detailId]);

  const select = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedId: prev.selectedId === id ? null : id,
    }));
  }, []);

  const deselect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedId: null,
    }));
  }, []);

  const showDetail = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      detailId: id,
    }));
  }, []);

  const hideDetail = useCallback(() => {
    setState((prev) => ({
      ...prev,
      detailId: null,
    }));
  }, []);

  const isSelected = useCallback(
    (id: string) => state.selectedId === id,
    [state.selectedId]
  );

  return {
    state,
    selectedBuilding,
    detailBuilding,
    select,
    deselect,
    showDetail,
    hideDetail,
    isSelected,
  };
}

export default useBuildingSelection;
