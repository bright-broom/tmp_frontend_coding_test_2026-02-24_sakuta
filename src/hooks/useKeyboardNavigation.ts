import { useCallback, useEffect, useRef } from 'react';

interface UseKeyboardNavigationOptions<T> {
  items: T[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onActivate?: (index: number) => void;
  orientation?: 'vertical' | 'horizontal';
  loop?: boolean;
  enabled?: boolean;
}

/**
 * Hook for keyboard navigation in lists
 */
export function useKeyboardNavigation<T>({
  items,
  selectedIndex,
  onSelect,
  onActivate,
  orientation = 'vertical',
  loop = true,
  enabled = true,
}: UseKeyboardNavigationOptions<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || items.length === 0) return;

      const isVertical = orientation === 'vertical';
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';

      switch (event.key) {
        case prevKey: {
          event.preventDefault();
          let newIndex = selectedIndex - 1;
          if (newIndex < 0) {
            newIndex = loop ? items.length - 1 : 0;
          }
          onSelect(newIndex);
          break;
        }
        case nextKey: {
          event.preventDefault();
          let newIndex = selectedIndex + 1;
          if (newIndex >= items.length) {
            newIndex = loop ? 0 : items.length - 1;
          }
          onSelect(newIndex);
          break;
        }
        case 'Home': {
          event.preventDefault();
          onSelect(0);
          break;
        }
        case 'End': {
          event.preventDefault();
          onSelect(items.length - 1);
          break;
        }
        case 'Enter':
        case ' ': {
          if (onActivate && selectedIndex >= 0) {
            event.preventDefault();
            onActivate(selectedIndex);
          }
          break;
        }
      }
    },
    [items.length, selectedIndex, onSelect, onActivate, orientation, loop, enabled]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  return {
    containerRef,
    getItemProps: (index: number) => ({
      tabIndex: index === selectedIndex ? 0 : -1,
      'aria-selected': index === selectedIndex,
      role: 'option',
    }),
  };
}

/**
 * Hook for keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    enabled?: boolean;
  } = {}
) {
  const { ctrl = false, shift = false, alt = false, meta = false, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt &&
        event.metaKey === meta
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback, ctrl, shift, alt, meta, enabled]);
}
