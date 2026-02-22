'use client';

import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '@/lib/constants';

export type BreakpointKey = keyof typeof BREAKPOINTS;

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Legacy browsers (Safari 13 and earlier)
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [query]);

  return matches;
}

export function useBreakpoint(breakpoint: BreakpointKey): boolean {
  const width = BREAKPOINTS[breakpoint];
  return useMediaQuery(`(min-width: ${width}px)`);
}

export function useBreakpointDown(breakpoint: BreakpointKey): boolean {
  const width = BREAKPOINTS[breakpoint];
  return useMediaQuery(`(max-width: ${width - 1}px)`);
}

export function useBreakpointBetween(min: BreakpointKey, max: BreakpointKey): boolean {
  const minWidth = BREAKPOINTS[min];
  const maxWidth = BREAKPOINTS[max];
  return useMediaQuery(`(min-width: ${minWidth}px) and (max-width: ${maxWidth - 1}px)`);
}

export function useDeviceType() {
  const isMobile = useBreakpointDown('MD');
  const isTablet = useBreakpointBetween('MD', 'LG');
  const isDesktop = useBreakpoint('LG');

  return {
    isMobile,
    isTablet,
    isDesktop,
  };
}

export default useMediaQuery;
