import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from '@/hooks/useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('debounces value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('cancels previous timeout on rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    act(() => {
      jest.advanceTimersByTime(250);
    });

    rerender({ value: 'third' });
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Should still be 'first' because timeout was reset
    expect(result.current).toBe('first');

    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Now it should be 'third'
    expect(result.current).toBe('third');
  });
});

describe('useDebouncedCallback', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('debounces callback execution', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current('arg1');
      result.current('arg2');
      result.current('arg3');
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg3');
  });

  it('uses latest callback reference', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, 500),
      { initialProps: { cb: callback1 } }
    );

    act(() => {
      result.current();
    });

    rerender({ cb: callback2 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});
