import { renderHook } from '@testing-library/react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

describe('useFocusTrap', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('returns a ref object', () => {
    const { result } = renderHook(() => useFocusTrap(false));
    expect(result.current).toHaveProperty('current');
  });

  it('does not trap focus when inactive', () => {
    const { result } = renderHook(() => useFocusTrap(false));
    expect(result.current.current).toBeNull();
  });

  it('returns ref that can be attached to an element', () => {
    const { result } = renderHook(() => useFocusTrap<HTMLDivElement>(true));

    const div = document.createElement('div');
    const button = document.createElement('button');
    div.appendChild(button);
    document.body.appendChild(div);

    expect(result.current).toBeDefined();
  });
});
